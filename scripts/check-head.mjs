/*
 * HEAD ESSENTIALS CHECK.
 *
 * Written 2026-08-05, immediately after shipping a site with NO VIEWPORT META
 * TAG on all 107 English pages.
 *
 * WHAT HAPPENED. The language detection block was inserted at the top of
 * Base.astro's head, and the edit that inserted it replaced the viewport meta
 * line instead of preceding it. The tag vanished from every page rendered by
 * that layout. A browser with no viewport meta assumes a 980px virtual
 * viewport and renders the DESKTOP layout scaled down, so a phone got the
 * full horizontal nav, unreadable body text and a four column footer.
 *
 * IT PASSED THE ENTIRE GATE. Eighteen checks, including a full browser test
 * suite that opens real pages at 390px and measures geometry, and not one of
 * them looked at the head. The browser tests set their own viewport directly
 * through Playwright, which is exactly the thing a real phone derives FROM
 * the meta tag, so they rendered correctly while the shipped site did not.
 * It was caught by Antonio opening the site on his own iPhone.
 *
 * That is the lesson worth writing down: a test that configures the thing it
 * is supposed to be testing proves nothing. The mobile tests were verifying
 * that the CSS is right, and the CSS was right. Nothing was verifying that
 * the page ASKS to be laid out for a phone.
 *
 * So this check reads the built HTML, the actual bytes that ship, and asserts
 * the handful of head lines that are invisible when present and catastrophic
 * when absent. Each one here has to be something a human would not notice in
 * review and a page would not obviously break without.
 *
 * Run: node scripts/check-head.mjs dist
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] || 'dist';
const fail = [];

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
};

const REQUIRED = [
  {
    name: 'viewport meta',
    re: /<meta\s+name="viewport"\s+content="[^"]*width=device-width[^"]*"/i,
    why: 'without it a phone renders the desktop layout at 980px, scaled down',
  },
  {
    name: 'charset meta',
    re: /<meta\s+charset="utf-8"/i,
    why: 'without it accented Portuguese and Spanish copy can render as mojibake',
  },
  {
    name: 'lang attribute on <html>',
    re: /<html[^>]+lang="[^"]+"/i,
    why: 'screen readers pick the wrong voice and Google cannot tell the language',
  },
  {
    name: '<title>',
    re: /<title>[^<]+<\/title>/i,
    why: 'a page with no title is unusable in search results and in a tab strip',
  },
];

/*
 * THE LENGTH BUDGET (added 2026-08-06).
 *
 * A title over about 60 characters and a description over about 155 are cut off
 * in a search result, so the part of the sentence that was doing the persuading
 * is the part Google throws away. The English pages mostly respected that.
 * Nobody was CHECKING, and by the time pt and es shipped, 30 Portuguese and 33
 * Spanish pages were over, with descriptions up to 200 characters. That is not
 * carelessness by whoever wrote them, it is the predictable result of
 * translating a sentence written TO a limit into a language that needs 15 to 25%
 * more room to say the same thing: the limit does not survive translation unless
 * something enforces it. The offenders were rewritten FOR each market rather
 * than trimmed, and this is what stops the next page drifting back over.
 *
 * ENTITIES ARE DECODED FIRST, and that is load-bearing: "Don&#39;t" is eight
 * bytes in the HTML and one apostrophe to both a reader and Google. Counting raw
 * bytes flags four English pages that are inside the budget, and a check that
 * cries wolf is a check somebody deletes.
 *
 * HARD FAIL, not a warning. A warning in a 32-check gate is a line nobody reads.
 */
const T_MAX = 60;
const D_MAX = 155;
// One pass is enough: these are attribute and text values, so the only entities
// in play are the handful Astro has to escape.
const decode = (s) => s
  .replace(/&#39;|&apos;/g, "'").replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(Number(d)))
  .replace(/&amp;/g, '&');

const files = walk(DIST);
let over = 0;
for (const f of files) {
  const html = fs.readFileSync(f, 'utf8');
  const head = (html.match(/<head[\s\S]*?<\/head>/i) || [''])[0];
  const rel = path.relative(DIST, f);
  for (const r of REQUIRED) {
    // <html lang> sits outside <head>, so that one is tested against the
    // whole document; everything else must be inside the head to count.
    const hay = r.name.includes('<html>') ? html : head;
    if (!r.re.test(hay)) fail.push(`${rel}: MISSING ${r.name} (${r.why})`);
  }
  const title = decode((head.match(/<title>([^<]*)<\/title>/i) || ['', ''])[1]);
  const desc = decode((head.match(/<meta\s+name="description"\s+content="([^"]*)"/i) || ['', ''])[1]);
  if (title.length > T_MAX) {
    over++;
    fail.push(`${rel}: <title> is ${title.length} chars, budget ${T_MAX}, Google cuts the rest\n      ${title}`);
  }
  if (desc.length > D_MAX) {
    over++;
    fail.push(`${rel}: description is ${desc.length} chars, budget ${D_MAX}, Google cuts the rest\n      ${desc}`);
  }
}

if (fail.length) {
  console.error(`Head check FAIL (${fail.length} problems across ${files.length} pages):`);
  fail.slice(0, 15).forEach((m) => console.error('  ' + m));
  if (fail.length > 15) console.error(`  ... and ${fail.length - 15} more`);
  process.exit(1);
}
console.log(`Head check PASS (${files.length} pages carry viewport, charset, lang and title; every title within ${T_MAX} chars and every description within ${D_MAX})`);
