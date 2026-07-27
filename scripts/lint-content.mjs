// Content lint for Save My Gig. Runs on the BUILT HTML (what actually ships),
// so it catches copy that comes from data files and components too.
// Run: npm run build && node scripts/lint-content.mjs
//
// Enforces the standing rules:
//  - No em or en dashes in visible copy.
//  - Never claim "no ads" (behaviour, not a promise).
//  - No version/product SNAPSHOTS that go stale. State a threshold or name the
//    models instead. Volatile facts live in src/data/facts.js.
//  - No CONDESCENSION. This site is for working DJs. They may be early in their
//    career, but they are professionals, the way a Formula Ford driver is a
//    professional driver. You do not tell them to stay calm and you do not tell
//    them to try the other deck. Antonio's rule, and it is a positioning rule,
//    not a style preference: copy pitched at a rookie tells every real DJ that
//    this site was built by people who have never stood in a booth, and we lose
//    them on that line and never get them back.
// <script> and <style> blocks and HTML comments are stripped first, so code
// comments do not trip the lint; only rendered copy is checked.
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.argv[2] || 'dist';
const SKIP = (p) => p.includes('/preview/') || p.endsWith('/lab.html');

const RULES = [
  { name: 'em/en dash',            re: /[—–]/g },
  { name: '"no ads" claim',        re: /\bno ads?\b|\bad-free\b/gi },
  { name: 'snapshot: latest',      re: /\blatest\b/gi },
  { name: 'snapshot: newest',      re: /\bnewest\b/gi },
  { name: 'snapshot: flagship',    re: /\bflagship\b/gi },
  { name: 'snapshot: current version/firmware/release', re: /current (version|firmware|release)/gi },
  { name: 'snapshot: at the time of writing', re: /at the time of writing/gi },
  { name: 'snapshot: as of <date>', re: /\bas of \d/gi },

  // Condescension. Every one of these has actually shipped on this site.
  { name: 'condescending: telling a pro to calm down', re: /\bstay calm\b|\bdon'?t panic\b|\bdo not panic\b|\bbefore you panic\b|\bbefore panicking\b|\bstop panicking\b|\bpanic not required\b|\bfirst,? breathe\b|\btake a (deep )?breath\b|\brelax,\b/gi },
  // Reflex-tier instructions. A working DJ has done these before they open a
  // website. If one is genuinely needed, name it under a `.assumed` line as
  // something we ASSUME is done, do not print it as a step.
  { name: 'condescending: reflex-tier step', re: /(pull|take) (the|your) (usb|drive|stick) out,? (and )?(wait|count)|push it back in firmly|wipe the usb tip/gi },
];

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ');
}
const files = (await walk(ROOT)).filter((p) => !SKIP(p));
const hits = [];
for (const f of files) {
  const text = visibleText(await readFile(f, 'utf-8'));
  for (const r of RULES) {
    const m = text.match(r.re);
    if (m) hits.push(`${f}: ${r.name} -> ${[...new Set(m)].slice(0, 4).join(', ')}`);
  }
}
if (hits.length) { console.log('CONTENT LINT FAIL:\n' + hits.join('\n')); process.exit(1); }
console.log(`Content lint PASS (${files.length} pages, 0 violations)`);
