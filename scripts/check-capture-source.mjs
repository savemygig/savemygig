/*
 * EVERY REGISTRATION FORM KNOWS WHERE IT IS.
 *
 * WHY THIS EXISTS (2026-08-06). EmailCapture.astro declares
 * `interface Props { source: string }`, and Astro does not enforce it. All three
 * /knowledge/pioneer-dj/firmware pages rendered `<EmailCapture />` with no
 * source, and shipped:
 *
 *   id="cap-undefined"                     in the form
 *   aria-describedby="cap-undefined-msg"   read out by a screen reader
 *   <section class="panel capture">        with NO data-capture attribute
 *
 * The last one is the expensive part. The submit handler reads
 * `wrap.dataset.capture || 'unknown'` and sends that to /api/subscribe and to
 * the email_capture event, so every subscription from those three pages arrived
 * with no idea which page produced it, for as long as they were live. Nothing
 * broke, nothing looked wrong, and no check on the site would ever have said so.
 *
 * The pattern is the one this project keeps paying for: a rule written in a
 * place that does not run. A TypeScript interface in an .astro frontmatter is
 * documentation. This is the assertion.
 *
 * WHAT IT CHECKS, on the BUILT html, which is the only artefact that ships:
 *   1. no page contains the string "cap-undefined", in any attribute,
 *   2. every element with class "capture" carries a non-empty data-capture,
 *   3. no data-capture value is "undefined", "null" or "unknown".
 *
 * WHY "unknown" IS ON THAT LIST, and it is the whole reason this check earns its
 * place. The first version of this file checked 1 and 2 only, and it PASSED when
 * the firmware bug was deliberately reintroduced to test it. EmailCapture had
 * just been given `source = 'unknown'` as a safe default, so an omitted prop no
 * longer produced "cap-undefined": it produced a tidy, valid-looking
 * data-capture="unknown", and the check waved it through. The safety net had
 * hidden the symptom the net was supposed to make visible.
 * "unknown" is the RUNTIME fallback for a missing attribute in the submit
 * handler. It is never a legitimate placement, so a build that emits it is a
 * build with a call site that forgot, and that is exactly what must fail here.
 * Verified by reverting one call site and watching this fail, then restoring it.
 *
 * Run: node scripts/check-capture-source.mjs dist
 */
import { readdir, readFile } from 'node:fs/promises';
import { join, relative } from 'node:path';

const ROOT = process.argv[2] || 'dist';

// Values that mean "nobody said". "unknown" is the submit handler's own fallback
// and EmailCapture's prop default, so it is a symptom rather than a placement.
const PLACEHOLDERS = new Set(['undefined', 'null', 'unknown']);

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const url = (f) =>
  '/' + relative(ROOT, f).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');

const files = await walk(ROOT);
const fails = [];
let panels = 0;
const sources = new Map();

for (const file of files) {
  const html = await readFile(file, 'utf8');

  // 1. The literal symptom, wherever it appears: id, aria-describedby, anything.
  if (html.includes('cap-undefined')) {
    fails.push(`${url(file)}: contains "cap-undefined" (an EmailCapture rendered with no source)`);
  }

  // 2 and 3. Every capture panel names its placement. The class is matched
  //    rather than the component, because the component name does not survive
  //    the build and the class is what the runtime script selects on.
  for (const m of html.matchAll(/<section[^>]*\bclass="[^"]*\bcapture\b[^"]*"[^>]*>/g)) {
    panels++;
    const tag = m[0];
    const src = (tag.match(/\bdata-capture="([^"]*)"/) || [])[1];
    if (src === undefined) {
      fails.push(`${url(file)}: a capture panel has no data-capture, so it reports as "unknown"`);
    } else if (!src.trim() || PLACEHOLDERS.has(src)) {
      fails.push(`${url(file)}: a capture panel has data-capture="${src}", which names no page`);
    } else {
      sources.set(src, (sources.get(src) || 0) + 1);
    }
  }
}

for (const f of fails) console.log(`FAIL  ${f}`);

const named = [...sources.entries()].sort((a, b) => b[1] - a[1]);
console.log(
  `${fails.length ? 'FAIL' : 'PASS'}  capture source  ` +
  `(${panels} registration panels across ${files.length} pages, ${sources.size} distinct sources)`,
);
if (!fails.length) {
  console.log(`  ${named.map(([s, n]) => `${s} ${n}`).join(', ')}`);
}

if (fails.length) {
  console.error(`\nCapture source check FAIL: ${fails.length} panel(s) cannot say where they are.`);
  process.exit(1);
}
console.log('\nCapture source check PASS');
