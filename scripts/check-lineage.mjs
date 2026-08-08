#!/usr/bin/env node
/*
 * PRODUCT LINEAGE INTEGRITY. Antonio, 2026-08-08:
 *
 *   "A product page should never become an isolated endpoint. Whenever there is
 *    a meaningful related product already documented on Save My Gig, give the
 *    user a clear path to continue exploring the equipment family."
 *
 * WHY THIS IS A CHECK AND NOT A NOTE. The DJM-900NXS2 carried
 * `older: null` with the comment "the DJM-900NXS has no page here". That was
 * true the day it was written and false the day the DJM-900NXS page shipped.
 * The DJM-900NXS entry had pointed `newer` at the NXS2 the whole time, so the
 * lineage ran one way only: forward from the old desk, never back from the new
 * one. On the most installed mixer the site covers.
 *
 * That is this project's recurring failure exactly: a rule somebody had to
 * remember, in a comment that outlived the fact it described. So the rule is
 * measured here instead.
 *
 * WHAT IS ASSERTED, and what deliberately is NOT.
 *
 *   1. LINEAGE IS SYMMETRIC. If A.newer is B then B.older must be A, and the
 *      reverse. Lineage is a documented fact about release order, and a fact
 *      cannot be true read forwards and absent read backwards.
 *
 *   2. EVERY LINEAGE SLUG RESOLVES. A `newer` or `older` naming a model with no
 *      entry is a silent dead link: the renderer drops unknown slugs, so the
 *      page simply renders one fewer path and nothing anywhere says so.
 *
 *   3. NO MODEL IS AN ISOLATED ENDPOINT. Every model page must offer at least
 *      one onward path to another model, which is Antonio's rule stated as a
 *      measurement.
 *
 *   4. NO SELF EDGES. A model cannot be its own predecessor or successor.
 *
 *   5. VARIANTS ARE SYMMETRIC. A motorised deck and its static-platter twin
 *      ship together and neither succeeds the other, so a variant pair reads
 *      the same from both sides or it is not a pair.
 *
 *   6. NO MODEL APPEARS TWICE ON ONE PAGE. Added after the rendered SL-1200MK2
 *      page showed the MK7 in the chain AND in its siblings, two rows apart,
 *      one labelled and one not. Seven pages had it. The code read fine; the
 *      page did not, which is the whole argument for looking at the artifact.
 *
 *   SIBLINGS AND PAIRED ARE NOT ASSERTED SYMMETRIC, ON PURPOSE. They are
 *   curated per page and asymmetry there is editorial judgement, not rot: the
 *   Xone:92 naming the DJM-900NXS2 as a comparable desk does not oblige the
 *   DJM-900NXS2 to name the Xone:92 back, and forcing it would push every page
 *   toward the same undifferentiated list. Measuring them as errors would
 *   produce 41 warnings nobody can act on, and a check that cries wolf is a
 *   check people learn to skip. Lineage is the part that is a FACT, so lineage
 *   is the part held to symmetry.
 *
 * THIS SCRIPT ONLY READS. It asserts and never writes, so it belongs in the
 * gate and not in the build, per the standing build-parity doctrine.
 */

import { EQUIPMENT, lineageOf, siblingModels } from '../src/data/facts.js';

const bySlug = new Map(EQUIPMENT.map((e) => [e.slug, e]));
const errors = [];

for (const e of EQUIPMENT) {
  for (const dir of ['newer', 'older']) {
    const target = e[dir];
    if (target === null || target === undefined) continue;

    if (target === e.slug) {
      errors.push(`${e.slug}.${dir} points at itself.`);
      continue;
    }

    const other = bySlug.get(target);
    if (!other) {
      errors.push(
        `${e.slug}.${dir} names "${target}", which has no EQUIPMENT entry.\n`
        + '        The renderer drops unknown slugs, so this page silently loses\n'
        + '        a path through the product family and nothing says so.',
      );
      continue;
    }

    const back = dir === 'newer' ? 'older' : 'newer';
    if (other[back] !== e.slug) {
      errors.push(
        `${e.slug}.${dir} = "${target}" but ${other.slug}.${back} = ${JSON.stringify(other[back])}.\n`
        + '        Lineage is a documented fact about release order. A reader on\n'
        + `        ${e.slug} can walk to ${other.slug}, and a reader on ${other.slug}\n`
        + `        cannot walk back. Set ${other.slug}.${back} to "${e.slug}".`,
      );
    }
  }

  /*
   * VARIANTS ARE SYMMETRIC TOO, and for a different reason than lineage. A
   * motorised deck and its static-platter twin ship together and neither
   * succeeds the other, so the pair reads identically from both sides or it is
   * not a pair. This is the field the SC6000 and SC6000M will use.
   */
  for (const v of e.variants ?? []) {
    const other = bySlug.get(v.of);
    if (!other) {
      errors.push(`${e.slug}.variants names "${v.of}", which has no EQUIPMENT entry.`);
      continue;
    }
    if (!(other.variants ?? []).some((b) => b.of === e.slug)) {
      errors.push(
        `${e.slug} declares "${v.of}" as a variant, but ${other.slug} does not name it back.\n`
        + '        A variant pair ships together and neither one succeeds the other, so\n'
        + '        the relationship reads the same from both sides or it is not one.',
      );
    }
  }

  /*
   * ISOLATION IS MEASURED AGAINST BOTH BLOCKS, not the merged list this
   * originally read. The chain and the siblings render separately now, so a
   * page is a dead end only when BOTH are empty. Reading just one of them would
   * pass a page that shows a heading with nothing under it.
   */
  const chain = lineageOf(e.slug);
  const onward = [chain.older, chain.newer, ...chain.variants.map((v) => v.model), ...siblingModels(e.slug)]
    .filter(Boolean);
  if (onward.length === 0) {
    errors.push(
      `${e.slug} is an isolated endpoint: no related model to continue to.\n`
      + '        Give it a lineage edge, or a sibling in the same category and\n'
      + '        tier. An older model is not a dead end, it is what a DJ meets\n'
      + '        in an unfamiliar booth.',
    );
  }

  /*
   * NO MODEL TWICE ON ONE PAGE. The SL-1200MK2 listed the MK7 as a sibling and
   * also carried it as `newer`, so the block rendered SL-1200MK7 twice, two
   * rows apart, one labelled "Later generation" and one not. Found by looking
   * at the rendered page, which is why this assertion exists: the code read
   * perfectly well, and the page did not.
   */
  const seen = new Map();
  for (const [where, models] of [
    ['chain', [chain.older, chain.newer, ...chain.variants.map((v) => v.model)].filter(Boolean)],
    ['siblings', siblingModels(e.slug)],
  ]) {
    for (const m of models) {
      if (seen.has(m.slug)) {
        errors.push(
          `${e.slug} links ${m.slug} twice, in ${seen.get(m.slug)} and in ${where}.\n`
          + '        One model, one row. The chain is the labelled statement and\n'
          + '        wins; drop the duplicate from the weaker block.',
        );
      } else {
        seen.set(m.slug, where);
      }
    }
  }
}

if (errors.length) {
  for (const msg of errors) console.error(`FAIL  ${msg}`);
  console.error(`\nLineage check FAIL: ${errors.length} problem(s) in the equipment graph.`);
  process.exit(1);
}

const withLineage = EQUIPMENT.filter((e) => e.newer || e.older).length;
console.log(
  `PASS  lineage  ${EQUIPMENT.length} models, ${withLineage} carry a documented `
  + 'predecessor or successor, every pair points both ways, no isolated endpoints',
);
