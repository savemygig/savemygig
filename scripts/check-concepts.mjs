/*
 * CONCEPT REGISTRY INTEGRITY (gate check, added 2026-08-03).
 *
 * The registry in src/data/concepts.js is the single answer to "where does
 * this idea live". Its whole value is that a link written once keeps pointing
 * at the best destination as the site grows. That only holds if a moved page
 * or a renamed dictionary term BREAKS THE BUILD instead of rotting quietly.
 *
 * Checks, against the BUILT output (never the source, per the standing lesson
 * from the search-index incident):
 *   1. every destination resolves to a real built page
 *   2. every #fragment exists as an id in that page's HTML
 *   3. concept keys are unique
 *   4. products always resolve to a page, never to the dictionary
 *   5. every concept anchor exists in the dictionary even when an article
 *      currently outranks it, so the fallback is always safe to reach for
 */
import { readFile, access } from 'node:fs/promises';
import { join } from 'node:path';
import { CONCEPTS, hrefFor, DICTIONARY } from '../src/data/concepts.js';

const DIST = process.argv[2] ?? 'dist';
const fails = [];
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!cond) fails.push(name);
};

async function fileFor(path) {
  const clean = path.replace(/[?#].*$/, '').replace(/\/$/, '');
  const candidates = clean === ''
    ? [join(DIST, 'index.html')]
    : [join(DIST, `${clean}.html`), join(DIST, clean, 'index.html')];
  for (const c of candidates) {
    try { await access(c); return c; } catch { /* next */ }
  }
  return null;
}

// 3. unique keys
const keys = CONCEPTS.map((c) => c.key);
const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
ok('concept keys are unique', dupes.length === 0, dupes.join(', ') || `${keys.length} concepts`);

// 4. products resolve to their own page
const strays = CONCEPTS.filter((c) => c.kind === 'product' && (!c.page || c.page.startsWith(DICTIONARY)));
ok('every product resolves to its own page', strays.length === 0, strays.map((c) => c.key).join(', ') || 'no product falls back to the dictionary');

// 1 + 2. every resolved destination exists, fragment included
const broken = [];
for (const c of CONCEPTS) {
  const href = hrefFor(c.key);
  if (!href) { broken.push(`${c.key}: does not resolve`); continue; }
  const [path, frag] = href.split('#');
  const file = await fileFor(path);
  if (!file) { broken.push(`${c.key}: no built page at ${path}`); continue; }
  if (frag) {
    const html = await readFile(file, 'utf-8');
    if (!html.includes(`id="${frag}"`)) broken.push(`${c.key}: ${path} has no id="${frag}"`);
  }
}
ok('every destination resolves, anchors included', broken.length === 0, broken.join('; ') || `${CONCEPTS.length} destinations`);

// 5. the dictionary fallback is always reachable, even when an article wins
const dictFile = await fileFor(DICTIONARY);
const dictHtml = dictFile ? await readFile(dictFile, 'utf-8') : '';
const missingAnchors = CONCEPTS
  .filter((c) => c.kind === 'concept' && c.anchor)
  .filter((c) => !dictHtml.includes(`id="${c.anchor}"`))
  .map((c) => `${c.key} -> #${c.anchor}`);
ok('every concept anchor exists in the dictionary', missingAnchors.length === 0, missingAnchors.join('; ') || 'all anchors present');

console.log('');
if (fails.length) {
  console.error(`Concept registry check FAILED: ${fails.length} failure(s)`);
  process.exit(1);
}
console.log('Concept registry check PASS');
