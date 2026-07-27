/*
 * Offline promise test. The install banner and /install page tell DJs the
 * rescue flow works with no signal; this proves it in a real browser before
 * every push, HTML and styling both, not just "the request did not 404".
 *
 * Flow: visit the homepage online (service worker installs and precaches),
 * wait for the precache to actually finish, cut the network, then open deep
 * rescue pages cold and assert they render styled.
 *
 * Run: node scripts/test-offline.mjs dist
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
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp',
  '.webmanifest': 'application/manifest+json',
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

const ctx = await browser.newContext();
const page = await ctx.newPage();

// ---- online first visit: worker installs, precache fills
await page.goto(base + '/', { waitUntil: 'load' });
await page.evaluate(() => navigator.serviceWorker.ready);
// The precache is not instant; wait until a deep tunnel page is actually in
// the cache instead of sleeping and hoping.
await page.waitForFunction(async () => {
  const hit = await caches.match('/protocol/critical/symptom');
  return !!hit;
}, null, { timeout: 20000 });

// ---- cut the network
await ctx.setOffline(true);

// Pages a DJ needs mid-crisis, opened COLD offline (not visited online first).
const OFFLINE_PAGES = [
  '/emergency',
  '/protocol/critical/symptom',
  '/protocol/no-sound/master',
  '/checklist',
  '/install',
];
for (const path of OFFLINE_PAGES) {
  let loaded = false, styled = false, title = '';
  try {
    await page.goto(base + path, { waitUntil: 'load', timeout: 15000 });
    title = await page.title();
    loaded = title.length > 0 && !/nf/.test(await page.evaluate(() => document.body.innerText.slice(0, 4)));
    // Styling proof: the design system's own variable resolves, and the page
    // is dark. An unstyled fallback page would fail both.
    styled = await page.evaluate(() => {
      const red = getComputedStyle(document.documentElement).getPropertyValue('--red').trim();
      const bg = getComputedStyle(document.body).backgroundColor;
      return red.length > 0 && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'rgb(255, 255, 255)';
    });
  } catch (e) { title = String(e).slice(0, 60); }
  ok(`offline: ${path} renders`, loaded, title.slice(0, 50));
  ok(`offline: ${path} styled`, styled);
}

// ---- search index served from cache offline
const idx = await page.evaluate(async () => {
  try { const r = await fetch('/search-index.json'); return r.ok; } catch { return false; }
});
ok('offline: search index available', idx);

await browser.close();
server.close();
if (fails.length) { console.log(`\nOFFLINE TEST FAIL: ${fails.length}`); process.exit(1); }
console.log('\nOffline test PASS');
