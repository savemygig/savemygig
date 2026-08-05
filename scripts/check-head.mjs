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

const files = walk(DIST);
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
}

if (fail.length) {
  console.error(`Head check FAIL (${fail.length} problems across ${files.length} pages):`);
  fail.slice(0, 15).forEach((m) => console.error('  ' + m));
  if (fail.length > 15) console.error(`  ... and ${fail.length - 15} more`);
  process.exit(1);
}
console.log(`Head check PASS (${files.length} pages carry viewport, charset, lang and title)`);
