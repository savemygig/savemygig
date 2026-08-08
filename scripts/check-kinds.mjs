#!/usr/bin/env node
/*
 * A KIND IS NOT JUST A DATA VALUE. Added 2026-08-08 with `turntable`, the third
 * one.
 *
 * WHAT ADDING A KIND ACTUALLY TOUCHES. `kind` sat at two values, 'player' and
 * 'mixer', for as long as every product on this site was digital, and the code
 * that consumed it quietly assumed two:
 *
 *   RelatedEquipment.astro   branched `isPlayer ? players : mixers`, so a
 *                            turntable would have headed its own lineage block
 *                            "Related mixers" and its Xone:92 pairing
 *                            "Commonly paired players". Both false, both valid
 *                            HTML, nothing failing.
 *   equipment.astro x3       wrote the group list out by hand, in English, in
 *                            Portuguese and in Spanish, so a third kind meant
 *                            finding three files nothing connects. A kind absent
 *                            from that list does not error, it just never appears
 *                            on the page, and the models with it become
 *                            unreachable from /equipment while their pages exist.
 *
 * The second failure is the dangerous one, because the symptom is a MISSING
 * section, and this repo has now been bitten five times by exactly that shape:
 * the /equipment ORDER array, the check-briefing hardcoded directory, the
 * untranslated superlatives, the firmware translation maps and the matrix
 * coverage claim. Every single one rotted the instant new data arrived, and the
 * only fixes that held were the ones something measures.
 *
 * So this asserts the three lists agree: KINDS, the `kind` values EQUIPMENT
 * actually uses, and the label sets in every language. A fourth kind fails the
 * gate until it is wired everywhere, which is the point. Same for a brand with
 * no hub, and for a hub directory that does not exist in the build.
 *
 * READ ONLY, so it belongs in the gate and not in the build.
 */

import fs from 'node:fs';
import path from 'node:path';
import { EQUIPMENT, KINDS, BRANDS } from '../src/data/facts.js';
import { UI } from '../src/i18n/ui.js';

const LANGS = ['en', 'pt', 'es'];
const DIST = process.argv[2] || 'dist';
let failed = 0;

const fail = (msg, ...detail) => {
  failed++;
  console.error(`FAIL  ${msg}`);
  for (const d of detail) console.error(`        ${d}`);
};

// 1. Every kind in use is registered, and every registered kind is in use. The
// second half matters as much: a kind left in KINDS after its last model went
// away renders an empty accordion on /equipment for every brand.
const used = [...new Set(EQUIPMENT.map((m) => m.kind))];
const unregistered = used.filter((k) => !KINDS.includes(k));
const unused = KINDS.filter((k) => !used.includes(k));
if (unregistered.length) {
  fail(`EQUIPMENT uses ${unregistered.length} kind(s) missing from KINDS`, ...unregistered,
    'A model whose kind is not in KINDS never appears on /equipment, in any language.');
}
if (unused.length) {
  fail(`KINDS registers ${unused.length} kind(s) no model uses`, ...unused,
    'Remove it, or /equipment carries an empty group heading.');
}
if (!unregistered.length && !unused.length) {
  console.log(`PASS  kinds registered  ${KINDS.join(', ')}`);
}

// 2. Every kind has a group label and a "Related X" heading, in every language.
for (const lang of LANGS) {
  const kinds = UI[lang]?.equipment?.kinds;
  if (!kinds) {
    fail(`UI.${lang}.equipment.kinds is missing entirely`);
    continue;
  }
  const missing = KINDS.filter((k) => !kinds[k]);
  if (missing.length) {
    fail(`${lang}: ${missing.length} kind(s) have no /equipment group label`, ...missing);
  }
  // RelatedEquipment maps kind to its own heading. 'turntable' reuses the
  // pairedMixers string on purpose, so only the own-kind heading is required.
  const OWN = { player: 'players', mixer: 'mixers', turntable: 'turntables', 'all-in-one': 'allInOnes' };
  const noHeading = KINDS.filter((k) => !OWN[k] || !UI[lang]?.related?.[OWN[k]]);
  if (noHeading.length) {
    fail(`${lang}: ${noHeading.length} kind(s) have no "Related X" heading`, ...noHeading,
      'Add the string to UI.' + lang + '.related, and its kind to OWN_TITLE in RelatedEquipment.astro.');
  }
  if (!missing.length && !noHeading.length) {
    console.log(`PASS  ${lang} labels     ${KINDS.map((k) => kinds[k]).join(', ')}`);
  }
}

/*
 * 3. EVERY BRAND HAS A LEAD SENTENCE ON /equipment, IN EVERY LANGUAGE.
 *
 * The page reads them from a local LEADS map keyed by brand, with a deliberate
 * "a brand with no lead still renders" note above it. That degradation is the
 * right runtime behaviour and it was the wrong development behaviour: Technics
 * shipped, the map had no entry, and the brand rendered with its models and no
 * lead while the two brands above it had one. Nothing failed. It was visible
 * only by reading the built page beside the other brands.
 *
 * Asserted against the BUILT HTML rather than the source, because the map is a
 * page-local literal in three separate files and what matters is whether a
 * reader sees the sentence. That also means this catches a lead that exists in
 * the map but is not rendered.
 */
if (fs.existsSync(DIST)) {
  const PAGES = [
    { lang: 'en', file: path.join(DIST, 'equipment.html') },
    { lang: 'pt', file: path.join(DIST, 'pt', 'equipment.html') },
    { lang: 'es', file: path.join(DIST, 'es', 'equipment.html') },
  ];
  for (const { lang, file } of PAGES) {
    if (!fs.existsSync(file)) {
      fail(`${lang}: /equipment missing from the build`, file);
      continue;
    }
    const html = fs.readFileSync(file, 'utf8');
    // One .eq-lead paragraph per brand section, in brand order.
    const leads = [...html.matchAll(/class="[^"]*\beq-lead\b[^"]*"[^>]*>([\s\S]*?)<\/p>/g)]
      .map((m) => m[1].replace(/<[^>]+>/g, '').trim())
      .filter((t) => t.length > 0);
    if (leads.length !== BRANDS.length) {
      fail(`${lang}: /equipment renders ${leads.length} brand lead(s) for ${BRANDS.length} brand(s)`,
        `rendered: ${leads.length ? leads.map((t) => `"${t.slice(0, 40)}..."`).join(', ') : 'none'}`,
        'Add the missing brand key to the LEADS map in that language\'s equipment.astro.');
    } else {
      console.log(`PASS  ${lang} brand leads ${leads.length} of ${BRANDS.length}`);
    }
  }
}

// 4. Every brand a model claims exists, and its hub is really in the build.
// modelPath() already throws on an unknown brand, which covers the first half at
// build time, but a brand whose hub page was never written produces links that
// 404 rather than an error.
const brandKeys = new Set(BRANDS.map((b) => b.key));
const orphans = [...new Set(EQUIPMENT.map((m) => m.brand))].filter((b) => !brandKeys.has(b));
if (orphans.length) fail(`${orphans.length} brand(s) used by a model are not in BRANDS`, ...orphans);

if (fs.existsSync(DIST)) {
  for (const b of BRANDS) {
    // Astro emits /knowledge/technics as knowledge/technics.html, NOT as
    // knowledge/technics/index.html: this build has no trailing-slash directory
    // output. Both spellings are accepted so the check does not depend on that
    // config, since flipping it would otherwise make this fail on a correct site.
    const base = path.join(DIST, b.hub.replace(/^\//, ''));
    const hub = [`${base}.html`, path.join(base, 'index.html')].find((f) => fs.existsSync(f));
    if (!hub) {
      fail(`${b.name}: hub page missing from the build`, `${base}.html`,
        'Every model of this brand links here from its Related equipment block.');
    }
  }
  for (const m of EQUIPMENT) {
    const brand = BRANDS.find((b) => b.key === m.brand);
    if (!brand) continue;
    const page = path.join(DIST, brand.hub.replace(/^\//, ''), `${m.slug}.html`);
    if (!fs.existsSync(page)) {
      fail(`${m.name}: page missing from the build`, page,
        'It is in EQUIPMENT, so /equipment and the lineage blocks already link to it.');
    }
  }
  if (!failed) console.log(`PASS  pages present  ${EQUIPMENT.length} models, ${BRANDS.length} brand hubs`);
} else {
  console.log(`note  ${DIST} not built, skipped the page-existence checks`);
}

if (failed) {
  console.error(`\nKinds and brands check FAIL: ${failed} problem(s).`);
  process.exit(1);
}
console.log(`\nKinds and brands check PASS (${KINDS.length} kinds, ${BRANDS.length} brands, ${EQUIPMENT.length} models, ${LANGS.length} languages)`);
