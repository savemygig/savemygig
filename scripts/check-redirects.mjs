#!/usr/bin/env node
/**
 * REDIRECT INTEGRITY CHECK.
 *
 * public/_redirects is where old URLs are kept alive. Every rule in it exists
 * because something out there, a search result or somebody's bookmark, still
 * points at the old address. Two things silently break that promise:
 *
 *   A CHAIN. A rule whose TARGET is itself the SOURCE of another rule, so a
 *   crawler follows 301 -> 301 -> page. Every hop costs crawl budget and leaks
 *   a little link equity, and browsers give up entirely after enough of them.
 *   Found 2026-08-03: /protocol/quick-fix/rekordbox-check pointed at
 *   /protocol/export/rb-check, which had itself been redirected to
 *   /protocol/export/backup when those two screens merged. Nobody updated the
 *   first rule, because nothing was watching.
 *
 *   A DEAD TARGET. A rule pointing at a page that no longer exists, which
 *   turns a recoverable old URL into a 404 for the visitor AND for Google.
 *
 * Both are invisible in normal use: the redirect still "works" from a browser,
 * it just works badly. Only a check that walks every target against every
 * source finds them.
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] || 'dist';
const FILE = 'public/_redirects';

if (!fs.existsSync(FILE)) {
  console.log('Redirect check SKIPPED (no _redirects file)');
  process.exit(0);
}

const rules = [];
for (const raw of fs.readFileSync(FILE, 'utf8').split('\n')) {
  const line = raw.trim();
  if (!line || line.startsWith('#')) continue;
  const [from, to, code] = line.split(/\s+/);
  if (!from || !to) continue;
  rules.push({ from, to, code: code || '' });
}

const sources = new Map(rules.map((r) => [r.from, r.to]));
const problems = [];

for (const r of rules) {
  // Chains. A splat or placeholder target cannot be resolved statically, so it
  // is skipped rather than guessed at.
  if (!r.to.includes(':') && !r.to.includes('*') && sources.has(r.to)) {
    problems.push(`chain: ${r.from} -> ${r.to} -> ${sources.get(r.to)}`);
  }

  // Dead targets. External and dynamic targets are out of scope.
  if (r.to.startsWith('http') || r.to.includes(':') || r.to.includes('*')) continue;
  const clean = r.to.split('#')[0].split('?')[0].replace(/^\//, '').replace(/\/$/, '');
  if (!clean) continue;
  const exists =
    fs.existsSync(path.join(DIST, `${clean}.html`)) ||
    fs.existsSync(path.join(DIST, clean, 'index.html')) ||
    fs.existsSync(path.join(DIST, clean));
  if (!exists) problems.push(`dead target: ${r.from} -> ${r.to}`);
}

if (problems.length) {
  console.error('\nRedirect check FAIL');
  problems.forEach((p) => console.error('  ' + p));
  console.error('\n  Point the rule at the FINAL destination, not at another redirect.');
  process.exit(1);
}
console.log(`Redirect check PASS (${rules.length} rules, no chains, no dead targets)`);
