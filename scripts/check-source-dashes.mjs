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
/*
 * SKIPS ARE MATCHED AS PATH SEGMENTS, NOT AS SUBSTRINGS (fixed 2026-08-08).
 *
 * This list contained '.astro', meaning Astro's build cache directory, and the
 * walker tested it with `p.includes(d)`. So the string '.astro' matched EVERY
 * .astro FILE as well, and this check has never once looked inside one. It
 * reported "79 files, no em or en dashes" and passed, while the ~200 .astro
 * files, which is where essentially every code comment on this site lives, were
 * invisible to it. The first entry in EXTS is '.astro'. It could never match.
 *
 * That makes this the worst instance yet of the pattern this repo keeps hitting:
 * a check that quietly stops covering its own subject still prints PASS, and the
 * PASS is what stops anyone looking. Antonio's dash rule is the one he states
 * most often, and it was the one least enforced.
 *
 * Directories are now compared segment by segment, so '.astro' excludes the
 * cache directory and nothing else. 'public/fonts' keeps its slash and is still
 * matched as a prefix, deliberately.
 */
const SKIP_DIRS = ['node_modules', 'dist', '.astro', 'design-archive'];
const SKIP_PREFIXES = ['public/fonts'];

function skipped(p) {
  if (SKIP_PREFIXES.some((d) => p === d || p.startsWith(`${d}/`))) return true;
  return p.split('/').some((seg) => SKIP_DIRS.includes(seg));
}

async function walk(dir, out = []) {
  let entries;
  try { entries = await readdir(dir, { withFileTypes: true }); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e.name);
    if (skipped(p)) continue;
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
