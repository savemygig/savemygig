#!/usr/bin/env node
/**
 * STRIP HTML COMMENTS FROM THE BUILT SITE.
 *
 * WHY (2026-08-03): this codebase deliberately writes its decision history
 * into comments, and Astro ships <!-- --> HTML comments straight into the
 * built pages. That meant 107 pages were carrying internal notes in
 * view-source: named people (the company is FACELESS by decision), internal
 * reasoning, review quotes. One shipped comment named a tester. The comments
 * are for the repo, not for the public.
 *
 * The source keeps every comment. Only dist is stripped. Astro's {/* ... * /}
 * frontmatter-style comments never ship anyway; this catches the <!-- -->
 * kind that do.
 *
 * Runs right after astro build, BEFORE autolink and the search index, so
 * every downstream artefact is generated from the stripped HTML. The gate's
 * browser tests (search, offline, checklist drag, promo fit) run after this,
 * so a stripping bug that broke a page would fail the build, not ship.
 * Side benefit: smaller HTML.
 */

import fs from 'node:fs';
import path from 'node:path';
// Astro's own bundler, guaranteed present. Used to strip comments from
// INLINE SCRIPTS, because a regex cannot safely tell a JS comment from a
// URL's double slash or a string containing comment markers. esbuild parses
// the code for real; minify stays OFF so the shipped JS remains diffable.
import { transformSync } from 'esbuild';

const DIST = process.argv[2] || 'dist';

const files = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) files.push(p);
  }
})(DIST);

let touched = 0;
let bytes = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  // HTML comments are stripped by regex OUTSIDE script/style. Inside inline
  // <script> blocks the JS comments (which also shipped, and also carried
  // names) are stripped by esbuild, a real parser, because a regex cannot
  // tell a comment from a URL's double slash. JSON-LD blocks (type=
  // application/ld+json) are NEVER touched: they are data, not JS, and
  // esbuild would mangle them.
  const parts = html.split(/(<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>)/g);
  const out = parts
    .map((part, i) => {
      if (i % 2 === 0) return part.replace(/<!--[\s\S]*?-->/g, '');
      const m = part.match(/^(<script([^>]*)>)([\s\S]*)(<\/script>)$/);
      if (!m) return part;
      const attrs = m[2];
      if (/type\s*=/.test(attrs) && !/type\s*=\s*["']?(module|text\/javascript)/.test(attrs)) return part; // ld+json etc.
      if (!m[3].trim()) return part; // external script, no body
      try {
        const res = transformSync(m[3], { minify: false, legalComments: 'none' });
        return m[1] + res.code + m[4];
      } catch {
        return part; // unparseable: leave it, the name assertion below decides
      }
    })
    .join('');
  if (out !== html) {
    fs.writeFileSync(f, out);
    touched++;
    bytes += html.length - out.length;
  }
}

console.log(`Strip comments: ${touched} pages cleaned, ${(bytes / 1024).toFixed(1)} KB of internal notes removed from public HTML`);

// The assertion that motivated this script: no personal names in anything a
// visitor can download. Extend the list if the faceless rule ever gains names.
//
// SCOPE WIDENED 2026-08-04, after the pre-press audit. The old version checked
// only .html plus llms.txt, so it never looked at anything copied verbatim out
// of public/. A first name sat in a code comment in sw.js, which every visitor
// fetches, and shipped for weeks with the gate passing. Now EVERY text file in
// dist is scanned: js, json, txt, svg, webmanifest, _redirects, _headers.
const FORBIDDEN = ['Antonio', 'Afonso'];
const TEXT_EXT = ['.html', '.js', '.mjs', '.json', '.txt', '.svg', '.xml', '.css', '.webmanifest'];
const TEXT_NAMED = ['_redirects', '_headers'];
const textFiles = [];
(function walkAll(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walkAll(p);
    else if (TEXT_EXT.some((x) => e.name.endsWith(x)) || TEXT_NAMED.includes(e.name)) textFiles.push(p);
  }
})(DIST);
const leaks = [];
for (const f of textFiles) {
  const t = fs.readFileSync(f, 'utf8');
  for (const name of FORBIDDEN) if (t.includes(name)) leaks.push(`${path.relative(DIST, f)}: ${name}`);
}
if (leaks.length) {
  console.error('Strip comments FAIL: personal names still public');
  leaks.slice(0, 10).forEach((l) => console.error('  ' + l));
  process.exit(1);
}
console.log(`Faceless check PASS (no personal names in ${textFiles.length} public text files)`);
