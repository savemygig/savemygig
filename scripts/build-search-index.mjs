/**
 * Build the search index from the BUILT HTML, not from .astro source.
 *
 * WHY THIS EXISTS (2026-08-02). The index used to be an Astro endpoint that
 * read the .astro source files. That was broken in two separate ways, and
 * Antonio found it by searching "flac" and getting nothing:
 *
 *   1. It stripped the frontmatter before indexing. Every page that renders
 *      its content from a data array in frontmatter therefore indexed NOTHING
 *      but its own template expressions. The Dictionary's indexed body was
 *      literally "{groups.map((g) => ( {g.terms.map((x) => ( ))} ))}", so not
 *      one of its terms had ever been searchable. Same class of problem on
 *      /prepare, /knowledge and the firmware matrix, all of which render from
 *      data.
 *
 *   2. Its <script> stripper was `<script[\s\S]*?</script>`, which cannot see
 *      a SELF-CLOSING `<script ... />`. The JSON-LD blocks are self-closing,
 *      so on any page that also had a real closing </script> later, the regex
 *      matched from the JSON-LD tag all the way down and deleted the entire
 *      page body. /faq, /knowledge/pioneer-dj/rekordbox and
 *      /knowledge/pioneer-dj/djm-rec were indexed with COMPLETELY EMPTY
 *      bodies, including the biggest content page on the site.
 *
 * Reading the built HTML removes both failure modes permanently, and it is
 * the same principle scripts/lint-content.mjs already follows: check what
 * actually ships, not what we hope the source compiles to.
 *
 * Only <main> is indexed. Indexing the whole document would put the header
 * nav and footer into every single record, so every query would match every
 * page.
 *
 * Run: node scripts/build-search-index.mjs dist
 */
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOT = process.argv[2] || 'dist';

// Kept in sync with the old endpoint's list. /partners.astro's header comment
// points here, so update both if this changes.
const EXCLUDE = [
  '/protocol/', '/saved', '/files-lost', '/card-ready', '/feedback',
  '/legal/privacy', '/legal/terms', '/legal/cookies', '/partners',
  '/404', '/search', '/offline',
];

const BODY_CAP = 2600;

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

function routeOf(file) {
  let r = file.replace(new RegExp(`^${ROOT}`), '').replace(/\.html$/, '');
  if (r.endsWith('/index')) r = r.slice(0, -6);
  return r || '/';
}

const ENTITIES = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ',
  rarr: '→', larr: '←', times: '×', hellip: '…', mdash: '—', ndash: '–',
  lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', deg: '°', middot: '·',
};

function decode(s) {
  return s
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(+n))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&([a-z]+);/gi, (m, name) => ENTITIES[name.toLowerCase()] ?? ' ');
}

/** Strip elements whose text must never be indexed, self-closing forms included. */
function stripNoise(html) {
  return html
    .replace(/<script\b[^>]*\/>/gi, ' ')            // self-closing, the old bug
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<svg\b[\s\S]*?<\/svg>/gi, ' ')
    .replace(/<noscript\b[\s\S]*?<\/noscript>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ');
}

function textOf(html) {
  return decode(stripNoise(html).replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

function mainOf(html) {
  const m = html.match(/<main\b[^>]*>([\s\S]*?)<\/main>/i);
  return m ? m[1] : html;
}

const files = await walk(ROOT);
const docs = [];
const skipped = [];

for (const file of files) {
  const route = routeOf(file);
  if (EXCLUDE.some((x) => route === x || route.startsWith(x))) { skipped.push([route, 'excluded']); continue; }

  const html = await readFile(file, 'utf8');
  if (/<meta[^>]+name=["']robots["'][^>]+noindex/i.test(html)) { skipped.push([route, 'noindex']); continue; }

  const main = mainOf(html);
  const cleanMain = stripNoise(main);

  const title = decode((html.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? '').trim())
    .replace(/\s*\|\s*Save My Gig!?\s*$/i, '')
    .trim();
  const desc = decode(html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1] ?? '');

  // h1-h3 covers accordion questions, FAQ questions and Dictionary terms
  // (which render as <h3 class="dict-t">). These are the strongest targets:
  // someone searching "flac" is looking for a term, not a paragraph.
  const heads = [...cleanMain.matchAll(/<h[1-3]\b[^>]*>([\s\S]*?)<\/h[1-3]>/gi)]
    .map((m) => textOf(m[1]))
    .filter(Boolean);

  const body = textOf(main);
  docs.push({
    u: route,
    t: title,
    d: desc,
    // Generous cap. The Dictionary alone renders one heading per term and
    // every one of them is a search target, so a tight cap silently drops
    // real terms off the end of the page (caught 2026-08-02: "bluetooth"
    // fell outside a cap of 40). Headings are short, so this costs little.
    h: [...new Set(heads)].slice(0, 120),
    b: body.slice(0, BODY_CAP),
  });
}

docs.sort((a, b) => a.u.localeCompare(b.u));
const json = JSON.stringify(docs);
await writeFile(join(ROOT, 'search-index.json'), json);

const empty = docs.filter((d) => !d.b || d.b.length < 60).map((d) => d.u);
const noHeads = docs.filter((d) => d.h.length === 0).map((d) => d.u);

console.log(`Search index: ${docs.length} pages, ${(json.length / 1024).toFixed(1)} KB, ${skipped.length} skipped`);
if (empty.length) console.log(`  WARNING empty/short body: ${empty.join(', ')}`);
if (noHeads.length) console.log(`  note, no headings: ${noHeads.join(', ')}`);

// A page indexed with no body is the exact failure this script was written to
// end. Fail the build rather than shipping a silently broken index again.
if (empty.length) {
  console.error('Search index FAIL: page(s) indexed with no usable text.');
  process.exit(1);
}
