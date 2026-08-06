/** Architecture/standards audit. Run: node scripts/audit-standards.mjs */
import { readdir, readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = 'dist';
const SITE = 'https://www.savemygig.com';

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else out.push(p);
  }
  return out;
}

const allFiles = await walk(ROOT);
const htmlFiles = allFiles.filter((f) => f.endsWith('.html'));

function routeOf(file) {
  let r = file.slice(ROOT.length).replace(/\.html$/, '');
  if (r.endsWith('/index')) r = r.slice(0, -6);
  return r || '/';
}
const routes = new Map(htmlFiles.map((f) => [routeOf(f), f]));

// Resolve a site-absolute path to a dist file (page or asset)
function resolves(path) {
  if (path === '/' ) return existsSync(join(ROOT, 'index.html'));
  const p = path.replace(/\/$/, '');
  return (
    existsSync(join(ROOT, p + '.html')) ||
    existsSync(join(ROOT, p, 'index.html')) ||
    existsSync(join(ROOT, p))
  );
}

// ---- parse _redirects ----
const redirLines = (await readFile('public/_redirects', 'utf8')).split('\n');
const redirects = [];
for (const line of redirLines) {
  const t = line.trim();
  if (!t || t.startsWith('#')) continue;
  const parts = t.split(/\s+/);
  redirects.push({ from: parts[0], to: parts[1], code: parts[2] || '' });
}
const redirMap = new Map(redirects.map((r) => [r.from, r.to]));

console.log('=== C. REDIRECTS ===');
let cFail = 0;
for (const r of redirects) {
  const external = /^https?:\/\//.test(r.to) && !r.to.startsWith(SITE);
  const toPath = r.to.replace(SITE, '').split(/[?#]/)[0];
  if (!external && !resolves(toPath) && !existsSync(join(ROOT, toPath.replace(/^\//, '')))) {
    // special: sitemap-index.xml is a file in dist
    console.log(`  TARGET-404: ${r.from} -> ${r.to}`);
    cFail++;
  }
  if (redirMap.has(toPath)) {
    console.log(`  CHAIN: ${r.from} -> ${r.to} -> ${redirMap.get(toPath)}`);
    cFail++;
  }
}
if (!cFail) console.log('  PASS: all', redirects.length, 'redirect targets exist, no chains');

// ---- per-page data collection ----
const pages = [];
for (const f of htmlFiles) {
  const html = await readFile(f, 'utf8');
  pages.push({ file: f, route: routeOf(f), html });
}

console.log('\n=== D. INTERNAL LINKS ===');
let dDead = [], dRedir = new Map(), dHashPlaceholder = [], dAnchorFail = [];
const idCache = new Map();
function idsOf(route) {
  if (!idCache.has(route)) {
    const p = pages.find((x) => x.route === route);
    const ids = new Set();
    if (p) for (const m of p.html.matchAll(/\sid=["']([^"']+)["']/g)) ids.add(m[1]);
    idCache.set(route, ids);
  }
  return idCache.get(route);
}
for (const p of pages) {
  for (const m of p.html.matchAll(/href=["']([^"']*)["']/g)) {
    let href = m[1];
    if (/^(mailto:|tel:|javascript:)/.test(href)) continue;
    if (/^https?:\/\//.test(href)) {
      if (!href.startsWith(SITE)) continue;
      href = href.slice(SITE.length) || '/';
    }
    if (href === '#') { dHashPlaceholder.push(`${p.route}`); continue; }
    if (href.startsWith('#')) {
      const id = href.slice(1);
      if (id && !idsOf(p.route).has(id)) dAnchorFail.push(`${p.route} -> #${id} (same page, id missing)`);
      continue;
    }
    if (!href.startsWith('/')) continue; // relative: none expected; skip data: etc
    const [pathAndQuery, frag] = href.split('#');
    const path = pathAndQuery.split('?')[0];
    if (resolves(path)) {
      if (frag) {
        const r = path === '/' ? '/' : path.replace(/\/$/, '');
        if (routes.has(r) && !idsOf(r).has(frag)) dAnchorFail.push(`${p.route} -> ${path}#${frag} (id missing on target)`);
      }
      continue;
    }
    if (redirMap.has(path)) {
      const k = `${path} -> ${redirMap.get(path)}`;
      if (!dRedir.has(k)) dRedir.set(k, []);
      dRedir.get(k).push(p.route);
      continue;
    }
    dDead.push(`${p.route} -> ${href}`);
  }
}
console.log(dDead.length ? '  DEAD LINKS:\n    ' + [...new Set(dDead)].join('\n    ') : '  no dead internal links');
for (const [k, v] of dRedir) console.log(`  REDIRECTED LINK (update to final): ${k}  [on ${[...new Set(v)].slice(0,8).join(', ')}${v.length>8?` +${v.length-8} more`:''}]`);
console.log(dHashPlaceholder.length ? '  href="#" placeholders on: ' + [...new Set(dHashPlaceholder)].join(', ') : '  no href="#" placeholders');
console.log(dAnchorFail.length ? '  BROKEN ANCHORS:\n    ' + [...new Set(dAnchorFail)].join('\n    ') : '  all anchors resolve');

console.log('\n=== E. META ===');
const titleMap = new Map(), descMap = new Map();
for (const p of pages) {
  const title = (p.html.match(/<title>([\s\S]*?)<\/title>/) || [])[1]?.trim() ?? '';
  const desc = (p.html.match(/<meta name="description" content="([^"]*)"/) || [])[1] ?? '';
  const og = (p.html.match(/<meta property="og:image" content="([^"]*)"/) || [])[1] ?? '';
  p.title = title; p.desc = desc; p.og = og;
  if (!title) console.log(`  MISSING TITLE: ${p.route}`);
  if (!desc) console.log(`  MISSING DESCRIPTION: ${p.route}`);
  if (title.length > 75) console.log(`  LONG TITLE (${title.length}): ${p.route} "${title}"`);
  if (desc.length > 185) console.log(`  LONG DESC (${desc.length}): ${p.route}`);
  if (title) (titleMap.get(title) ?? titleMap.set(title, []).get(title)).push(p.route);
  if (desc) (descMap.get(desc) ?? descMap.set(desc, []).get(desc)).push(p.route);
  if (!og) console.log(`  MISSING og:image: ${p.route}`);
  else {
    const ogPath = og.replace(SITE, '').split('?')[0];
    if (!existsSync(join(ROOT, ogPath.replace(/^\//, '')))) console.log(`  BROKEN og:image: ${p.route} -> ${og}`);
  }
}
for (const [t, rs] of titleMap) if (rs.length > 1) console.log(`  DUP TITLE (${rs.length}): "${t}" on ${rs.join(', ')}`);
for (const [d, rs] of descMap) if (rs.length > 1) console.log(`  DUP DESC (${rs.length}): "${d.slice(0,60)}..." on ${rs.join(', ')}`);
console.log('  (checked', pages.length, 'pages)');

console.log('\n=== F. NOINDEX + SITEMAP ===');
const mustNoindex = ['/legal/privacy', '/legal/terms', '/legal/cookies', '/partners'];
const noindexed = new Set();
for (const p of pages) {
  const noidx = /<meta name="robots" content="noindex/.test(p.html);
  if (noidx) noindexed.add(p.route);
}
for (const r of mustNoindex) console.log(`  ${r}: ${noindexed.has(r) ? 'noindex OK' : 'FAIL - NOT noindexed'}`);
const tunnel = pages.filter((p) => p.route.startsWith('/protocol/'));
const tunnelIndexed = tunnel.filter((p) => !noindexed.has(p.route));
console.log(`  /protocol/* tunnel: ${tunnel.length} pages, ${tunnelIndexed.length ? 'FAIL - indexed: ' + tunnelIndexed.map(p=>p.route).join(', ') : 'all noindex OK'}`);
console.log(`  /legal/disclaimer: ${noindexed.has('/legal/disclaimer') ? 'FAIL - noindexed but must be INDEXED' : 'indexed OK'}`);
console.log('  All noindexed pages:', [...noindexed].sort().join(', '));
// sitemap
let smUrls = [];
for (const sm of allFiles.filter((f) => /sitemap.*\.xml$/.test(f))) {
  const xml = await readFile(sm, 'utf8');
  for (const m of xml.matchAll(/<loc>([^<]+)<\/loc>/g)) if (!m[1].includes('sitemap')) smUrls.push(m[1]);
}
let smFail = 0;
for (const u of smUrls) {
  const path = u.replace(SITE, '') || '/';
  if (noindexed.has(path === '/' ? '/' : path.replace(/\/$/, ''))) { console.log(`  SITEMAP CONTAINS NOINDEXED: ${u}`); smFail++; }
  if (!resolves(path)) { console.log(`  SITEMAP URL 404: ${u}`); smFail++; }
}
console.log(`  sitemap: ${smUrls.length} URLs${smFail ? '' : ', all resolve, none noindexed'}`);
// indexable pages missing from sitemap
const smPaths = new Set(smUrls.map((u) => (u.replace(SITE, '') || '/').replace(/\/$/, '') || '/'));
for (const p of pages) {
  if (!noindexed.has(p.route) && !smPaths.has(p.route) && p.route !== '/404' && p.route !== '/offline')
    console.log(`  INDEXABLE PAGE MISSING FROM SITEMAP: ${p.route}`);
}

console.log('\n=== G. JSON-LD ===');
let gFail = 0;
const familyTypes = new Map();
for (const p of pages) {
  const types = [];
  for (const m of p.html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      const j = JSON.parse(m[1]);
      const arr = Array.isArray(j) ? j : (j['@graph'] ?? [j]);
      for (const o of arr) types.push(o['@type']);
    } catch (e) {
      console.log(`  INVALID JSON-LD: ${p.route} (${e.message.slice(0, 60)})`);
      gFail++;
    }
  }
  const fam = p.route === '/' ? '/' : '/' + p.route.split('/')[1];
  if (!familyTypes.has(fam)) familyTypes.set(fam, new Map());
  const fm = familyTypes.get(fam);
  const key = types.sort().join('+') || '(none)';
  fm.set(key, (fm.get(key) ?? 0) + 1);
}
if (!gFail) console.log('  all JSON-LD blocks parse');
for (const [fam, fm] of [...familyTypes].sort()) {
  console.log(`  ${fam}: ${[...fm].map(([k, n]) => `${k} x${n}`).join(' | ')}`);
}

/*
 * H. SEARCH INDEX. Repaired 2026-08-06, and it had TWO faults, not one.
 *
 *   1. It read a single flat search-index.json. That file stopped existing on
 *      2026-08-05 when the index was split per language, so this section threw
 *      ENOENT and took the whole audit down with it. That is the fault that got
 *      noticed.
 *   2. It read the wrong key, and had done since it was written. Entries look
 *      like {u,t,d,h,b}; this asked for `r.url ?? r.path ?? r.route ?? r.href`,
 *      all four of which are undefined. So idxRoutes was a set containing
 *      exactly `undefined`, and the section reported EVERY content page as
 *      missing from the index. Whoever last ran it either did not read the
 *      output or read it and assumed the noise was the audit working.
 *
 * Fault 2 is the more interesting one: a broken diagnostic that still prints is
 * worse than one that crashes, because a crash gets fixed. Kept and repaired
 * rather than deleted, because the rest of this file (link resolution, JSON-LD
 * families, canonicals) is not duplicated by anything in the gate.
 */
console.log('\n=== H. SEARCH INDEX ===');
const IDX_LANGS = ['en', 'pt', 'es'];
const idxRoutes = new Set();
let idxTotal = 0;
let idxKeys = [];
for (const code of IDX_LANGS) {
  const file = join(ROOT, `search-index.${code}.json`);
  if (!existsSync(file)) { console.log(`  MISSING INDEX FILE: search-index.${code}.json`); continue; }
  const part = JSON.parse(await readFile(file, 'utf8'));
  idxTotal += part.length;
  if (!idxKeys.length && part.length) idxKeys = Object.keys(part[0]);
  for (const r of part) idxRoutes.add(r.u);
  console.log(`  search-index.${code}.json: ${part.length} entries`);
}
console.log('  total index entries:', idxTotal, '| keys:', idxKeys.join(','));
// English canonical paths. A pt or es route has its prefix stripped before the
// test, so one list covers all three languages. Same rule as autolink rule 10.
const EXCLUDE = ['/protocol/', '/saved', '/files-lost', '/card-ready', '/feedback',
  '/legal/privacy', '/legal/terms', '/legal/cookies', '/partners', '/404', '/search', '/offline'];
const enRoute = (r) => r.replace(/^\/(?:pt|es)(?=\/|$)/, '') || '/';
const missing = [];
for (const p of pages) {
  const en = enRoute(p.route);
  if (EXCLUDE.some((x) => en === x || en.startsWith(x))) continue;
  if (!idxRoutes.has(p.route)) missing.push(p.route);
}
console.log(missing.length ? '  CONTENT PAGES MISSING FROM INDEX: ' + missing.join(', ') : '  all non-excluded pages indexed');
const extra = [...idxRoutes].filter((r) => !routes.has(r));
if (extra.length) console.log('  INDEX ENTRIES WITH NO PAGE: ' + extra.join(', '));

console.log('\n=== I. CANONICALS ===');
let iFail = 0;
for (const p of pages) {
  const can = (p.html.match(/<link rel="canonical" href="([^"]*)"/) || [])[1];
  const expected = p.route === '/' ? [`${SITE}/`, SITE] : [`${SITE}${p.route}`];
  if (!can) { console.log(`  MISSING CANONICAL: ${p.route}`); iFail++; }
  else if (!expected.includes(can)) { console.log(`  WRONG CANONICAL: ${p.route} -> ${can}`); iFail++; }
}
if (!iFail) console.log('  PASS: all', pages.length, 'canonicals correct (www.savemygig.com + path)');
