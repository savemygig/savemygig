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
  const hit = await caches.match('/protocol/music/start');
  return !!hit;
}, null, { timeout: 20000 });

// ---- cut the network
await ctx.setOffline(true);

// Pages a DJ needs mid-crisis, opened COLD offline (not visited online first).
const OFFLINE_PAGES = [
  '/emergency',
  '/protocol/music/start',
  '/protocol/sound/master',
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

// ---- THE OFFLINE CHECKLIST HAS TO WORK, NOT JUST DRAW (2026-08-06).
// Rendering and styling proved the HTML and CSS were cached; they say nothing
// about the script. /checklist code-splits its account layer now, and Vite
// answers that with a STATIC import of a small preload helper in the entry
// chunk, referenced from no HTML: it was invisible to the worker's asset scan,
// and a module whose static import is missing does not run at all. The page
// would have looked perfect offline and done nothing.
// So: tick a real box and watch the readiness meter follow. That exercises the
// whole entry chunk and every static import it needs.
{
  await page.goto(base + '/checklist', { waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(600);
  const before = await page.evaluate(() => document.getElementById('pct')?.textContent || '');
  // Clicked through the DOM rather than with a real pointer: the groups ship
  // COLLAPSED (the 2026-08-04 CLS fix), so the first row is display:none and a
  // pointer cannot reach it. A collapsed row still counts toward readiness, so
  // this is the same state change a DJ makes after opening the section.
  await page.evaluate(() => {
    const b = document.querySelector('.task input[type="checkbox"]');
    if (b) b.click();
  });
  await page.waitForTimeout(300);
  const after = await page.evaluate(() => document.getElementById('pct')?.textContent || '');
  ok('offline: /checklist actually ticks (its script and every static import are cached)',
    before !== '' && after !== '' && before !== after, `${before} -> ${after}`);
  // ...and the tick survives an offline reload, which is the local persistence
  // the account layer must never have been in front of.
  await page.reload({ waitUntil: 'load', timeout: 15000 });
  await page.waitForTimeout(600);
  const kept = await page.evaluate(() => document.getElementById('pct')?.textContent || '');
  ok('offline: /checklist restores that tick after a reload', kept === after, `${kept} vs ${after}`);
}

// ---- search index served from cache offline
// Per language since 2026-08-05: the worker precaches the index for the ONE
// language it was installed from, so an English install must have the English
// file and must NOT be carrying the other two.
const idx = await page.evaluate(async () => {
  try { const r = await fetch('/search-index.en.json'); return r.ok; } catch { return false; }
});
ok('offline: search index available', idx);
const strays = await page.evaluate(async () => {
  const hits = [];
  for (const p of ['/search-index.json', '/search-index.pt.json', '/search-index.es.json']) {
    if (await caches.match(p)) hits.push(p);
  }
  return hits;
});
ok('offline: only this language\'s index is cached', strays.length === 0, strays.join(', '));

await browser.close();
server.close();
if (fails.length) { console.log(`\nOFFLINE TEST FAIL: ${fails.length}`); process.exit(1); }
console.log('\nOffline test PASS');
