/*
 * EMERGENCY TREE INTEGRITY (gate check, added 2026-07-28 with the
 * data-driven tree). Proves structurally what the hand-wired screens could
 * only hope: no dead ends, everything reachable, every path ends in an
 * outcome, the one-question rule, a depth budget, and a service-worker
 * precache that cannot drift from the tree.
 */
import { readFile } from 'node:fs/promises';
import { TREE, DOORS } from '../src/data/emergency-tree.js';

const fails = [];
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!cond) fails.push(name);
};

const ids = Object.keys(TREE);
const TERMINAL_PREFIXES = ['/saved', '/files-lost', '/feedback', '/prepare'];
const isTerminal = (to) => TERMINAL_PREFIXES.some((p) => to.startsWith(p));

// 1. Doors exist.
ok('all five doors exist', DOORS.every((d) => TREE[d]), DOORS.join(', '));

// 2. Option counts: 2-4 everywhere (one decision per screen, never a wall).
const badCounts = ids.filter((id) => TREE[id].options.length < 2 || TREE[id].options.length > 4);
ok('every node offers 2-4 options', badCounts.length === 0, badCounts.join(', ') || `${ids.length} nodes`);

// 3. One-question rule: a node has at most ONE question, and pads always exist.
const multiQ = ids.filter((id) => {
  const n = TREE[id];
  const qInBlocks = n.blocks.filter((b) => b.t === 'question').length;
  return qInBlocks > 0; // questions live ONLY in node.question, never in blocks
});
ok('one question per screen (structural)', multiQ.length === 0, multiQ.join(', ') || 'question field only');

// 4. Every internal target resolves.
const dangling = [];
for (const id of ids) for (const o of TREE[id].options) {
  if (!o.to.startsWith('/') && !TREE[o.to]) dangling.push(`${id} -> ${o.to}`);
  if (o.to.startsWith('/protocol/')) dangling.push(`${id} -> ${o.to} (absolute into tree: use node id)`);
}
ok('all targets resolve', dangling.length === 0, dangling.join('; ') || 'no dangling edges');

// 5. Every node reachable from a door.
const seen = new Set();
const stack = [...DOORS];
while (stack.length) {
  const id = stack.pop();
  if (seen.has(id) || !TREE[id]) continue;
  seen.add(id);
  for (const o of TREE[id].options) if (!o.to.startsWith('/')) stack.push(o.to);
}
const orphans = ids.filter((id) => !seen.has(id));
ok('every node reachable from a door', orphans.length === 0, orphans.join(', ') || `${seen.size}/${ids.length}`);

// 6. Every node can reach a terminal (no dead ends anywhere in the graph).
const canExit = new Set();
let grew = true;
while (grew) {
  grew = false;
  for (const id of ids) {
    if (canExit.has(id)) continue;
    if (TREE[id].options.some((o) => isTerminal(o.to) || (!o.to.startsWith('/') && canExit.has(o.to)))) {
      canExit.add(id);
      grew = true;
    }
  }
}
const deadEnds = ids.filter((id) => !canExit.has(id));
ok('every node reaches an outcome', deadEnds.length === 0, deadEnds.join(', ') || 'no dead ends');

// 7. Depth budget: from each door, the nearest actionable screen (a node with
// steps, or a terminal exit) is within 6 taps (root pad = tap 1).
const isActionable = (id) => TREE[id].blocks.some((b) => b.t === 'check') || TREE[id].moves || TREE[id].options.some((o) => isTerminal(o.to));
for (const door of DOORS) {
  let depth = null;
  const q = [[door, 1]];
  const v = new Set();
  while (q.length) {
    const [id, d] = q.shift();
    if (v.has(id)) continue;
    v.add(id);
    if (isActionable(id)) { depth = d; break; }
    for (const o of TREE[id].options) if (!o.to.startsWith('/')) q.push([o.to, d + 1]);
  }
  ok(`door ${door}: action within 6 taps`, depth !== null && depth <= 6, `first action at tap ${depth}`);
}

// 8. Every terminal exit carries an outcome event.
const silentExits = [];
for (const id of ids) for (const o of TREE[id].options) {
  if (isTerminal(o.to) && o.event !== 'outcome_reached') silentExits.push(`${id} -> ${o.to}`);
}
ok('every terminal exit reports an outcome', silentExits.length === 0, silentExits.join('; ') || 'all instrumented');

// 10. Every option has a visible label. Added 2026-08-02 after the clean-sheet
// audit found 12 unlabeled options rendering as BLANK BUTTONS, including the
// success button on rebuild/load, live since launch. The renderer prints
// o.label with no fallback, so a missing label is an invisible answer.
const unlabeled = [];
for (const id of ids) for (const o of TREE[id].options) {
  if (!o.label || !o.label.trim()) unlabeled.push(`${id} -> ${o.to}`);
}
ok('every option has a visible label', unlabeled.length === 0, unlabeled.join('; ') || 'all labeled');

// 9. sw.js precache contains every tree path (offline rescue can't drift).
const sw = await readFile('public/sw.js', 'utf-8');
const missing = ids.filter((id) => !sw.includes(`'/protocol/${id}'`));
ok('sw.js precaches the whole tree', missing.length === 0, missing.join(', ') || `${ids.length} paths`);

console.log('');
if (fails.length) {
  console.error(`Tree check FAILED: ${fails.length} failure(s)`);
  process.exit(1);
}
console.log('Tree check PASS');
