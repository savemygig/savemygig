#!/usr/bin/env node
/*
 * THE FIRMWARE MATRIX MUST NOT FALL BACK TO ENGLISH. Added 2026-08-08.
 *
 * WHAT WENT WRONG. facts.js is language neutral for versions and URLs and
 * ENGLISH for the prose fields (`area`, `symptom`, `note`, `noneNote`,
 * `warning.text`). The /pt and /es firmware pages translate those strings at
 * render time through SYMPTOM, AREA and LONG maps, with `map[s] ?? s` as the
 * fallback. That fallback is right: a new entry shows up in English rather
 * than disappearing. But it is SILENT, and silence is the whole problem.
 *
 * When the CDJ-2000NXS (11 rows), the CDJ-900NXS (6 rows) and the XDJ-700
 * (4 rows plus a warning banner) were added to FIRMWARE_ISSUES, nobody
 * extended the maps. The build passed, check-i18n passed, and a Brazilian or
 * Spanish reader got a translated table with ENGLISH fault text in 22 of its
 * 38 rows, on the page this site positions as its citable asset. It shipped
 * that way and stayed that way until an audit read the rendered page.
 *
 * WHY A GATE CHECK AND NOT A NOTE. This is the fourth convention this week
 * that rotted the instant new data arrived: the /equipment ORDER array, the
 * check-briefing hardcoded directory, the untranslated superlatives, and this.
 * The pattern is identical every time. A rule nobody measures survives exactly
 * as long as the memory of the person who wrote it, and the person who adds
 * the eighteenth model will not remember this one. So it is measured.
 *
 * WHAT IT ASSERTS. Every English prose string reachable from FIRMWARE_ISSUES
 * has an entry in the matching map in BOTH translated pages. It reads the
 * source, not dist, because the maps ARE the source and a missing key produces
 * valid HTML that simply says the wrong thing. There is nothing in the artifact
 * to detect except the English sentence itself, which is why this is the one
 * check that is allowed to look at source.
 *
 * READ ONLY, so it belongs in the gate rather than the build.
 */

import fs from 'node:fs';
import path from 'node:path';
import { FIRMWARE_ISSUES, EQUIPMENT } from '../src/data/facts.js';

/*
 * This script reads SOURCE for the translation maps, deliberately, because a
 * missing key renders valid HTML that simply says the wrong thing. The fault-count
 * assertion below is the one part that needs the BUILT page, because a hand-written
 * count reaches the reader through prose rather than through a data file, so it
 * takes dist as an optional argument and skips if it is not there.
 */
const DIST = process.argv[2] || 'dist';

const PAGES = [
  { lang: 'pt', file: 'src/pages/pt/knowledge/pioneer-dj/firmware.astro' },
  { lang: 'es', file: 'src/pages/es/knowledge/pioneer-dj/firmware.astro' },
];

// Which map each kind of string belongs in. The page names them, so the check
// names them too: an error that says "add it to SYMPTOM" is actionable, an
// error that says "a string is missing" is not.
const needed = { AREA: new Set(), SYMPTOM: new Set(), LONG: new Set() };
for (const m of FIRMWARE_ISSUES) {
  for (const i of m.issues) {
    needed.AREA.add(i.area);
    needed.SYMPTOM.add(i.symptom);
  }
  if (m.noneNote) needed.LONG.add(m.noneNote);
  if (m.note) needed.LONG.add(m.note);
  if (m.warning?.text) needed.LONG.add(m.warning.text);
}

/*
 * THE MAP BODY, sliced between `const NAME = {` and the closing `};` at column
 * zero. Slicing matters: without it a string that appears in one map would
 * satisfy a check for another, and AREA keys like "Audio" and "USB" are short
 * enough to occur inside a SYMPTOM sentence by accident. Bounding the search to
 * the right object is what makes a hit mean what it says.
 */
function mapBody(src, name) {
  const start = src.indexOf(`const ${name} = {`);
  if (start === -1) return null;
  const end = src.indexOf('\n};', start);
  if (end === -1) return null;
  return src.slice(start, end);
}

/*
 * A key is present when the body carries it as an object key. Three spellings
 * count, and the first version of this check only accepted two, which cost a
 * round trip: the AREA map writes its short keys as BARE IDENTIFIERS
 * (`Display: 'Tela'`) because they are single words, while SYMPTOM and LONG
 * quote theirs because the keys are whole sentences. Both quote styles are
 * accepted too, since a sentence containing an apostrophe has to be written in
 * double quotes. Rejecting a valid spelling would send someone to add an entry
 * that is already there, which is a worse failure than not checking at all.
 */
function hasKey(body, key) {
  if (body.includes(`'${key}'`) || body.includes(`"${key}"`)) return true;
  if (!/^[A-Za-z_$][\w$]*$/.test(key)) return false;
  return new RegExp(`^\\s*${key}\\s*:`, 'm').test(body);
}

/*
 * COVERAGE: THE LINK SAYS "EVERY MODEL", SO EVERY MODEL HAS TO BE HERE.
 *
 * Added 2026-08-08 with the same reasoning as everything else in this file. The
 * matrix covered 9 of the 15 AlphaTheta models on this site while the link that
 * brings a reader to it promised "Every model, by firmware version". The
 * DJM-900NXS omission was the sharp one: its model page calls "below 1.28 this
 * mixer shuts itself down" its headline fact, links here, and the reader found
 * no row at all. The matrix also stated an inclusion rule, "Models appear here
 * once their change history has been read against the primary source", which was
 * not what was actually happening, so the explanation was false as well.
 *
 * A model with NO published change history still gets an entry, with an empty
 * issues list and a sentence saying so. Absence and "nothing published" look
 * identical to a reader and mean opposite things.
 *
 * Allen & Heath is excluded because this page is the AlphaTheta matrix and lives
 * under /knowledge/pioneer-dj. When a second manufacturer's matrix exists, this
 * assertion gets a second brand, not a looser rule.
 */
const covered = new Set(FIRMWARE_ISSUES.map((m) => m.href.replace(/.*\//, '')));
const owed = EQUIPMENT.filter((m) => m.brand === 'pioneer-dj' && !covered.has(m.slug));

/*
 * EVERY WARNING DECLARES ITS KIND. Added 2026-08-08, an hour after the reason
 * for it shipped live. The firmware page raises a model's safe floor around a
 * warning and prints "except X (withdrawn)". That was correct while the only
 * warning on the site was the CDJ-3000's genuinely pulled 3.30. The Ecodesign
 * standby warnings are not withdrawals, and the XDJ-1000MK2's sits above its
 * floor, so the page announced that the player's current firmware had been
 * withdrawn: it steered a DJ AWAY from the release they should be running,
 * which is worse than the missing row it replaced.
 * An untyped warning now fails rather than defaulting to the dangerous reading.
 */
const KINDS = new Set(['withdrawn', 'behaviour']);
const untyped = FIRMWARE_ISSUES.filter((m) => m.warning && !KINDS.has(m.warning.kind));

/*
 * NO PAGE MAY HAND-COUNT ITS OWN FIRMWARE FAULTS.
 *
 * Added 2026-08-08, and it is the mechanical fix for the only class of real error
 * a full technical audit found in this section. Both offending pages asserted how
 * COMPLETE their firmware history was rather than what a fault is:
 *
 *   DJM-900NXS2   "the rest of its change history is feature work"  -> ten fixes
 *   CDJ-2000NXS2  "three firmware updates fixed real problems"      -> thirteen
 *
 * Those two are the most installed professional mixer and player in the world, so
 * they were the worst two pages to be wrong about, and both were wrong in the same
 * direction: understating risk on an un-updated unit. facts.js already records
 * catching this exact shape four times on 7 August, when pages claimed a change
 * history had been "read in full" while versions were missing.
 *
 * A COUNT IS A CLAIM ABOUT EVERY VERSION YOU DID NOT READ. So a number-word next
 * to "firmware update" or "fix" in reader-facing copy has to match what
 * FIRMWARE_ISSUES actually holds for that model. Anything spelled out by hand
 * fails, which pushes the number back to the array where it can be counted.
 */
const NUMBER_WORDS = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8,
  nine: 9, ten: 10, eleven: 11, twelve: 12, thirteen: 13, fourteen: 14,
  fifteen: 15, sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};
/*
 * NARROWED after a false positive on its first run, which is the only way these
 * get found. The CDJ-900NXS page says "One firmware update to 1.31, then it is
 * essentially physical", and the first pattern flagged it as claiming one fault
 * when the page holds six. That sentence is an INSTRUCTION, not a count: do one
 * update, to that version. So the pattern now requires either a fixing verb after
 * a plural, or the explicit "versions of this" construction that only ever
 * appears when a page is summing up a history.
 */
const COUNT_RE = new RegExp(
  `\\b(${Object.keys(NUMBER_WORDS).join('|')}|\\d{1,2})\\s+`
  + `(?:firmware\\s+(?:updates|versions)\\s+(?:fixed|fix|address|addressed|carry|contain)`
  + `|versions?\\s+of\\s+this)`, 'gi');

let failed = 0;
if (fs.existsSync(DIST)) {
  for (const m of FIRMWARE_ISSUES) {
    const slug = m.href.replace(/.*\//, '');
    const file = path.join(DIST, m.href.replace(/^\//, '') + '.html');
    if (!fs.existsSync(file)) continue;
    const html = fs.readFileSync(file, 'utf8');
    const main = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    const text = (main ? main[1] : html).replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    const real = m.issues.length;
    for (const hit of text.matchAll(COUNT_RE)) {
      const raw = hit[1].toLowerCase();
      const stated = NUMBER_WORDS[raw] ?? Number(raw);
      if (stated !== real) {
        failed++;
        console.error(`FAIL  ${slug}: page states "${hit[0].trim()}" but FIRMWARE_ISSUES holds ${real}`);
        console.error(`        ...${text.slice(Math.max(0, hit.index - 80), hit.index + 120).trim()}...`);
        console.error('        A count is a claim about every version you did not read. Compute it,');
        console.error('        or describe the faults without counting them.');
      }
    }
  }
  if (!failed) console.log(`PASS  fault counts  no page hand-counts its own firmware history`);
}

if (untyped.length) {
  failed += untyped.length;
  console.error(`FAIL  warning kind: ${untyped.length} warning(s) do not declare a kind`);
  for (const m of untyped) console.error(`        ${m.model} (kind: ${JSON.stringify(m.warning.kind)})`);
  console.error('\nUse kind: \'withdrawn\' for a release AlphaTheta pulled, which raises the');
  console.error("safe floor, or kind: 'behaviour' for one that changed how the unit acts.");
  console.error('There is no safe default: guessing withdrawn scares a DJ off good firmware,');
  console.error('and guessing behaviour recommends a release that must not be installed.');
} else {
  console.log(`PASS  warning kind ${FIRMWARE_ISSUES.filter((m) => m.warning).length} warnings, each typed`);
}

if (owed.length) {
  failed += owed.length;
  console.error(`FAIL  coverage: ${owed.length} AlphaTheta model(s) missing from FIRMWARE_ISSUES`);
  for (const m of owed) console.error(`        ${m.name} (${m.slug})`);
  console.error('\nThe page links from every model page as "Every model, by firmware version".');
  console.error('If a model has no published change history, add it with issues: [] and a');
  console.error('noneNote saying so. Do not leave it out, and do not weaken the label.');
} else {
  console.log(`PASS  coverage   ${covered.size} models, every AlphaTheta model on the site`);
}

for (const { lang, file } of PAGES) {
  const src = fs.readFileSync(file, 'utf8');
  for (const name of ['AREA', 'SYMPTOM', 'LONG']) {
    const body = mapBody(src, name);
    if (body === null) {
      console.error(`FAIL  ${lang}: no ${name} map found in ${file}`);
      failed++;
      continue;
    }
    const missing = [...needed[name]].filter((k) => !hasKey(body, k));
    if (missing.length === 0) {
      console.log(`PASS  ${lang} ${name.padEnd(8)} ${needed[name].size} strings all translated`);
      continue;
    }
    failed += missing.length;
    console.error(`FAIL  ${lang} ${name}: ${missing.length} of ${needed[name].size} untranslated`);
    for (const k of missing) console.error(`        ${JSON.stringify(k)}`);
  }
}

if (failed) {
  console.error(`\nFirmware matrix i18n check FAIL: ${failed} missing translation(s).`);
  console.error('\nfacts.js holds these strings in English. The /pt and /es firmware pages');
  console.error('translate them through their AREA, SYMPTOM and LONG maps and fall back to');
  console.error('the English string when a key is absent, which is why a gap here does not');
  console.error('break the build and does not look broken on the page. It just reads as');
  console.error('English to a reader who chose another language.');
  console.error('\nAdd each string above as a key in the named map, in both files.');
  process.exit(1);
}

console.log(`\nFirmware matrix i18n check PASS (${needed.SYMPTOM.size} symptoms, `
  + `${needed.AREA.size} areas, ${needed.LONG.size} long-form strings, in ${PAGES.length} languages)`);
