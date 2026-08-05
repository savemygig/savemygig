/*
 * Inline search behaviour test. The search component once wired only the
 * FIRST instance on a page; the header overlay always comes first in the
 * DOM, so the inline boxes on /faq and the homepage looked perfect and did
 * nothing (Antonio caught it live). This proves every visible inline box
 * actually searches: type a query, expect results under the box.
 * Run: node scripts/test-search.mjs dist
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const dir = process.argv[2] || 'dist';
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.png': 'image/png', '.webp': 'image/webp',
};
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  for (const c of [join(dir, p), join(dir, p + '.html'), join(dir, p, 'index.html')]) {
    try {
      const buf = await readFile(c);
      res.writeHead(200, { 'content-type': MIME[extname(c)] || 'application/octet-stream' });
      return res.end(buf);
    } catch {}
  }
  res.writeHead(404).end('nf');
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

const browser = await chromium.launch();
const fails = [];
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
  if (!cond) fails.push(name);
};

// HOMEPAGE: tapping the box hands off to the top overlay (Antonio), which
// must be the SAME width as the page column, and results appear there.
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  const homeWidth = await page.evaluate(() =>
    document.querySelector('.home-srch .srch-box').getBoundingClientRect().width);
  await page.locator('#main .srch-input').click();
  const overlay = page.locator('#searchOverlay');
  let handoff = false;
  try { await overlay.waitFor({ state: 'visible', timeout: 5000 }); handoff = true; } catch {}
  ok('/: tapping the box opens the top overlay', handoff);
  const soWidth = await page.evaluate(() =>
    document.querySelector('.so-panel .srch-box')?.getBoundingClientRect().width || 0);
  ok('/: overlay box is the same width as the page box', Math.abs(soWidth - homeWidth) < 4, `${soWidth} vs ${homeWidth}`);
  const soInput = page.locator('.so-panel .srch-input');
  await soInput.fill('error');
  const soResults = page.locator('.so-panel .srch-results');
  let visible = false, hits = 0;
  try {
    await soResults.waitFor({ state: 'visible', timeout: 8000 });
    visible = true;
    hits = await soResults.locator('.srch-hit').count();
  } catch {}
  ok('/: overlay search shows results', visible && hits > 0, `${hits} hits`);
  await page.close();
}

// FAQ: the inline box searches in place (the behaviour Antonio liked).
{
  const page = await browser.newPage();
  await page.goto(base + '/faq', { waitUntil: 'load' });
  const input = page.locator('#main .srch-input');
  await input.click();
  await input.fill('error');
  const results = page.locator('#main .srch-results');
  let visible = false, hits = 0;
  try {
    await results.waitFor({ state: 'visible', timeout: 8000 });
    visible = true;
    hits = await results.locator('.srch-hit').count();
  } catch {}
  ok('/faq: inline search shows results', visible && hits > 0, `${hits} hits`);
  await input.focus();
  await page.waitForTimeout(400); // let the 0.15s border transition finish
  const border = await page.evaluate(() => {
    const box = document.querySelector('#main .srch-box');
    return box ? getComputedStyle(box).borderColor : '';
  });
  ok('/faq: focus turns the box red', /255, 77, 46|rgb\(255/.test(border), border);
  await page.close();
}

// LANGUAGE FILTER (2026-08-05). One flat index covered all three languages
// and the box never filtered it, so an English reader searching "usb" was
// offered Spanish articles. Each box now fetches /search-index.<lang>.json.
// Asserted on the RESULT HREFS, which is the thing the reader actually sees.
for (const [label, home, prefix, query] of [
  ['/', '/', '', 'usb'],
  ['/pt', '/pt', '/pt', 'E-8302'],
  ['/es', '/es', '/es', 'USB'],
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(base + home, { waitUntil: 'load' });
  const input = page.locator('#main .srch-input').first();
  await input.click();
  // The homepage box hands off to the header overlay, so type wherever the
  // focus landed rather than assuming.
  const live = (await page.locator('#searchOverlay:visible').count())
    ? page.locator('.so-panel .srch-input')
    : input;
  const outSel = (await page.locator('#searchOverlay:visible').count())
    ? '.so-panel .srch-results' : '#main .srch-results';
  await live.fill(query);
  const results = page.locator(outSel);
  let hrefs = [];
  try {
    await results.waitFor({ state: 'visible', timeout: 8000 });
    hrefs = await results.locator('.srch-hit').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  } catch {}
  ok(`${label}: "${query}" returns results`, hrefs.length > 0, `${hrefs.length} hits`);
  const wrong = hrefs.filter((h) => {
    const lang = /^\/pt(\/|$)/.test(h) ? '/pt' : /^\/es(\/|$)/.test(h) ? '/es' : '';
    return lang !== prefix;
  });
  ok(`${label}: every result is in this language`, hrefs.length > 0 && wrong.length === 0, wrong.join(', ').slice(0, 120));
  await page.close();
}

// ZERO STATE, localized and language-prefixed. It was one hardcoded English
// sentence with two unprefixed links, so the moment a reader failed to find
// something was also the moment we dropped them into English.
for (const [label, home, prefix, expect] of [
  ['/', '/', '', 'Nothing matched'],
  ['/pt', '/pt', '/pt', 'Nada encontrado para'],
  ['/es', '/es', '/es', 'Nada encontrado para'],
]) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.goto(base + home, { waitUntil: 'load' });
  const input = page.locator('#main .srch-input').first();
  await input.click();
  const live = (await page.locator('#searchOverlay:visible').count())
    ? page.locator('.so-panel .srch-input') : input;
  const outSel = (await page.locator('#searchOverlay:visible').count())
    ? '.so-panel .srch-results' : '#main .srch-results';
  await live.fill('zzqqxx nothingmatchesthis');
  const none = page.locator(outSel + ' .srch-none');
  let text = '', links = [];
  try {
    await none.waitFor({ state: 'visible', timeout: 8000 });
    text = (await none.innerText()).trim();
    links = await none.locator('a').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  } catch {}
  ok(`${label}: zero state is in this language`, text.startsWith(expect), JSON.stringify(text.slice(0, 60)));
  const want = [prefix + '/faq', prefix + '/emergency'];
  ok(`${label}: zero state links stay in this language`,
    links.length === 2 && want.every((w) => links.includes(w)), links.join(', '));
  await page.close();
}

await browser.close();
server.close();
if (fails.length) { console.log(`\nSEARCH TEST FAIL: ${fails.length}`); process.exit(1); }
console.log('\nSearch test PASS');
