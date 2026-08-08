#!/usr/bin/env node
/*
 * BRAND WORDMARKS. Antonio, 2026-08-08: "Single name brand its better a single
 * color."
 *
 * Every manufacturer hub prints its name as an h1 split into a plain part and
 * an accent-red part. That split was hand-written markup on nine pages, three
 * brands times three languages, and on TECHNICS it had been cut mid-word into
 * "Tech" plus a red "nics". A reader cannot tell that from a rendering fault.
 *
 * The split is now derived in BrandWordmark.astro from one field on the brand
 * record. This asserts the result on the RENDERED page, in all three languages,
 * because the component being right is not the same claim as the page being
 * right, and it is the page a DJ looks at.
 *
 * WHAT IS ASSERTED
 *
 *   1. Every brand in BRANDS has a hub page in every language, and that page's
 *      h1 reads EXACTLY the brand's name. Not a name that starts with it, not a
 *      name missing a character where the two hand-written halves failed to add
 *      up.
 *
 *   2. A SINGLE-WORD brand name is entirely inside the accent span. This is
 *      Antonio's rule, stated as a measurement: if one character of a one-word
 *      name sits outside the accent, the word is two colours and the rule is
 *      broken.
 *
 *   3. A MULTI-WORD brand name has a non-empty accent part and a non-empty
 *      plain part, so the accent is a real split rather than the whole name or
 *      nothing at all.
 *
 * THE LANGUAGE LOOP IS THE POINT. Nine pages carried this markup and the
 * Technics split was wrong on all nine. A check that only read the English hub
 * would have printed PASS on two thirds of the fault, which is the failure mode
 * this project has hit twice: a check that quietly stops covering its subject
 * removes the suspicion that would make someone look.
 *
 * THIS SCRIPT ONLY READS. It asserts and never writes, so it belongs in the
 * gate and not in the build, per the standing build-parity doctrine.
 */

import fs from 'node:fs';
import path from 'node:path';
import { BRANDS } from '../src/data/facts.js';

const DIST = process.argv[2] || 'dist';
const LANGS = ['en', 'pt', 'es'];
let failed = 0;
const fail = (msg, ...detail) => {
  failed++;
  console.error(`FAIL  ${msg}`);
  detail.forEach((d) => console.error(`        ${d}`));
};

// The rendered h1 is the wordmark. Entities are decoded because Allen & Heath
// renders its ampersand as &#38; and a comparison against the raw name would
// fail on the one brand whose own styling includes punctuation.
const decode = (s) => s
  .replace(/&#(\d+);/g, (_m, d) => String.fromCharCode(Number(d)))
  .replace(/&amp;/g, '&')
  .replace(/&nbsp;/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const strip = (s) => decode(s.replace(/<[^>]+>/g, ''));

for (const brand of BRANDS) {
  const accentPart = brand.wordmarkAccent
    ?? brand.name.slice(brand.name.lastIndexOf(' ') + 1);
  const singleWord = !brand.name.trim().includes(' ');

  for (const lang of LANGS) {
    const rel = lang === 'en'
      ? brand.hub.replace(/^\//, '')
      : `${lang}${brand.hub}`;
    /*
     * The build emits a hub as `<hub>.html` beside a `<hub>/` directory holding
     * the model pages, not as `<hub>/index.html`. The first version of this
     * check looked only for the index form and failed all nine pages, which is
     * the good failure: it was wrong about where the artifact lives and it said
     * so loudly instead of finding nothing and printing PASS. Both forms are
     * accepted now so a change of build config cannot silently empty this check.
     */
    const candidates = [
      path.join(DIST, `${rel}.html`),
      path.join(DIST, rel, 'index.html'),
    ];
    const file = candidates.find((f) => fs.existsSync(f));

    if (!file) {
      fail(`${brand.key} [${lang}]: no hub page at ${candidates.join(' or ')}`,
        'Every brand in BRANDS ships a hub in all three languages. If a brand',
        'is roadmap rather than built, it does not belong in BRANDS yet.');
      continue;
    }

    const html = fs.readFileSync(file, 'utf8');
    const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
    if (!h1) {
      fail(`${brand.key} [${lang}]: no h1 on the hub page`);
      continue;
    }

    const whole = strip(h1[1]);
    if (whole !== decode(brand.name)) {
      fail(`${brand.key} [${lang}]: h1 reads "${whole}", BRANDS says "${brand.name}"`,
        'The wordmark is derived from the brand record. A mismatch means the',
        'page is not using BrandWordmark, or the record was renamed without it.');
      continue;
    }

    const accents = [...h1[1].matchAll(/<span class="accent">([\s\S]*?)<\/span>/g)]
      .map((m) => strip(m[1]));

    if (accents.length !== 1) {
      fail(`${brand.key} [${lang}]: h1 has ${accents.length} accent spans, expected exactly 1`);
      continue;
    }

    const accent = accents[0];
    const plain = whole.slice(0, whole.length - accent.length).trim();

    if (accent !== decode(accentPart)) {
      fail(`${brand.key} [${lang}]: accent reads "${accent}", expected "${accentPart}"`);
      continue;
    }

    if (singleWord && plain !== '') {
      fail(`${brand.key} [${lang}]: single-word brand is rendered in two colours`,
        `"${plain}" sits outside the accent span and "${accent}" inside it.`,
        'A one-word manufacturer name takes one colour. Set wordmarkAccent to',
        'the whole name.');
      continue;
    }

    if (!singleWord && plain === '') {
      fail(`${brand.key} [${lang}]: multi-word brand is entirely inside the accent`,
        'A name with more than one word splits, so the accent is the last part',
        'and not all of it.');
      continue;
    }
  }
}

if (failed) {
  console.error(`\nWordmark check FAIL: ${failed} problem(s).`);
  process.exit(1);
}

const single = BRANDS.filter((b) => !b.name.trim().includes(' ')).length;
console.log(
  `PASS  wordmarks  ${BRANDS.length} brands x ${LANGS.length} languages, `
  + `every h1 matches its brand record, ${single} single-word name(s) in one colour`,
);
