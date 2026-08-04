/*
 * THE i18n SEO GUARD.
 *
 * Antonio's standing instruction on this whole phase: "be sure not to do
 * anything that will affect the SEO and GEO negatively." This script turns
 * that from a promise into a build failure. It runs in the gate, after the
 * build, against the real dist output.
 *
 * It asserts, in order of how badly each would hurt:
 *
 *  1. NO ENGLISH URL MOVED. Every English page that existed before i18n
 *     still exists at exactly the same path. Moving a ranked URL is the
 *     single most damaging thing an i18n project can do, and it is usually
 *     done by "tidying" everything into /en/. This is checked against a
 *     committed manifest, so the failure is loud and specific.
 *
 *  2. AN UNPUBLISHED LANGUAGE IS INVISIBLE. While a language's `live` flag
 *     is false: none of its pages may be indexable, none may appear in any
 *     sitemap, and NO page anywhere may carry an hreflang pointing at it.
 *     Google must not be able to discover it at all.
 *
 *  3. hreflang IS RECIPROCAL AND SELF-REFERENCING when languages ARE live.
 *     Google ignores an hreflang set where the versions do not all point at
 *     each other, and a missing self-reference is the most common way to
 *     get that silently wrong.
 *
 *  4. EVERY PAGE HAS EXACTLY ONE CANONICAL, and it points at itself in its
 *     own language. A translated page canonicalising to English would ask
 *     Google to drop the translation from the index entirely.
 *
 *  5. NO REDIRECT WAS ADDED FOR LANGUAGE. The _redirects file must not
 *     contain any language prefix rule. Redirect-based language switching
 *     is the specific practice that damages indexing, and it is banned by
 *     the detection spec.
 *
 * Run: node scripts/check-i18n.mjs dist
 */
import fs from 'node:fs';
import path from 'node:path';
import { LANGS, DEFAULT_LANG } from '../src/i18n/registry.js';

const DIST = process.argv[2] || 'dist';
const SITE = 'https://www.savemygig.com';
const fail = [];

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
};
const files = walk(DIST);

/** dist path -> site path. build.format is 'file', so pages are foo.html. */
const toUrlPath = (f) => {
  let u = '/' + path.relative(DIST, f).split(path.sep).join('/');
  u = u.replace(/\.html$/, '');
  return u === '/index' ? '/' : u.replace(/\/index$/, '');
};

const langOf = (urlPath) => {
  for (const l of LANGS) {
    if (!l.prefix) continue;
    if (urlPath === l.prefix || urlPath.startsWith(l.prefix + '/')) return l;
  }
  return LANGS.find((l) => l.code === DEFAULT_LANG);
};

const liveCodes = new Set(LANGS.filter((l) => l.live).map((l) => l.code));
const deadTags = LANGS.filter((l) => !l.live).map((l) => l.tag);

// ---- 1. no English URL moved -------------------------------------------
const MANIFEST = 'scripts/en-urls.json';
const englishNow = files.map(toUrlPath).filter((u) => langOf(u).code === DEFAULT_LANG).sort();
if (fs.existsSync(MANIFEST)) {
  const before = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
  const now = new Set(englishNow);
  const missing = before.filter((u) => !now.has(u));
  if (missing.length) {
    fail.push(`ENGLISH URLS DISAPPEARED (${missing.length}). These were live and ranked:`);
    missing.slice(0, 12).forEach((u) => fail.push(`    ${u}`));
  }
} else {
  fs.writeFileSync(MANIFEST, JSON.stringify(englishNow, null, 2) + '\n');
  console.log(`  wrote ${MANIFEST} (${englishNow.length} English URLs) as the baseline`);
}

// ---- 2..4. per-page assertions -----------------------------------------
let checkedAlt = 0;
for (const f of files) {
  const u = toUrlPath(f);
  const L = langOf(u);
  const html = fs.readFileSync(f, 'utf8');
  const rel = path.relative(DIST, f);

  const robots = (html.match(/<meta name="robots" content="([^"]*)"/) || [])[1] || '';
  const canonicals = [...html.matchAll(/<link rel="canonical" href="([^"]*)"/g)].map((m) => m[1]);
  const alts = [...html.matchAll(/<link rel="alternate" hreflang="([^"]*)" href="([^"]*)"/g)]
    .map((m) => ({ tag: m[1], href: m[2] }));

  // 2. unpublished languages must be invisible
  if (!L.live && !robots.includes('noindex')) {
    fail.push(`${rel}: language "${L.code}" is not live but the page is indexable (robots="${robots}")`);
  }
  for (const a of alts) {
    if (deadTags.includes(a.tag)) {
      fail.push(`${rel}: hreflang points at "${a.tag}", which is NOT live. Google must not learn it exists.`);
    }
  }

  // 4. exactly one self-referencing canonical.
  //    Required on every page, including the noindex tunnel: robots.txt lets
  //    AI crawlers into /protocol/ on purpose, and an answer engine needs a
  //    stable URL to cite a rescue step by.
  if (canonicals.length !== 1) {
    fail.push(`${rel}: expected exactly 1 canonical, found ${canonicals.length}`);
  } else {
    const want = SITE + (u === '/' ? '/' : u);
    if (canonicals[0] !== want) {
      fail.push(`${rel}: canonical is ${canonicals[0]}, expected ${want} (a page must canonicalise to itself)`);
    }
  }

  // 3. reciprocity, only meaningful once something is live
  if (alts.length) {
    checkedAlt++;
    const tags = new Set(alts.map((a) => a.tag));
    if (!tags.has(L.tag)) {
      fail.push(`${rel}: hreflang set omits its OWN language "${L.tag}". Google discards non-self-referencing sets.`);
    }
    for (const code of liveCodes) {
      const l = LANGS.find((x) => x.code === code);
      if (!tags.has(l.tag)) fail.push(`${rel}: hreflang set is missing live language "${l.tag}"`);
    }
    if (!html.includes('hreflang="x-default"')) {
      fail.push(`${rel}: hreflang set has no x-default`);
    }
  }
}

// ---- 2b. sitemaps must not contain an unpublished language --------------
for (const f of fs.readdirSync(DIST).filter((n) => n.startsWith('sitemap') && n.endsWith('.xml'))) {
  const xml = fs.readFileSync(path.join(DIST, f), 'utf8');
  for (const l of LANGS) {
    if (l.live || !l.prefix) continue;
    if (xml.includes(`${SITE}${l.prefix}/`) || xml.includes(`${SITE}${l.prefix}<`)) {
      fail.push(`${f}: contains URLs for "${l.code}", which is not live`);
    }
  }
}

// ---- 5. no language redirects ------------------------------------------
const redirects = path.join(DIST, '_redirects');
if (fs.existsSync(redirects)) {
  for (const line of fs.readFileSync(redirects, 'utf8').split('\n')) {
    const l = line.trim();
    if (!l || l.startsWith('#')) continue;
    for (const lang of LANGS) {
      if (!lang.prefix) continue;
      if (l.startsWith(lang.prefix + '/') || l.startsWith(lang.prefix + ' ')) {
        fail.push(`_redirects: language redirect found, which is banned by the detection spec: "${l}"`);
      }
    }
  }
}

if (fail.length) {
  console.error('i18n SEO guard FAIL:');
  fail.slice(0, 25).forEach((m) => console.error('  ' + m));
  if (fail.length > 25) console.error(`  ... and ${fail.length - 25} more`);
  process.exit(1);
}
const liveList = LANGS.filter((l) => l.live).map((l) => l.tag).join(', ');
const heldList = LANGS.filter((l) => !l.live).map((l) => l.tag).join(', ') || 'none';
console.log(
  `i18n SEO guard PASS (${files.length} pages; live: ${liveList}; held back: ${heldList}; ` +
  `${checkedAlt} pages with hreflang; ${englishNow.length} English URLs intact)`
);
