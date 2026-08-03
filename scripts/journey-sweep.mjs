/*
 * THE JOURNEY SWEEP.
 *
 * WHY THIS EXISTS. Every check in the gate is PER PAGE: overflow at 360,
 * chevron geometry, card padding, fold position. A defect that only exists in
 * the TRANSITION between two pages is invisible to all of it. Antonio found
 * one by walking the rescue flow on a desktop, 2026-08-03: the content column
 * went 728 -> 580 -> 728 and the left edge jumped 74px right and back. Every
 * one of those pages passed the gate on its own.
 *
 * WHAT IT DOES. Loads every built page and measures the FRAME rather than the
 * components: content width, left edge, distance to the first thing on the
 * page, which chrome is present, heading size, body size, first surface
 * padding. Then it groups by value and prints how many distinct values exist
 * for each. One distinct value is the goal. More than one is either a
 * deliberate decision, in which case it belongs in a comment where the value
 * is set, or it is drift.
 *
 * IT IS NOT IN THE GATE, deliberately. It is a REPORT, not a pass/fail: some
 * differences here are correct (the tunnel has no nav by design) and hard
 * failing on them would just teach everyone to ignore it. Run it before
 * anything ships, read the counts, and justify or fix each one.
 *
 *   node scripts/journey-sweep.mjs 1440
 *   node scripts/journey-sweep.mjs 393
 *
 * Needs a static server on 4630: npx http-server dist -p 4630 -s
 */
import { createRequire } from 'node:module';
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

function pages(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) pages(p, out);
    else if (f.endsWith('.html')) out.push('/' + relative('dist', p));
  }
  return out;
}
const all = pages('dist').sort();
const b = await chromium.launch();
const W = Number(process.argv[2] || 1440);
const ctx = await b.newContext({ viewport: { width: W, height: 1000 } });
const p = await ctx.newPage();
const rows = [];
for (const u of all) {
  await p.goto('http://127.0.0.1:4630' + u, { waitUntil: 'domcontentloaded' });
  const m = await p.evaluate(() => {
    const main = document.querySelector('main') || document.body;
    const r = main.getBoundingClientRect();
    const cs = getComputedStyle(main);
    const inner = Math.round(r.width - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight));
    const left = Math.round(r.x + parseFloat(cs.paddingLeft));
    const first = [...main.children].find(e => e.getBoundingClientRect().height > 0);
    const top = first ? Math.round(first.getBoundingClientRect().top + window.scrollY) : null;
    const h = main.querySelector('h1:not(.sr-only), h2');
    const surf = main.querySelector('.panel, .card, .pad, .moves li, .acc-sec');
    return {
      inner, left, top,
      chrome: (document.querySelector('.site-nav') ? 'nav' : '') + (document.querySelector('.top-bar') ? 'bar' : '') + (document.querySelector('.site-footer') ? '+foot' : ''),
      head: h ? Math.round(parseFloat(getComputedStyle(h).fontSize)) : null,
      body: Math.round(parseFloat(getComputedStyle(document.body).fontSize)),
      surfPad: surf ? getComputedStyle(surf).paddingTop : null,
    };
  });
  rows.push({ u, ...m });
}
await b.close();

const group = (key) => {
  const map = new Map();
  for (const r of rows) {
    const k = String(r[key]);
    if (!map.has(k)) map.set(k, []);
    map.get(k).push(r.u);
  }
  return map;
};
console.log(`\n=== JOURNEY SWEEP @${W}px, ${rows.length} pages ===`);
for (const key of ['inner', 'left', 'top', 'chrome', 'head', 'body', 'surfPad']) {
  const g = group(key);
  const flag = g.size === 1 ? 'ok' : 'XX';
  console.log(`\n${flag} ${key}: ${g.size} distinct`);
  for (const [v, us] of [...g.entries()].sort((a, b) => b[1].length - a[1].length)) {
    console.log(`      ${String(v).padEnd(14)} ${String(us.length).padStart(3)} pages   e.g. ${us.slice(0, 2).join(', ')}`);
  }
}
process.exit(0);
