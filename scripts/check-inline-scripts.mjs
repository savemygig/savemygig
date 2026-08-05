/**
 * PARSE EVERY INLINE SCRIPT THAT SHIPS.
 *
 * WHY THIS EXISTS (2026-08-05). EmailCapture.astro's `is:inline` block was
 * written in TypeScript: ten `as HTMLElement` casts inside a script Astro
 * copies out byte for byte, with no TS pass over it. Browsers therefore threw
 * a SyntaxError while parsing the block, the submit listener never bound, and
 * the form did what an unhandled <form> does: a native GET that put the
 * reader's email address in the query string and never called /api/subscribe.
 * The form looked completely normal. Nobody got subscribed for as long as it
 * was live.
 *
 * Nothing in the pipeline could have caught it. Astro does not parse inline
 * scripts, the HTML is valid, the CSS is valid, and every browser test we had
 * asserted on markup rather than behaviour. A syntax error in shipped JS is
 * invisible until a human opens a console.
 *
 * So: extract every <script> in dist that has no src, and parse it. A parse
 * failure fails the build with the file and the offending snippet.
 *
 * WHAT IS SKIPPED, and why that is safe:
 *   - scripts with src (Astro's bundles, which the compiler already type
 *     checked and minified),
 *   - non-JS types, i.e. application/ld+json and any template type. JSON-LD
 *     is validated by scripts/check-head.mjs instead.
 *
 * Run: node scripts/check-inline-scripts.mjs dist
 */
import { readdir, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import vm from 'node:vm';

const ROOT = process.argv[2] || 'dist';

async function walk(dir, out = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) await walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

/** JS types a browser will actually execute. Anything else is data. */
const JS_TYPE = /^(?:|text\/javascript|application\/javascript|module|text\/ecmascript)$/i;

function attrsOf(tag) {
  const out = {};
  for (const m of tag.matchAll(/([a-zA-Z:_-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g)) {
    out[m[1].toLowerCase()] = m[2] ?? m[3] ?? m[4] ?? '';
  }
  // Bare boolean attributes (async, defer, is:inline in source form).
  for (const m of tag.matchAll(/(?:^|\s)([a-zA-Z:_-]+)(?=\s|$|>)/g)) {
    if (!(m[1].toLowerCase() in out)) out[m[1].toLowerCase()] = '';
  }
  return out;
}

/**
 * Parse without executing. `vm.Script` compiles as a classic script, which is
 * exactly what an inline <script> is, so `import`/`export` are rejected the
 * same way a browser rejects them outside a module. type="module" blocks are
 * therefore compiled as modules instead.
 */
function parse(code, isModule) {
  if (isModule) {
    // Wrapping in an async IIFE gets top-level await accepted without needing
    // --experimental-vm-modules, and every other module-only form (import,
    // export) is a static error we want reported anyway.
    new vm.Script(`(async function(){\n${code}\n})`);
    return;
  }
  new vm.Script(code);
}

const files = await walk(ROOT);
const fails = [];
let checked = 0;
let skipped = 0;

for (const file of files) {
  const html = await readFile(file, 'utf8');
  // Self-closing <script ... /> carries no body, so it is not a match here and
  // does not need to be: there is nothing to parse.
  for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
    const a = attrsOf(m[1]);
    if ('src' in a && a.src) { skipped++; continue; }
    if (!JS_TYPE.test((a.type || '').trim())) { skipped++; continue; }
    const code = m[2];
    if (!code.trim()) continue;
    checked++;
    try {
      parse(code, (a.type || '').trim().toLowerCase() === 'module');
    } catch (err) {
      // Point at the line the compiler complained about when it tells us one,
      // otherwise show the head of the block.
      const lines = code.split('\n');
      const hinted = Number((String(err.stack || '').match(/evalmachine[^:]*:(\d+)/) || [])[1]);
      const at = Number.isFinite(hinted) && hinted > 0 ? hinted - 1 : 0;
      const snippet = lines.slice(Math.max(0, at - 1), at + 2).map((l) => '      ' + l.trim()).join('\n');
      fails.push({ file, msg: err.message, snippet });
    }
  }
}

for (const f of fails) {
  console.log(`FAIL  ${f.file}`);
  console.log(`      ${f.msg}`);
  console.log(f.snippet);
}

console.log(`${fails.length ? 'FAIL' : 'PASS'}  inline scripts parse  (${checked} checked, ${skipped} skipped: src or non-JS type)`);

if (fails.length) {
  console.error(`\nInline script check FAIL: ${fails.length} shipped script(s) a browser cannot parse.`);
  process.exit(1);
}
console.log('\nInline script check PASS');
