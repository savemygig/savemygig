/*
 * BUILD / GATE PARITY.
 *
 * WHY THIS EXISTS, and it is the most expensive lesson on this project so far.
 *
 * Cloudflare Pages publishes with `npm run build`. The gate runs `npm run
 * gate`. Both start with `astro build`, and then the gate ran a chain of
 * transforms over `dist` that `build` did not:
 *
 *   strip-comments.mjs   removes internal HTML comments
 *   autolink.mjs         creates the glossary and concept links, ~411 of them
 *
 * So for months, two things were true at once and nobody could see it:
 *
 *   1. Production had NO autolinks. The entire concept registry, the
 *      dictionary cross-links, every "FAT32" that should reach its
 *      definition: none of it existed on the live site. The gate proved they
 *      were correct, on a dist that was never the dist that shipped. A fix
 *      that lands only in the gate is a fix that does not exist, exactly like
 *      the /pt 404 that taught us the same thing in lang-roots.mjs.
 *
 *   2. Production shipped every internal comment, on all 309 pages, names
 *      included, on a site whose whole voice is faceless. The faceless check
 *      never caught it because the gate strips comments BEFORE checking, so
 *      the check was reading a file production never sees.
 *
 * The failure was not either script. It was that two commands claimed to
 * produce the same artifact and drifted, silently, in the direction where the
 * evidence was hidden. So this check asserts the contract itself: every dist
 * transform the gate performs must also be performed by build, in the same
 * order. Add a transform to one and the build fails until it is in both.
 *
 * This does not compare the checks. Checks are allowed to be gate-only, that
 * is what a gate is for. It compares only the steps that MUTATE dist.
 */
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const split = (cmd) => String(cmd || '').split('&&').map((s) => s.trim()).filter(Boolean);

// A step mutates dist if it is astro build itself, or one of the transforms
// below. Everything else in the gate is a read-only assertion.
const MUTATORS = [
  'astro build',
  'scripts/strip-comments.mjs',
  'scripts/autolink.mjs',
  'scripts/build-search-index.mjs',
  'scripts/lang-roots.mjs',
];
const isMutator = (step) => MUTATORS.some((m) => step.includes(m));

const buildSteps = split(pkg.scripts.build).filter(isMutator);
const gateSteps = split(pkg.scripts.gate).filter(isMutator);

const fails = [];
if (buildSteps.length !== gateSteps.length) {
  fails.push(`build runs ${buildSteps.length} dist transforms, gate runs ${gateSteps.length}`);
}
const n = Math.max(buildSteps.length, gateSteps.length);
for (let i = 0; i < n; i++) {
  if (buildSteps[i] !== gateSteps[i]) {
    fails.push(`step ${i + 1} differs:\n    build: ${buildSteps[i] || '(missing)'}\n    gate:  ${gateSteps[i] || '(missing)'}`);
  }
}

// Anything that writes to dist and is not on the MUTATORS list would slip
// through the comparison above, so name the risk rather than trusting it.
const unknownGate = split(pkg.scripts.gate).filter(
  (s) => /strip|autolink|rewrite|inject|minify|transform/i.test(s) && !isMutator(s),
);
if (unknownGate.length) {
  fails.push(`gate step looks like a dist transform but is not declared in MUTATORS: ${unknownGate.join(', ')}`);
}

if (fails.length) {
  console.log('BUILD PARITY FAIL');
  for (const f of fails) console.log('  ' + f);
  console.log('\n  Cloudflare publishes with `npm run build`. A transform that runs only');
  console.log('  in the gate does not exist on the live site. Add it to both.');
  process.exit(1);
}

console.log(`Build parity PASS (${buildSteps.length} dist transforms, identical order in build and gate)`);
