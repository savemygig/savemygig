#!/usr/bin/env node
/*
 * BRAND NEUTRALITY. Antonio, 2026-08-08, and this is positioning, not style:
 *
 *   "Save My Gig is NOT a Pioneer DJ website. ... The site should feel like an
 *    independent DJ technical intelligence platform, not a manufacturer
 *    ecosystem. ... Never introduce Pioneer as the default comparison point
 *    simply because the current database contains many Pioneer products."
 *
 * WHAT HAD ACTUALLY HAPPENED by the time he said it. The Technics hub opened by
 * telling the reader what question Pioneer owners get asked. The Allen & Heath
 * hub defined its mixers against "the rules of a CDJ booth". Both hub footers
 * offered "Playing on Pioneer gear instead?". The related-guides engine put
 * "CDJ error E-8302" on a mixer with no PRO DJ LINK and the rekordbox library
 * reference on a turntable with no USB port. Every one of those was written as
 * a helpful orientation and read, in aggregate, as a Pioneer site with guests.
 *
 * TWO ASSERTIONS, both against the BUILT HTML because positioning is what the
 * reader sees:
 *
 * 1. FOREIGN BRAND MENTIONS on a brand page are allowed ONLY inside the
 *    Related equipment block (.rel-block), which names genuinely paired
 *    hardware: an SL-1200MK7 really does sit beside a DJM-900NXS2, and Antonio
 *    confirmed that pairing himself. Everywhere else in <main>, a page about
 *    one manufacturer's equipment does not name another manufacturer.
 *    Exception: a vendor's own published words may name third parties (Allen &
 *    Heath's DVS support list includes rekordbox), so `allowInProse` exists per
 *    brand for the specific terms their documentation forces, and every use of
 *    it must be justified here.
 *
 * 2. NO CORRECTION LANGUAGE in reader-facing copy. "This page previously
 *    said", "more than this site used to say". Fix the fact, keep the history
 *    in commit messages and code comments where it belongs. The reader gets
 *    the current truth presented as the truth.
 *
 * Nothing here restricts the Pioneer pages' own content, universal pages that
 * legitimately survey brands (/equipment, /knowledge, /faq, the dictionary),
 * or the legal pages' trademark notices.
 */

import fs from 'node:fs';
import path from 'node:path';
import { BRANDS } from '../src/data/facts.js';

const DIST = process.argv[2] || 'dist';
let failed = 0;
const fail = (msg, ...d) => { failed++; console.error(`FAIL  ${msg}`); d.forEach((x) => console.error(`        ${x}`)); };

// The terms that identify each manufacturer's ecosystem in prose.
const BRAND_TERMS = {
  'pioneer-dj': ['Pioneer', 'AlphaTheta', 'CDJ-', 'DJM-', 'XDJ-', 'rekordbox', 'PRO DJ LINK'],
  'allen-heath': ['Allen & Heath', 'Allen &amp; Heath', 'Xone'],
  technics: ['Technics', 'Panasonic', 'SL-1200', 'SL-1210'],
};

// Vendor-forced exceptions, each with its reason on record.
const ALLOW_IN_PROSE = {
  // Allen & Heath's own DVS documentation names rekordbox as supported
  // software. Quoting a vendor's list is their words, not our framing.
  'allen-heath': ['rekordbox'],
  technics: [],
  'pioneer-dj': [],
};

const CORRECTION = [
  /this (?:page|site) previously/i, /previously (?:said|stated|claimed)/i,
  /used to (?:say|read|claim)/i, /we (?:originally|corrected)/i,
  /an earlier version/i, /has now been fixed/i, /a correction on record/i,
  /esta página (?:decía|dizia)/i, /anteriormente (?:decía|dizia|afirmaba|afirmava)/i,
  /una corrección registrada/i, /uma correção registrada/i,
];


/** Remove a whole element, tracking div nesting, starting at `openRe`. */
function stripBlock(html, openRe) {
  const m = html.match(openRe);
  if (!m) return html;
  const start = m.index;
  let i = start + m[0].length;
  let depth = 1;
  const tag = /<(\/?)div\b[^>]*>/g;
  tag.lastIndex = i;
  let t;
  while (depth > 0 && (t = tag.exec(html))) {
    depth += t[1] ? -1 : 1;
    i = tag.lastIndex;
  }
  return html.slice(0, start) + ' ' + stripBlock(html.slice(i), openRe);
}

function mainText(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  let body = m ? m[1] : html;
  body = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  return body;
}

function pages() {
  const out = [];
  for (const lang of ['', 'pt/', 'es/']) {
    for (const b of BRANDS) {
      const dir = path.join(DIST, lang, b.hub.replace(/^\//, ''));
      const hub = `${dir}.html`;
      if (fs.existsSync(hub)) out.push({ brand: b.key, file: hub });
      if (fs.existsSync(dir)) {
        for (const f of fs.readdirSync(dir)) {
          if (f.endsWith('.html')) out.push({ brand: b.key, file: path.join(dir, f) });
        }
      }
    }
  }
  return out;
}

// --- 1. foreign brands outside the Related equipment block, on brand pages.
let checkedPages = 0;
for (const { brand, file } of pages()) {
  checkedPages++;
  const body = mainText(fs.readFileSync(file, 'utf8'));
  // Remove the Related equipment block: cross-brand pairings live there by design.
  // BALANCED-TAG REMOVAL, not a regex ending at the first </div>. The block
  // contains nested divs, so a non-greedy match cut it in half and this check's
  // own first run flagged a pairing list it was supposed to allow.
  const prose = stripBlock(body, /<div class="[^"]*\brel-block\b[^"]*"[^>]*>/);
  const text = prose.replace(/<[^>]+>/g, ' ');
  for (const [other, terms] of Object.entries(BRAND_TERMS)) {
    if (other === brand) continue;
    for (const term of terms) {
      if (ALLOW_IN_PROSE[brand]?.includes(term)) continue;
      const re = new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      const hits = text.match(re);
      if (hits) {
        const i = text.search(re);
        fail(`${file}: names ${other} ("${term}" x${hits.length}) outside the Related equipment block`,
          `...${text.slice(Math.max(0, i - 90), i + 110).replace(/\s+/g, ' ').trim()}...`,
          'A page about one manufacturer does not name another unless the pairing block');
        console.error('        or the vendor\'s own quoted documentation forces it (see ALLOW_IN_PROSE).');
      }
    }
  }
}
if (!failed) console.log(`PASS  brand prose   ${checkedPages} brand pages, no foreign manufacturer outside the pairing block`);

// --- 2. correction language, on EVERY page.
let corrFails = 0;
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
});
let total = 0;
for (const file of walk(DIST)) {
  total++;
  const text = mainText(fs.readFileSync(file, 'utf8')).replace(/<[^>]+>/g, ' ');
  for (const re of CORRECTION) {
    const m = text.match(re);
    if (m) {
      corrFails++; failed++;
      const i = text.search(re);
      fail(`${file}: correction language in reader-facing copy ("${m[0]}")`,
        `...${text.slice(Math.max(0, i - 90), i + 110).replace(/\s+/g, ' ').trim()}...`,
        'State the correct fact plainly. The history lives in commits, not on the page.');
    }
  }
}
if (!corrFails) console.log(`PASS  no corrections ${total} pages, reader copy never narrates the site's own history`);

if (failed) {
  console.error(`\nNeutrality check FAIL: ${failed} problem(s).`);
  process.exit(1);
}
console.log('\nNeutrality check PASS');
