/*
 * Extracts the CURRENT emergency protocol from source and emits JSON.
 * The old decision-tree PDF is stale: today removed a screen, rerouted a
 * branch and replaced the under-60-minutes path with the four moves.
 *
 * Run: node scripts/extract-protocol.mjs > /tmp/protocol.json
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = 'src/pages/protocol';

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.name.endsWith('.astro')) out.push(p);
  }
  return out;
}

const strip = (s) => s
  .replace(/<[^>]+>/g, '')
  .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&rarr;/g, '->').replace(/&quot;/g, '"')
  .replace(/\s+/g, ' ').trim();

// Astro frontmatter and HTML comments hold engineering notes, not DJ-facing
// copy. They must not leak into a document meant for reviewing what DJs read.
const body = (src) => src
  .replace(/^---[\s\S]*?^---/m, '')
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace(/<style[\s\S]*?<\/style>/g, '');

const routeOf = (file) =>
  '/' + relative('src/pages', file).replace(/\.astro$/, '').replace(/\/index$/, '');

function grabChoice(src) {
  // <Choice ... a={{...}} b={{...}} c={{...}} d={{...}} />
  const m = src.match(/<Choice[\s\S]*?\/>/);
  if (!m) return [];
  const out = [];
  for (const key of ['a', 'b', 'c', 'd']) {
    const re = new RegExp(`\\b${key}=\\{\\{([\\s\\S]*?)\\}\\}`);
    const seg = m[0].match(re);
    if (!seg) continue;
    const href = (seg[1].match(/href:\s*'([^']*)'/) || [])[1] || '';
    const label = (seg[1].match(/label:\s*'((?:[^'\\]|\\.)*)'/) || [])[1] || '';
    const desc = (seg[1].match(/desc:\s*'((?:[^'\\]|\\.)*)'/) || [])[1] || '';
    if (href) out.push({ key, href, label: label.replace(/\\'/g, "'"), desc: desc.replace(/\\'/g, "'") });
  }
  return out;
}

function grabPads(src) {
  // Hand-written <a class="pad ..."> grids (used on hub screens).
  const out = [];
  const re = /<a\s+href="([^"]+)"[^>]*class="pad[^"]*"[\s\S]*?<div class="pad-title">([\s\S]*?)<\/div>([\s\S]*?)<\/a>/g;
  let m;
  while ((m = re.exec(src))) {
    const d = m[3].match(/<div class="pad-desc">([\s\S]*?)<\/div>/);
    out.push({ key: 'pad', href: m[1], label: strip(m[2]), desc: d ? strip(d[1]) : '' });
  }
  return out;
}

// /protocol/critical/now renders from src/data/runlist.js, so reading its
// .astro source yields template expressions, not the words a DJ sees. Pull the
// real content in. Anything else that becomes data-driven needs the same.
const RUNLIST = await import('../src/data/runlist.js').catch(() => null);

const files = (await walk(ROOT)).sort();
const screens = [];

for (const f of files) {
  const raw = await readFile(f, 'utf-8');
  const b = body(raw);

  const title = (raw.match(/<Tunnel[^>]*title="([^"]*)"/) || [])[1] || '';
  const status = (raw.match(/<Tunnel[^>]*status="([^"]*)"/) || [])[1] || '';
  const h2 = (b.match(/<h2[^>]*>([\s\S]*?)<\/h2>/) || [])[1] || '';
  const question = (b.match(/<p class="question"[^>]*>([\s\S]*?)<\/p>/) || [])[1] || '';
  const stepLabel = (b.match(/<div class="step-label"[^>]*>([\s\S]*?)<\/div>/) || [])[1] || '';
  const isDraft = /class="review-flag"/.test(b);

  const steps = [...b.matchAll(/<li>([\s\S]*?)<\/li>/g)].map((m) => strip(m[1])).filter(Boolean);
  const warns = [...b.matchAll(/<div class="alert-card"[\s\S]*?<div>([\s\S]*?)<\/div>\s*<\/div>/g)]
    .map((m) => strip(m[1])).filter(Boolean);
  const details = [...b.matchAll(/<summary>([\s\S]*?)<\/summary>/g)].map((m) => strip(m[1]));

  let options = grabChoice(b);
  if (!options.length) options = grabPads(b);

  const route = routeOf(f);

  // Swap the template placeholders for the real copy.
  if (route === '/protocol/critical/now' && RUNLIST) {
    steps.length = 0;
    for (const s of RUNLIST.RUNLIST) steps.push(`${s.verb} - ${s.action}`);
    details.length = 0;
    for (const s of RUNLIST.RUNLIST) details.push(`${s.verb}: ${s.detail}`);
    details.push(`${RUNLIST.RUNLIST_LAST_RESORT.title}: ${RUNLIST.RUNLIST_LAST_RESORT.body}`);
    warns.length = 0;
    warns.push(RUNLIST.RUNLIST_NEVER);
    if (RUNLIST.RUNLIST_HEAD) steps.unshift(`(context) ${RUNLIST.RUNLIST_HEAD}`);
    if (RUNLIST.RUNLIST_ASSUMED) steps.unshift(`(assumed) ${RUNLIST.RUNLIST_ASSUMED}`);
  }

  screens.push({
    route,
    file: f,
    title: strip(title).replace(/\s*\|\s*Save My Gig!?$/, ''),
    status: strip(status),
    heading: strip(h2),
    stepLabel: strip(stepLabel),
    question: strip(question),
    steps, warns, details,
    isDraft,
    options: options.map((o) => ({ ...o, label: strip(o.label), desc: strip(o.desc) })),
  });
}

// Reachability from the two entry symptoms, so orphans are visible.
const byRoute = new Map(screens.map((s) => [s.route, s]));
const seen = new Set();
const queue = ['/protocol/critical/now', '/protocol/no-sound', '/protocol/critical',
  '/protocol/quick-fix', '/protocol/full-recovery'];
while (queue.length) {
  const r = queue.shift();
  if (seen.has(r) || !byRoute.has(r)) continue;
  seen.add(r);
  for (const o of byRoute.get(r).options) queue.push(o.href.split('?')[0]);
}
for (const s of screens) s.reachable = seen.has(s.route);

console.log(JSON.stringify({ screens }, null, 2));
