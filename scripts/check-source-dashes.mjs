/**
 * No em or en dashes anywhere in the source. Antonio's rule, 2026-08-02:
 * "I don't want any em dash anywhere, this screams made by AI."
 *
 * scripts/lint-content.mjs already bans them in RENDERED copy, which is what
 * a visitor reads. This check covers what that one cannot see: code comments.
 * The lint strips comments before testing (correct, comments are not copy),
 * so 7 em dashes were sitting inside HTML comments in checklist.astro and
 * shipping in the built output, invisible to the lint and visible to anyone
 * reading the page source.
 *
 * Prevention rather than another cleanup later: the same reason the search
 * index build fails on an empty page.
 *
 * Run: node scripts/check-source-dashes.mjs
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';

const ROOTS = ['src', 'scripts', 'public'];
const EXTS = new Set(['.astro', '.js', '.mjs', '.cjs', '.ts', '.css', '.json', '.html', '.md']);
// This file and the content lint both have to contain the characters in order
// to test for them.
const SKIP_FILES = new Set(['scripts/lint-content.mjs', 'scripts/check-source-dashes.mjs']);
const SKIP_DIRS = ['node_modules', 'dist', '.astro', 'public/fonts', 'design-archive'];

async function walk(dir, out = []) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (SKIP_DIRS.some((d) => p.includes(d))) continue;
    if (e.isDirectory()) await walk(p, out);
    else if (EXTS.has(p.slice(p.lastIndexOf('.')))) out.push(p);
  }
  return out;
}

const files = [];
for (const r of ROOTS) await walk(r, files);

const hits = [];
for (const f of files) {
  if (SKIP_FILES.has(f)) continue;
  const src = await readFile(f, 'utf8');
  const lines = src.split('\n');
  lines.forEach((line, i) => {
    if (/[—–]/.test(line)) {
      hits.push(`${f}:${i + 1}  ${line.trim().slice(0, 100)}`);
    }
  });
}

if (hits.length) {
  console.error('SOURCE DASH FAIL: em or en dash found. Use a comma, a colon or brackets.');
  hits.forEach((h) => console.error('  ' + h));
  process.exit(1);
}
console.log(`Source dash check PASS (${files.length} files, no em or en dashes)`);
