/*
 * PRECACHE BUDGET GATE.
 *
 * WHY THIS EXISTS. public/sw.js downloads the whole rescue path on a DJ's
 * first visit, and that cost is invisible: it happens after the page has
 * finished loading, in a worker, on whatever signal the visitor has. Nothing
 * in the gate measured it, so the only way anyone learned the install had got
 * heavier was an audit. On 2026-08-05 an audit found it at ~1.31 MB gzipped,
 * over the budget the worker's own comments claimed for it, having grown a
 * page at a time with nobody able to see it happen.
 *
 * WHAT IT MEASURES. The exact set of URLs the worker will fetch on install,
 * derived from sw.js rather than written down here, so it cannot drift:
 *   1. ROUTES_EN, once per served language, with that language's prefix,
 *      because the worker precaches ONE language per install (2026-08-05).
 *   2. The /_astro/*.css and *.js those pages reference, read out of the built
 *      HTML exactly the way precache() reads them.
 *   3. EXTRA: the two woff2 faces, the three SVG marks, and the language's own
 *      search index.
 * The reported number is the WORST language, because that is what some real
 * visitor pays.
 *
 * TRANSFER SIZE, NOT DISK SIZE. Text is counted gzipped (level 9) and binaries
 * are counted as-is, which is what the wire sees. Cloudflare will usually do
 * better than this with brotli, so the figure is a defensible ceiling rather
 * than a guess. Level 9 keeps it reproducible: the same dist gives the same
 * number on any machine.
 *
 * A MISSING FILE IS ALSO A FAILURE. A precache entry with no file behind it is
 * a 404 fired at every visitor on install and a route that is silently NOT
 * available offline, which is the promise this whole worker exists to keep.
 *
 * TWO BUDGETS, because there are two dists. `npm run gate` runs
 * scripts/strip-comments.mjs before this, and this codebase writes a lot of
 * decision history into HTML comments, so the stripped dist the gate measures
 * is about 13% smaller than the dist `npm run build` produces. Measuring one
 * and budgeting for the other would make the gate either useless or a false
 * alarm, so the artefact is detected and the matching budget applied. Both
 * numbers were measured on 2026-08-05, after H8 (the brand lockup left the
 * HTML) and the per-language search index split:
 *
 *                        MEASURED (es, the worst language)   BUDGET
 *   comment-stripped                  812.3 KB               850 KB
 *   as `npm run build` emits          935.7 KB               980 KB
 *
 * For reference, the same measurement before H8 was 1387.3 KB, over the
 * ~1.31 MB the 2026-08-05 audit reported and well over what the worker's own
 * comments claimed for it. Each budget sits ~4.7% above today's number: tight
 * enough that a careless addition trips it, loose enough that ordinary copy
 * edits do not.
 *
 * IF THIS FAILS, do not raise the number reflexively. The question to answer
 * first is whether the thing that grew belongs in an offline rescue kit at
 * all. Raising it is a decision, so raise it in a commit that says why.
 *
 * Run: node scripts/check-precache-budget.mjs dist
 */
import { readFile } from 'node:fs/promises';
import { gzipSync } from 'node:zlib';
import { join, extname } from 'node:path';

const BUDGET_STRIPPED_KB = 850;
const BUDGET_RAW_KB = 980;

const dir = process.argv[2] || 'dist';
const sw = await readFile('public/sw.js', 'utf-8');

/** Pull the quoted strings out of a top-level array literal in sw.js. */
function arrayLiteral(name) {
  const m = sw.match(new RegExp(`const ${name} = \\[([\\s\\S]*?)\\n\\];`));
  if (!m) {
    console.error(`Precache budget FAILED: cannot find ${name} in public/sw.js`);
    process.exit(1);
  }
  return [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]);
}

const ROUTES_EN = arrayLiteral('ROUTES_EN');
// EXTRA's first entry is the SEARCH_INDEX identifier, not a literal, so it is
// not captured here; it is added per language below, which is how sw.js builds
// it too.
const EXTRA_LITERALS = arrayLiteral('EXTRA');

// Same regex sw.js uses. Kept as its own copy on purpose: if the two ever
// disagree, the gate should be measuring what the worker actually does, and a
// shared import would hide the disagreement.
const ASSET_RE = /(?:href|src)="(\/_astro\/[^"]+?\.(?:css|js))"/g;
// And the same for the static imports the worker now follows out of that JS
// (2026-08-06): /checklist's entry chunk statically imports Vite's dynamic-import
// helper, which appears in no HTML, so measuring only what the HTML references
// would under-report the install AND hide a file whose absence stops the
// checklist's script running offline. Static imports only, exactly as in sw.js:
// a dynamic import() has a parenthesis where this requires a quote, which is
// what keeps the lazily loaded account layer out of the offline kit.
const JS_IMPORT_RE = /(?:from|import)\s*(["'])((?:\.\/|\/_astro\/)[^"']+?\.js)\1/g;

const GZIP_EXT = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.txt', '.xml', '.webmanifest']);

const sizes = new Map();
const bodies = new Map();

/** Resolve a served path to a file in dist the way the static host would. */
async function load(p) {
  if (sizes.has(p)) return sizes.get(p);
  for (const cand of [join(dir, p), join(dir, `${p}.html`), join(dir, p, 'index.html')]) {
    try {
      const buf = await readFile(cand);
      const n = GZIP_EXT.has(extname(cand)) ? gzipSync(buf, { level: 9 }).length : buf.length;
      sizes.set(p, n);
      if (extname(cand) === '.html' || extname(cand) === '.js') bodies.set(p, buf.toString('utf-8'));
      return n;
    } catch { /* try the next candidate */ }
  }
  sizes.set(p, null);
  return null;
}

const LANGS = [
  { name: 'en', prefix: '' },
  { name: 'pt', prefix: '/pt' },
  { name: 'es', prefix: '/es' },
];

const rows = [];
const missing = [];

for (const { name, prefix } of LANGS) {
  const routes = prefix
    ? ROUTES_EN.map((r) => (r === '/' ? prefix : prefix + r))
    : ROUTES_EN;

  let html = 0;
  const assets = new Set();
  for (const r of routes) {
    const n = await load(r);
    if (n === null) { missing.push(`${name}: ${r}`); continue; }
    html += n;
    const body = bodies.get(r) || '';
    ASSET_RE.lastIndex = 0;
    let m;
    while ((m = ASSET_RE.exec(body)) !== null) assets.add(m[1]);
  }

  // Follow the static imports of the JS, to a fixed point, the way precache()
  // does. Done before the sizes are summed so a helper chunk counts.
  const pending = [...assets];
  while (pending.length) {
    const a = pending.shift();
    if (!a.endsWith('.js')) continue;
    if ((await load(a)) === null) continue;
    const code = bodies.get(a) || '';
    JS_IMPORT_RE.lastIndex = 0;
    let m;
    while ((m = JS_IMPORT_RE.exec(code)) !== null) {
      const dep = m[2].startsWith('/_astro/') ? m[2] : '/_astro/' + m[2].replace(/^\.\//, '');
      if (!assets.has(dep)) { assets.add(dep); pending.push(dep); }
    }
  }

  let assetBytes = 0;
  for (const a of assets) {
    const n = await load(a);
    if (n === null) { missing.push(`${name}: ${a}`); continue; }
    assetBytes += n;
  }

  const extras = [`/search-index.${name}.json`, ...EXTRA_LITERALS];
  let extraBytes = 0;
  for (const x of extras) {
    const n = await load(x);
    if (n === null) { missing.push(`${name}: ${x}`); continue; }
    extraBytes += n;
  }

  rows.push({
    name,
    routes: routes.length,
    assets: assets.size,
    extras: extras.length,
    html,
    assetBytes,
    extraBytes,
    total: html + assetBytes + extraBytes,
  });
}

const kb = (b) => (b / 1024).toFixed(1);
for (const r of rows) {
  console.log(
    `  ${r.name}: ${kb(r.total)} KB  ` +
    `(${r.routes} routes ${kb(r.html)} KB + ${r.assets} build assets ${kb(r.assetBytes)} KB ` +
    `+ ${r.extras} extras ${kb(r.extraBytes)} KB)`
  );
}

const worst = rows.reduce((a, b) => (b.total > a.total ? b : a));

// Which dist is this? The home page carries a dozen HTML comments in source, so
// their total absence is a reliable signal that strip-comments.mjs has run.
const home = bodies.get('/') || '';
const stripped = home.length > 0 && !home.includes('<!--');
const BUDGET_KB = stripped ? BUDGET_STRIPPED_KB : BUDGET_RAW_KB;
console.log(
  `  measuring the ${stripped ? 'comment-stripped' : 'raw astro build'} dist, ` +
  `so the budget is ${BUDGET_KB} KB`
);

if (missing.length) {
  console.error(`\nPrecache budget FAILED: ${missing.length} precached path(s) have no file in ${dir}`);
  for (const m of missing.slice(0, 20)) console.error(`  ${m}`);
  process.exit(1);
}

if (worst.total / 1024 > BUDGET_KB) {
  console.error(
    `\nPrecache budget FAILED: ${worst.name} install is ${kb(worst.total)} KB, over the ${BUDGET_KB} KB budget ` +
    `by ${(worst.total / 1024 - BUDGET_KB).toFixed(1)} KB.\n` +
    `Read the header of this file before changing the budget.`
  );
  process.exit(1);
}

console.log(
  `\nPrecache budget PASS (worst language ${worst.name} at ${kb(worst.total)} KB of ${BUDGET_KB} KB, ` +
  `${(BUDGET_KB - worst.total / 1024).toFixed(1)} KB of headroom)`
);
