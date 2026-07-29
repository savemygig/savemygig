/*
 * ONE-OFF MIGRATION (2026-07-28): generates src/data/emergency-tree.js from
 * the legacy hand-wired /protocol screens + the approved new topology
 * (emergency-architecture-plan-2026-07-28: five doors, time demoted,
 * shared rebuild chain, new frozen door).
 *
 * Copy is extracted VERBATIM and in original block order. Only hrefs are
 * rewired. Kept in the repo as the migration record; the generated file is
 * the source of truth from here on.
 *
 * Run: node scripts/gen-tree.mjs   (writes src/data/emergency-tree.js)
 */
import { readFile, writeFile } from 'node:fs/promises';

const SRC = 'src/pages/protocol';

// old route (relative to /protocol/) → new node id. null = not migrated.
const MAP = {
  'critical/symptom': 'music/start',
  'critical/folder-view': 'music/folder',
  'critical/have-computer': 'shared/computer',
  'critical/usb-check': 'shared/usb-check',
  'critical/usb-dead': 'shared/usb-dead',
  'critical/no-laptop': 'usb/booth',
  'critical/no-laptop-2': 'usb/restart',
  'critical/no-laptop-3': 'shared/survival',
  'critical/risk': 'rebuild/risk',
  'critical/second-usb': 'rebuild/second-usb',
  'critical/second-usb-format': 'rebuild/second-format',
  'critical/second-usb-copy': 'rebuild/second-copy',
  'critical/no-erase': 'rebuild/no-erase',
  'critical/copy': 'rebuild/copy',
  'critical/erase': 'rebuild/erase',
  'critical/format': 'rebuild/format',
  'critical/copy-back': 'rebuild/copy-back',
  'critical/load': 'rebuild/load',
  'critical/fallback': 'rebuild/fallback',
  'no-sound/index': 'sound/start',
  'no-sound/channel': 'sound/channel',
  'no-sound/channel-2': 'sound/channel-2',
  'no-sound/channel-3': 'sound/channel-3',
  'no-sound/master': 'sound/master',
  'no-sound/master-2': 'sound/master-2',
  'no-sound/house': 'sound/house',
  'no-sound/phones': 'sound/phones',
  'no-sound/phones-2': 'sound/phones-2',
  'no-sound/wrong': 'sound/wrong',
  'no-sound/wrong-2': 'sound/wrong-2',
  'no-sound/fallback': 'sound/fallback',
  'quick-fix': 'export/start',
  'quick-fix/no-computer': 'export/find',
  'quick-fix/usb-check': 'export/usb-check',
  'quick-fix/dead-checks': 'export/dead-checks',
  'quick-fix/rekordbox-check': 'export/rb-check',
  'quick-fix/backup': 'export/backup',
  'quick-fix/repair': 'export/repair',
  'quick-fix/format': 'export/format',
  'quick-fix/export': 'export/export',
  'quick-fix/fresh-usb': 'export/fresh',
  'quick-fix/verify': 'export/verify',
};

// href rewires that are TOPOLOGY changes, applied after MAP translation.
const REWIRE = {
  // old cross-jumps into the dropped /protocol/critical hub → the four moves
  '/protocol/critical': 'usb/moves',
};

const hrefToTarget = (href) => {
  if (REWIRE[href]) return REWIRE[href];
  const m = href.match(/^\/protocol\/(.+)$/);
  if (!m) return href; // terminal absolute URL (/saved, /files-lost, ...)
  const key = m[1];
  if (MAP[key]) return MAP[key];
  throw new Error(`unmapped protocol href: ${href}`);
};

const unesc = (s) => s.replace(/\\'/g, "'");

function parseChoice(src) {
  const stepM = src.match(/<Choice\s+step="([^"]+)"/);
  const step = stepM ? stepM[1] : null;
  const options = [];
  for (const key of ['a', 'b', 'c', 'd']) {
    const idx = src.search(new RegExp(`\\b${key}=\\{\\{`));
    if (idx === -1) continue;
    // balance braces from the '{{'
    let i = src.indexOf('{{', idx) + 2;
    let depth = 2;
    let body = '';
    while (depth > 0 && i < src.length) {
      const ch = src[i];
      if (ch === '{') depth++;
      if (ch === '}') depth--;
      if (depth > 0) body += ch;
      i++;
    }
    const f = (name) => {
      const m = body.match(new RegExp(`${name}:\\s*'((?:[^'\\\\]|\\\\.)*)'`));
      return m ? unesc(m[1]) : undefined;
    };
    const o = { label: f('label'), to: hrefToTarget(f('href')) };
    const desc = f('desc');
    const event = f('event');
    if (desc) o.desc = desc;
    if (event) o.event = event;
    const dataM = body.match(/data:\s*\{([\s\S]*?)\}/);
    if (dataM) {
      const data = {};
      for (const m of dataM[1].matchAll(/(\w+):\s*'([^']*)'/g)) data[m[1]] = m[2];
      o.data = data;
    }
    options.push(o);
  }
  return { step, options };
}

const stripStyle = (s) => s.replace(/\s*(style|class)="[^"]*"/g, '');
const clean = (s) => s.replace(/\s+/g, ' ').trim();

function parseScreen(src) {
  const tun = src.match(/<Tunnel\s+title="([^"]+)"\s+status="([^"]+)"(\s+red)?/);
  if (!tun) throw new Error('no Tunnel tag');
  const meta = {
    title: tun[1].replace(/\s*\|\s*Save My Gig!?\s*$/i, ''),
    status: tun[2],
    red: Boolean(tun[3]),
  };
  const slot = src.slice(src.indexOf('>', src.indexOf('<Tunnel')) + 1, src.lastIndexOf('</Tunnel>'));

  const pats = [
    ['label', /<div class="step-label">([\s\S]*?)<\/div>/g],
    ['h2', /<h[12]([^>]*)>([\s\S]*?)<\/h[12]>/g],
    ['dim', /<p class="dim"[^>]*>([\s\S]*?)<\/p>/g],
    ['assumed', /<p class="assumed"[^>]*>([\s\S]*?)<\/p>/g],
    ['check', /<ul class="checklist">([\s\S]*?)<\/ul>/g],
    ['alert', /<div class="alert-card"[^>]*>\s*<div style="font-size:20px"[^>]*>([\s\S]*?)<\/div>\s*<div>([\s\S]*?)<\/div>\s*<\/div>/g],
    ['note', /<p class="tunnel-note"[^>]*>([\s\S]*?)<\/p>/g],
    ['details', /<details class="move-more[^"]*"[^>]*>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g],
    ['question', /<p class="question">([\s\S]*?)<\/p>/g],
    ['draft', /<div class="review-flag">/g],
  ];
  const found = [];
  for (const [t, re] of pats) {
    for (const m of slot.matchAll(re)) found.push({ t, i: m.index, m });
  }
  found.sort((a, b) => a.i - b.i);

  const node = { ...meta, blocks: [] };
  for (const { t, m } of found) {
    if (t === 'label') node.label = clean(m[1]);
    else if (t === 'h2') {
      node.heading = clean(m[2].replace(/<span class="accent">([\s\S]*?)<\/span>/g, '<span class="accent">$1</span>'));
      const cls = (m[1].match(/class="([^"]*)"/) || [])[1];
      if (cls) node.headingClass = cls;
    } else if (t === 'question') node.question = clean(m[1]);
    else if (t === 'draft') node.draft = true;
    else if (t === 'check') {
      const items = [...m[1].matchAll(/<li>([\s\S]*?)<\/li>/g)].map((x) => clean(x[1]));
      node.blocks.push({ t: 'check', items });
    } else if (t === 'alert') node.blocks.push({ t: 'alert', emoji: clean(m[1]), html: clean(m[2]) });
    else if (t === 'details') node.blocks.push({ t: 'details', summary: clean(m[1]), html: clean(stripStyle(m[2])) });
    else if (t === 'dim' || t === 'note' || t === 'assumed') node.blocks.push({ t, html: clean(m[1]) });
  }
  const { step, options } = parseChoice(slot);
  if (step) node.step = step;
  node.options = options;
  return node;
}

const TREE = {};

for (const [route, id] of Object.entries(MAP)) {
  const file =
    route === 'quick-fix' ? `${SRC}/quick-fix.astro` :
    route === 'no-sound/index' ? `${SRC}/no-sound/index.astro` :
    `${SRC}/${route}.astro`;
  const src = await readFile(file, 'utf-8');
  TREE[id] = parseScreen(src);
}

/* ---------- hand-authored nodes: the new topology ---------- */

TREE['usb/start'] = {
  title: 'USB Not Recognized', status: 'Critical_Path', red: true,
  label: 'Diagnostic',
  heading: 'The player does not see the drive',
  blocks: [
    { t: 'assumed', html: 'You have already reseated it and tried the other deck.' },
  ],
  question: 'Does any other player in the booth read the drive?',
  step: 'usb_start',
  options: [
    { label: 'YES, ANOTHER PLAYER READS IT', to: 'usb/link', desc: 'Then you can be playing in under a minute.' },
    { label: 'NO, NOTHING READS IT', to: 'usb/time', desc: 'We pick the route that fits your clock.' },
  ],
};

TREE['usb/link'] = {
  title: 'Play Over LINK', status: 'Critical · Fastest fix', red: true,
  label: 'Try this first',
  heading: 'Load from the player that sees it',
  blocks: [
    { t: 'dim', html: 'If the booth is linked over PRO DJ LINK, any player can browse and load from a drive that is physically in another one. Your own port being dead stops mattering.' },
    { t: 'check', items: [
      'Press <strong>SOURCE</strong> on the player you want to play on.',
      'Select the other player’s USB (the LINK / remote device).',
      'Browse and load your track from there.',
    ] },
  ],
  question: 'Did it load?',
  step: 'usb_link',
  options: [
    { label: 'YES, I AM PLAYING', to: '/saved?path=critical&branch=link', event: 'outcome_reached', data: { outcome: 'saved', path: 'critical' } },
    { label: 'NO, STILL NOTHING', to: 'usb/time' },
  ],
};

TREE['usb/time'] = {
  title: 'How Long Until You Are On?', status: 'Critical_Path', red: true,
  label: 'Decision point',
  heading: 'Goal right now: play a set.',
  blocks: [
    { t: 'dim', html: 'Not fix the USB. That comes after the gig.' },
  ],
  question: 'How long until you are on?',
  step: 'usb_time',
  neutral: true,
  options: [
    { label: 'UNDER AN HOUR', to: 'usb/moves', desc: 'The four moves. A list, not questions.' },
    { label: 'I HAVE TIME', to: 'shared/computer', desc: 'We fix it properly instead of working around it.' },
  ],
};

TREE['usb/moves'] = {
  title: 'The Four Moves', status: 'Critical · Do this now', red: true,
  srHeading: 'Four moves, in order, until it plays',
  heading: 'Four moves you have not tried.',
  moves: true,
  blocks: [],
  step: 'runlist',
  options: [
    { label: 'I AM PLAYING', to: '/saved?path=critical&branch=runlist', event: 'outcome_reached', data: { outcome: 'saved', path: 'critical' } },
    { label: 'NOTHING WORKED, AND I HAVE TIME', to: 'shared/computer', desc: 'Step by step diagnosis, one question at a time.', tone: 'neutral', event: 'step_completed', data: { step: 'runlist_to_tree' } },
  ],
};

TREE['frozen/start'] = {
  title: 'Frozen Player', status: 'Critical_Path', red: true,
  label: 'Diagnostic',
  heading: 'A frozen screen is not always frozen audio',
  blocks: [
    { t: 'dim', html: 'If a track was playing when it locked up, it will usually keep playing. Nothing gets touched until the room is covered.' },
  ],
  question: 'Is the frozen player live in the mix right now?',
  step: 'frozen_start',
  neutral: true,
  options: [
    { label: 'IT IS PLAYING THE ROOM', to: 'frozen/live', desc: 'We move the room first, restart second.' },
    { label: 'IT IS IDLE, NOT IN THE MIX', to: 'frozen/restart', desc: 'Then it can be restarted without risk.' },
  ],
};

TREE['frozen/live'] = {
  title: 'Keep the Room Playing', status: 'Critical · Live deck', red: true,
  label: 'Step 1 of 2',
  heading: 'Get the music onto another deck first',
  blocks: [
    { t: 'dim', html: 'The frozen player keeps playing for now. The restart happens only when it is no longer carrying the room.' },
    { t: 'check', items: [
      'Leave the frozen player completely alone. No buttons, no USB, no power.',
      'Get the next track ready on another player: its own drive, or your drive over <strong>PRO DJ LINK</strong> if the network still responds.',
      'Take over in the mix from the working deck.',
    ] },
  ],
  question: 'Is another deck carrying the room?',
  step: 'frozen_live',
  options: [
    { label: 'YES, I AM COVERED', to: 'frozen/restart', desc: 'Now the frozen player can be restarted safely.' },
    { label: 'NO, NOTHING ELSE CAN PLAY', to: 'shared/survival', desc: 'Other ways to keep sound in the room.' },
  ],
};

TREE['frozen/restart'] = {
  title: 'Restart the Player', status: 'Critical · Restart', red: true,
  label: 'The restart',
  heading: 'Power-cycle it properly',
  blocks: [
    { t: 'alert', emoji: '⚠️', html: 'Only restart a player that is not carrying the room. If it is still playing, go back and hand the room to another deck first.' },
    { t: 'check', items: [
      'Press <strong>USB STOP</strong> if it responds, and wait for the light to stop blinking.',
      'Power off. Wait twenty seconds.',
      'Power on and let it boot fully before touching anything.',
      'Reinsert the drive and give it thirty seconds. Big libraries mount slowly.',
    ] },
  ],
  question: 'Is the player back and reading your drive?',
  step: 'frozen_restart',
  options: [
    { label: 'YES, I AM PLAYING', to: '/saved?path=frozen&branch=restart', event: 'outcome_reached', data: { outcome: 'saved', path: 'frozen' } },
    { label: 'NO, STILL LOCKED OR NOT READING', to: 'frozen/link' },
  ],
};

TREE['frozen/link'] = {
  title: 'Take It Off the Network', status: 'Critical · Link', red: true,
  label: 'Last isolation',
  heading: 'Isolate it from the booth',
  blocks: [
    { t: 'dim', html: 'When more than one player misbehaves at once, the LINK network is a suspect. A player that freezes on the network can run fine standalone.' },
    { t: 'check', items: [
      'Unplug the <strong>LINK</strong> cable from the frozen player only. Leave the rest of the booth alone.',
      'Restart it once more, standalone.',
      'Play from its own USB port.',
    ] },
  ],
  question: 'Playing on any deck now?',
  step: 'frozen_link',
  options: [
    { label: 'YES, I AM PLAYING', to: '/saved?path=frozen&branch=isolate', event: 'outcome_reached', data: { outcome: 'saved', path: 'frozen' } },
    { label: 'NO, STILL NOTHING', to: 'shared/survival', desc: 'We get you playing another way.' },
  ],
};

/* ---------- post-migration adjustments ---------- */

// The export door entry: retitled from the old time-based "Quick Fix
// Protocol (1-3 hours)" to the symptom the DJ actually has. The 1-3h alert
// dies with the time-triage model (Antonio's ruling: time only when it
// changes the next action).
Object.assign(TREE['export/start'], {
  title: 'rekordbox Export Failed',
  status: 'Export_Fix',
  heading: 'EXPORT <span class="accent">RESCUE</span>',
});
TREE['export/start'].blocks = [
  { t: 'dim', html: 'A failed export gets fixed at a computer, properly, so it does not fail again in the booth. Minutes from playing with no computer? Take the booth workarounds instead.' },
];

// The old no-sound fallback "nothing worked" exit carried no outcome event.
// Every terminal exit now reports one.
const nsf = TREE['sound/fallback'].options.find((o) => o.to.startsWith('/feedback'));
if (nsf) { nsf.event = 'outcome_reached'; nsf.data = { outcome: 'handoff', path: 'no_sound' }; }

// Verify every internal target resolves.
for (const [id, node] of Object.entries(TREE)) {
  for (const o of node.options) {
    if (!o.to.startsWith('/') && !TREE[o.to]) throw new Error(`${id}: dangling target ${o.to}`);
  }
}

const DOORS = ['usb/start', 'music/start', 'sound/start', 'frozen/start', 'export/start'];

const header = `/*
 * THE EMERGENCY TREE. Single source of truth for the rescue flow.
 *
 * Generated 2026-07-28 by scripts/gen-tree.mjs from the legacy /protocol
 * screens (copy preserved verbatim) + the approved architecture
 * (claude/emergency-architecture-plan-2026-07-28.md in project memory):
 * five doors, time demoted into branches, shared rebuild chain, new frozen
 * door. From now on EDIT THIS FILE, not the generator.
 *
 * Node model: { title, status, red, label?, heading, headingClass?,
 *   blocks: [ {t:'dim'|'assumed'|'note', html} | {t:'check', items[]} |
 *             {t:'alert', emoji, html} | {t:'details', summary, html} ],
 *   question?, step?, neutral?, draft?, moves?,
 *   options: [ {label, to, desc?, tone?, event?, data?} ] }
 * 'to' is a node id (rendered at /protocol/<id>) or an absolute URL.
 * Rendered by src/pages/protocol/[...slug].astro. Integrity is enforced by
 * scripts/check-tree.mjs in the gate: unique ids, resolvable targets, all
 * nodes reachable from a door, every path reaches a terminal, 2-4 options,
 * depth budget, sw.js precache in sync.
 */
`;

const out = `${header}
export const DOORS = ${JSON.stringify(DOORS)};

export const TREE = ${JSON.stringify(TREE, null, 2)};
`;

await writeFile('src/data/emergency-tree.js', out);
console.log(`emergency-tree.js written: ${Object.keys(TREE).length} nodes`);
