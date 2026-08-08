#!/usr/bin/env node
/*
 * EVERY CSS CUSTOM PROPERTY A STYLE READS MUST BE ONE THAT EXISTS.
 *
 * WHY THIS EXISTS. Writing the lineage chain on 2026-08-08 I styled it with
 * `var(--dim)` and `var(--line)`. Neither is a token in this project. `--dim`
 * was me remembering the `.dim` CLASS and assuming a variable of the same name;
 * `--line` I invented outright. The build succeeded, the gate passed, and the
 * page rendered: an undefined custom property is not an error in CSS, the
 * declaration is simply dropped. So the label colour silently inherited and the
 * chain's arrow connectors silently did not draw at all.
 *
 * That is the worst failure shape this project keeps finding, in a new place.
 * Nothing said PASS while being wrong, because nothing was looking. A style
 * that quietly does nothing looks identical to a style nobody needed, and the
 * next person to touch it cannot tell which it was.
 *
 * The tokens are already centralised in global.css. The rule that they are the
 * only ones anybody may spend was a rule someone had to remember. Now it is
 * measured.
 *
 * WHAT IS ASSERTED. Every `var(--name)` read anywhere in src/ resolves to a
 * `--name` that is declared in global.css, declared in the same file (a
 * component may legitimately scope a local token), or created at runtime with
 * setProperty (see RUNTIME below).
 *
 * WHAT IS NOT ASSERTED. Unused tokens. A palette entry nobody has spent yet is
 * not a defect, and failing on it would push people to delete tokens that exist
 * on purpose.
 *
 * A WRITTEN FALLBACK DOES NOT EXCUSE AN UNKNOWN NAME. `var(--typo, 0px)`
 * renders, so nothing looks broken, and the fallback is taken every single
 * time. That is the same bug wearing a seatbelt, so it still fails. It is only
 * fine when the name is real and merely not set yet, which is exactly the
 * runtime case.
 *
 * THIS SCRIPT ONLY READS. It asserts and never writes, so it belongs in the
 * gate and not in the build, per the standing build-parity doctrine.
 */

import fs from 'node:fs';
import path from 'node:path';

const SRC = 'src';
const GLOBAL = path.join(SRC, 'styles', 'global.css');

/** Every file under a directory whose extension can carry CSS. */
function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (/\.(css|astro)$/.test(entry.name)) out.push(full);
  }
  return out;
}

const DECLARE = /(^|[\s;{])(--[a-zA-Z0-9_-]+)\s*:/g;
const READ = /var\(\s*(--[a-zA-Z0-9_-]+)/g;
/*
 * A token can also be created at RUNTIME, and one on this site is: Consent.astro
 * measures the cookie banner and does
 * `document.documentElement.style.setProperty('--ck-h', h + 'px')`, which
 * global.css then reads with an explicit `var(--ck-h, 0px)` fallback for the
 * moment before it exists. That is a deliberate, working pattern, and the first
 * version of this check called it an error.
 *
 * A check that cries wolf is a check people learn to skip, so runtime tokens
 * count as declared. They are collected across the whole of src, not per file,
 * because the script that sets one and the stylesheet that reads it are never
 * the same file.
 */
const RUNTIME = /setProperty\(\s*['"`](--[a-zA-Z0-9_-]+)['"`]/g;

const names = (src, re) => {
  const found = new Set();
  for (const m of src.matchAll(re)) found.add(m[re === DECLARE ? 2 : 1]);
  return found;
};

if (!fs.existsSync(GLOBAL)) {
  console.error(`FAIL  ${GLOBAL} not found, so no token could be resolved.`);
  console.error('      This check is anchored to the shared palette. If it moved,');
  console.error('      point GLOBAL at the new file deliberately.');
  process.exit(1);
}

const globalTokens = names(fs.readFileSync(GLOBAL, 'utf8'), DECLARE);

// Runtime tokens, gathered before the per-file pass so order cannot matter.
const runtimeTokens = new Set();
for (const file of walk(SRC)) {
  for (const m of fs.readFileSync(file, 'utf8').matchAll(RUNTIME)) runtimeTokens.add(m[1]);
}
if (globalTokens.size === 0) {
  console.error(`FAIL  no custom properties found in ${GLOBAL}.`);
  console.error('      A check that resolves every name against an empty set would');
  console.error('      fail everything, or worse, pass everything. Stopping instead.');
  process.exit(1);
}

let failed = 0;
let reads = 0;

for (const file of walk(SRC)) {
  const src = fs.readFileSync(file, 'utf8');
  const local = names(src, DECLARE);
  for (const m of src.matchAll(READ)) {
    reads++;
    const token = m[1];
    if (globalTokens.has(token) || local.has(token) || runtimeTokens.has(token)) continue;
    failed++;
    const line = src.slice(0, m.index).split('\n').length;
    console.error(`FAIL  ${file}:${line} reads var(${token}), which is not defined`);
    console.error(`        Not in ${GLOBAL}, not declared in this file, and never`);
    console.error('        created at runtime with setProperty.');
    console.error('        An undefined custom property is not a CSS error: the whole');
    console.error('        declaration is dropped and the page still renders, so this');
    console.error('        style is doing nothing and looks exactly like one nobody needed.');
  }
}

if (failed) {
  console.error(`\nCSS variable check FAIL: ${failed} undefined token read(s).`);
  process.exit(1);
}

console.log(
  `PASS  css tokens  ${reads} var() reads across src, every one resolves `
  + `(${globalTokens.size} in global.css, ${runtimeTokens.size} set at runtime)`,
);
