/*
 * THE LANGUAGE ROOT FIX.
 *
 * Found on the live site, 2026-08-05, minutes after the first deploy that
 * carried the translations, and it would have been a launch-day failure.
 *
 * WHAT HAPPENS. astro.config sets build.format = 'file', so a page at
 * src/pages/pt/index.astro is emitted as dist/pt.html, NOT dist/pt/index.html.
 * That is correct and it is what keeps every English URL extensionless. But
 * the other 46 Portuguese pages create a real dist/pt/ DIRECTORY, so the
 * built site contains BOTH:
 *
 *     dist/pt.html      <- the Portuguese home page
 *     dist/pt/          <- a directory, with no index.html in it
 *
 * Cloudflare Pages resolves a request for /pt against the directory, finds
 * no index, and returns 404. Measured on production: /pt 404s while
 * /pt.html and /pt/checklist both return 200. Every deep page works and only
 * the language's own front door is missing, which is the single worst page
 * to lose: it is where the picker points, where detection redirects, and
 * where any press link to the Portuguese site would land.
 *
 * THE FIX. Copy the language home into the directory as its index. No
 * redirect, no rewrite rule, no host-specific configuration: a static file
 * where the host expects one, which behaves identically on Cloudflare Pages,
 * Netlify, S3 or a plain nginx.
 *
 * WHY NOT A REDIRECT IN _redirects. Because check-i18n bans language
 * prefixes there, on purpose, and that ban is worth more than the
 * convenience. Redirect-based language handling is the practice that damages
 * indexing, and a rule that is relaxed once for a good reason stops being a
 * rule. A copied file needs no exception.
 *
 * The copy is byte-identical, so its canonical still points at /pt, which is
 * the URL the host will actually serve. Nothing links to /pt/index and the
 * canonical keeps the pair from ever being read as two pages.
 *
 * Run: node scripts/lang-roots.mjs dist
 */
import fs from 'node:fs';
import path from 'node:path';
import { LANGS } from '../src/i18n/registry.js';

const DIST = process.argv[2] || 'dist';
const made = [];
const fail = [];

for (const l of LANGS) {
  if (!l.prefix) continue; // English lives at /, which has a real index.html
  const flat = path.join(DIST, `${l.prefix.slice(1)}.html`);
  const dir = path.join(DIST, l.prefix.slice(1));

  if (!fs.existsSync(flat)) {
    fail.push(`${l.code}: expected ${flat} to exist and it does not`);
    continue;
  }
  // Only needed when a directory of the same name exists to shadow it.
  if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) continue;

  const index = path.join(dir, 'index.html');
  fs.copyFileSync(flat, index);
  made.push(`${l.prefix} -> ${path.relative(DIST, index)}`);
}

if (fail.length) {
  console.error('Language root check FAIL:');
  fail.forEach((m) => console.error('  ' + m));
  process.exit(1);
}
console.log(
  made.length
    ? `Language roots PASS (${made.length} served: ${made.join(', ')})`
    : 'Language roots PASS (nothing to do)'
);
