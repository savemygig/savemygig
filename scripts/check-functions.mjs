// Syntax-check every Cloudflare Pages Function before push.
//
// WHY THIS EXISTS: on 2026-07-27 a duplicate `order` declaration in
// functions/api/backup.js killed EVERY production deployment for a full day.
// `astro build` never touches functions/, so the local gate stayed green
// while Cloudflare's deploy-time esbuild failed, and production silently
// froze on the last good build. `node --check` parses each file (the repo is
// "type":"module", so ESM syntax is understood) and catches exactly this
// class of error: duplicate declarations, unbalanced braces, bad exports.
// It does not execute anything.
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p));
    else if (e.name.endsWith('.js') || e.name.endsWith('.mjs')) out.push(p);
  }
  return out;
}

const files = await walk('functions');
let failed = 0;
for (const f of files) {
  try {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  } catch (e) {
    failed++;
    console.error(`FUNCTIONS CHECK FAIL: ${f}\n${e.stderr?.toString() || e.message}`);
  }
}
if (failed) process.exit(1);
console.log(`Functions check PASS (${files.length} files parse cleanly)`);
