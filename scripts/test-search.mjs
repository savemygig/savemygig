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

await browser.close();
server.close();
if (fails.length) { console.log(`\nSEARCH TEST FAIL: ${fails.length}`); process.exit(1); }
console.log('\nSearch test PASS');
