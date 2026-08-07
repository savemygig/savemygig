#!/usr/bin/env node
/*
 * BOOTH BRIEFING CONSISTENCY. Antonio, 2026-08-07:
 *
 *   "you cannot put in some equipments a huge text and other equipments a small
 *    text. I think we should more or less have the size, okay, more or less,
 *    maybe it can vary a little bit, but not too much. I think the DJM-900
 *    Nexus 2 is a good example of size ratio. And the booth briefing should be a
 *    resume of the most important things people need to know about this specific
 *    model. Because then, you will go below and you will explore in more detail
 *    everything else."
 *
 * He was right, and the measurement showed exactly what he had spotted. Thirteen
 * of the fifteen equipment pages sat in a tight band of 417 to 597 characters.
 * The two written that same day were 1146 and 917, so 2.45x and 1.96x the
 * reference. Both were trimmed, and everything cut from them was already in the
 * accordions below, which is the point: the briefing is the summary, the
 * accordions are the detail.
 *
 * WHY THIS IS A GATE CHECK AND NOT A NOTE IN A DOC. A note is a thing somebody
 * has to remember while writing the sixteenth page. This is the SECOND time
 * today a convention rotted the moment a new page joined: the /equipment order
 * array did the same thing one commit after it was built. A convention nobody
 * measures is a convention that survives exactly as long as the memory of the
 * person who set it.
 *
 * THE REFERENCE IS THE DJM-900NXS2, because Antonio named it. It is not an
 * average: if the whole corpus drifted, an average would drift with it and this
 * check would keep passing. Anchoring to one page he approved means drift is
 * always measured against a fixed point.
 *
 * THE BAND is 0.75x to 1.45x of the reference. It was chosen to sit just outside
 * the natural spread of the pages Antonio was happy with (0.89x to 1.28x), so
 * ordinary editorial variation passes and a page that is twice as long fails. It
 * deliberately catches BOTH directions: a briefing that is far too SHORT is not
 * a summary either, it is a stub.
 *
 * ENGLISH ONLY, on purpose. Portuguese and Spanish run naturally longer than
 * English, and enforcing an English character band on them would either fail
 * good translations or force padding. The translated pages are already held to
 * the English structure by check-i18n and by the per-model parity counts, and a
 * translation cannot balloon to 2.45x without the English doing so first.
 *
 * THIS SCRIPT ONLY READS. It asserts and never writes, so it belongs in the gate
 * and not in the build, per the standing build-parity doctrine.
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] || 'dist';
const DIR = path.join(DIST, 'knowledge', 'pioneer-dj');

// The page Antonio named as the right size ratio.
const REFERENCE = 'djm-900nxs2';
const LO = 0.75;
const HI = 1.45;

// Pages in this directory that are NOT single-model equipment pages and so have
// no booth briefing to compare: the manufacturer hub, the cross-model firmware
// matrix, the rekordbox reference and the DJM-REC app page.
const NOT_A_MODEL = new Set(['index', 'firmware', 'rekordbox', 'djm-rec']);

if (!fs.existsSync(DIR)) {
  console.error(`Booth briefing check: ${DIR} does not exist. Run the build first.`);
  process.exit(1);
}

/** The rendered text of the .sv-text briefing paragraph, or null if there is none. */
function briefing(file) {
  const html = fs.readFileSync(file, 'utf8');
  const m = html.match(/<p class="sv-text"[^>]*>([\s\S]*?)<\/p>/);
  if (!m) return null;
  return m[1].replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

const pages = fs.readdirSync(DIR)
  .filter((f) => f.endsWith('.html'))
  .map((f) => f.replace(/\.html$/, ''))
  .filter((slug) => !NOT_A_MODEL.has(slug))
  .sort();

const measured = [];
for (const slug of pages) {
  const text = briefing(path.join(DIR, `${slug}.html`));
  if (text === null) {
    console.error(`FAIL  ${slug}: no .sv-text booth briefing found`);
    console.error('\nEvery equipment page carries a booth briefing. If this page is');
    console.error('deliberately not a model page, add its slug to NOT_A_MODEL here.');
    process.exit(1);
  }
  measured.push({ slug, chars: text.length });
}

const ref = measured.find((m) => m.slug === REFERENCE);
if (!ref) {
  console.error(`FAIL  the reference page ${REFERENCE} was not found in ${DIR}`);
  console.error('The band is anchored to the page Antonio named. If that page was');
  console.error('renamed or removed, pick a new reference here deliberately.');
  process.exit(1);
}

const lo = Math.round(ref.chars * LO);
const hi = Math.round(ref.chars * HI);
const bad = measured.filter((m) => m.chars < lo || m.chars > hi);

for (const m of [...measured].sort((a, b) => b.chars - a.chars)) {
  const ratio = (m.chars / ref.chars).toFixed(2);
  const verdict = m.chars > hi ? 'TOO LONG' : m.chars < lo ? 'TOO SHORT' : 'ok';
  const mark = verdict === 'ok' ? 'PASS' : 'FAIL';
  console.log(`${mark}  ${m.slug.padEnd(14)} ${String(m.chars).padStart(4)} chars  ${ratio}x  ${verdict}`);
}

if (bad.length) {
  console.error(`\nBooth briefing check FAIL: ${bad.length} page(s) outside ${lo} to ${hi} characters.`);
  console.error(`The band is ${LO}x to ${HI}x of ${REFERENCE}, which is ${ref.chars} chars.`);
  console.error('\nThe briefing is a SUMMARY of what matters most on that model. If a fact');
  console.error('needs more room than this, it belongs in an accordion below, where the');
  console.error('reader goes for detail. Cutting a fact from the briefing does not lose');
  console.error('it: check the accordions already carry it, then cut.');
  process.exit(1);
}

const min = Math.min(...measured.map((m) => m.chars));
const max = Math.max(...measured.map((m) => m.chars));
console.log(`\nBooth briefing check PASS (${measured.length} model pages, ${min} to ${max} chars, `
  + `${(min / ref.chars).toFixed(2)}x to ${(max / ref.chars).toFixed(2)}x of ${REFERENCE})`);
