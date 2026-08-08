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

/*
 * CROSS-BRAND DEPENDENCY AND COMPARISON FRAMING, ON EVERY PAGE. Added 2026-08-08,
 * because the first version of this check had a hole and Antonio found what was
 * in it: "why does Denon publicly depend on AlphaTheta being ready first? This
 * puts us in a ridiculous and fragile position."
 *
 * The /knowledge landing page said, on the Denon DJ card, "SC players and Prime
 * hardware, once the AlphaTheta reference is complete." The Engine DJ card sold
 * itself as "the crossover to Pioneer booths". The Allen & Heath card explained
 * itself as "Different rules to a CDJ booth". All three survived the neutrality
 * pass because rule 1 only inspects pages UNDER a brand hub, and /knowledge is a
 * survey page that is ALLOWED to name every manufacturer. It is allowed to name
 * them. It is not allowed to rank them, sequence them, or make one contingent on
 * another, and that distinction is what these patterns test.
 *
 * Two harms, and the second is the worse one. It reads as a Pioneer site with a
 * waiting list. And it publishes a sequencing promise, so any change of plan turns
 * an ordinary reprioritisation into a broken commitment on a public page.
 */
const DEPENDENCY = [
  /once the [A-Z][\w& ]+ reference is (?:complete|done|finished)/i,
  /(?:after|when|as soon as|apenas|assim que) (?:the )?[A-Z][\w& ]{2,20} (?:reference|coverage) (?:is|est[aá])/i,
  /crossover to [A-Z][\w& ]+ booths?/i,
  /(?:different|other) rules to a [A-Z][\w-]+ booth/i,
  /\bis not our core\b/i,
  /n[aã]o é o nosso foco/i,
  /no es nuestro foco/i,
  /refer[eê]ncia d[ae] AlphaTheta estiver/i,
  /referencia de AlphaTheta est[eé]/i,
];

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

// --- 3. no manufacturer's coverage described in terms of another's, anywhere.
let depFails = 0;
for (const file of walk(DIST)) {
  const text = mainText(fs.readFileSync(file, 'utf8')).replace(/<[^>]+>/g, ' ');
  for (const re of DEPENDENCY) {
    const m = text.match(re);
    if (m) {
      depFails++; failed++;
      const i = text.search(re);
      fail(`${file}: one manufacturer's coverage framed in terms of another ("${m[0].trim()}")`,
        `...${text.slice(Math.max(0, i - 90), i + 120).replace(/\s+/g, ' ').trim()}...`,
        'Say what the coverage is ABOUT. Never sequence it behind another brand,',
        'and never publish a roadmap promise a change of plan would break.');
    }
  }
}
if (!depFails) console.log(`PASS  no dependency ${total} pages, no brand's coverage sequenced behind another's`);

/*
 * --- 4. A BRAND WITH A BUILT HUB IS NOT LABELLED "COMING SOON".
 * The Technics card on /knowledge sat at href: null with a Coming soon label for
 * hours after its hub and both model pages shipped. That is the SECOND time on
 * that page: the Allen & Heath card did the same thing the day before, and the
 * code comment written to prevent a repeat did not prevent it. A live hub that the
 * landing page says does not exist is a page telling a reader their equipment is
 * uncovered while the coverage sits one click away.
 */
for (const lang of ['', 'pt/', 'es/']) {
  const idx = path.join(DIST, lang, 'knowledge.html');
  if (!fs.existsSync(idx)) continue;
  const html = fs.readFileSync(idx, 'utf8');
  for (const b of BRANDS) {
    const hubBase = path.join(DIST, lang, b.hub.replace(/^\//, ''));
    const built = fs.existsSync(`${hubBase}.html`) || fs.existsSync(path.join(hubBase, 'index.html'));
    if (!built) continue;
    const href = `${lang ? `/${lang.replace(/\/$/, '')}` : ''}${b.hub}`;
    if (!html.includes(`href="${href}"`)) {
      fail(`${idx}: ${b.name} has a built hub but /knowledge does not link it`,
        `expected a card linking ${href}`,
        'The card is showing "Coming soon" for coverage that is already live.');
    }
  }
}

if (failed) {
  console.error(`\nNeutrality check FAIL: ${failed} problem(s).`);
  process.exit(1);
}
console.log('\nNeutrality check PASS');
