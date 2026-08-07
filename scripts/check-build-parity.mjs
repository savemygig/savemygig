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
  'scripts/sitemap-index-lastmod.mjs',
];

// Scripts in the gate that DO write a file, but never into dist, so they are not
// transforms and must not be compared as ones. Each needs a reason.
//   check-i18n.mjs  rewrites scripts/en-urls.json, the committed manifest of
//                   English URLs it checks against. Repo file, not build output.
//   this file       writes nothing. It matches its own detector because WRITE_RE
//                   below spells the write calls out as regex source, which is
//                   code and survives comment stripping. Listing it beats
//                   teaching the detector to parse regex literals.
const NON_DIST_WRITERS = ['scripts/check-i18n.mjs', 'scripts/check-build-parity.mjs'];
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

// ANYTHING THAT WRITES AND IS NOT DECLARED WOULD SLIP THROUGH THE COMPARISON
// ABOVE, so this reads the scripts rather than guessing from their names.
//
// It used to match the STEP TEXT against /strip|autolink|rewrite|inject|minify|
// transform/, which is a list of words we happened to have used so far. It would
// not have caught sitemap-index-lastmod.mjs, which rewrites dist/sitemap-index.xml
// and is named after none of those. A denylist of vocabulary only ever catches
// the mistakes already made.
//
// So the signal is now the only one that cannot be renamed around: does the
// script's source contain a write call. Every gate step that runs a script is
// read, and any that writes must appear in MUTATORS (mirrored into build) or in
// NON_DIST_WRITERS (with a reason). Unreadable file: reported, never ignored.
const SCRIPT_RE = /scripts\/[A-Za-z0-9._-]+\.(?:mjs|cjs|js)/;
const WRITE_RE = /writeFileSync|writeFile\(|createWriteStream|copyFileSync|cpSync|renameSync|rmSync|unlinkSync|appendFileSync/;
const undeclared = [];
for (const step of split(pkg.scripts.gate)) {
  const m = step.match(SCRIPT_RE);
  if (!m) continue;
  const file = m[0];
  if (isMutator(step) || NON_DIST_WRITERS.includes(file)) continue;
  let src;
  try {
    src = readFileSync(new URL('../' + file, import.meta.url), 'utf8');
  } catch {
    undeclared.push(`${file} (could not be read, so it cannot be cleared)`);
    continue;
  }
  // Comments describe writes without performing them, and several of these
  // scripts explain at length what the build steps do.
  const code = src
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/(^|[^:])\/\/.*$/gm, '$1');
  if (WRITE_RE.test(code)) undeclared.push(file);
}
if (undeclared.length) {
  fails.push(
    'gate step writes files but is declared in neither MUTATORS nor NON_DIST_WRITERS: ' +
    undeclared.join(', ')
  );
}

if (fails.length) {
  console.log('BUILD PARITY FAIL');
  for (const f of fails) console.log('  ' + f);
  console.log('\n  Cloudflare publishes with `npm run build`. A transform that runs only');
  console.log('  in the gate does not exist on the live site. Add it to both.');
  process.exit(1);
}

console.log(`Build parity PASS (${buildSteps.length} dist transforms, identical order in build and gate)`);
