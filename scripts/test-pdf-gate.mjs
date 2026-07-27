/*
 * Behaviour test for the checklist PDF gate.
 * Verifies, in a real browser:
 *   1. A first-time visitor clicking the PDF button does NOT download; the
 *      gate opens instead, showing the PDF copy and not the mode copy.
 *   2. Submitting an email closes the gate and starts the download.
 *   3. A visitor who is already unlocked downloads straight away, no gate.
 * Run: node scripts/test-pdf-gate.mjs dist
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
  '.pdf': 'application/pdf', '.webmanifest': 'application/manifest+json',
};
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  // .html BEFORE directory, or build.format:'file' gives false 404s.
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

// Download no longer serves a static file: it opens a print view built from
// the LIVE list (Antonio's rule: what you download is what is on screen). So
// the test watches for the popup and reads its contents, not a download event.

// ---- 1 + 2: first-time visitor
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(base + '/checklist', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('#ck')?.remove()); // consent card eats clicks

  let popped = false;
  ctx.on('page', () => { popped = true; });

  await page.click('#pdfBtn');
  await page.waitForTimeout(500);

  const gateOpen = await page.evaluate(() => !document.getElementById('unlock')?.hidden);
  const title = await page.textContent('#unlockTitle');
  ok('gate opens for a locked visitor', gateOpen);
  ok('gate shows PDF copy, not mode copy', /printable/i.test(title || ''), title || '');
  ok('no print view before registering', !popped);

  await page.fill('#unlockForm input[name=email]', 'test@example.com');
  const pop = ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null);
  await page.click('#unlockForm button[type=submit]');
  const view = await pop;
  ok('print view opens after registering', !!view);
  if (view) {
    await view.waitForLoadState('domcontentloaded').catch(() => {});
    const body = await view.evaluate(() => document.body.innerText).catch(() => '');
    ok('print view carries the live list', /Headphones/i.test(body), body ? '' : 'empty body');
  }

  const gateClosed = await page.evaluate(() => !!document.getElementById('unlock')?.hidden);
  ok('gate closes after registering', gateClosed);
  const unlocked = await page.evaluate(() => localStorage.getItem('SMG_UNLOCKED'));
  ok('registration persisted', unlocked === '1');
  await ctx.close();
}

// ---- 3: already registered, and the view must reflect CURRENT state
{
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto(base + '/checklist', { waitUntil: 'networkidle' });
  await page.evaluate(() => { localStorage.setItem('SMG_UNLOCKED', '1'); });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('#ck')?.remove());

  // Tick the first item, then download: the tick must appear in the view.
  // The real checkbox input is visually replaced by the .box span, which
  // intercepts pointer events, so click the label the way a person does.
  await page.click('li.task label');
  await page.waitForTimeout(200);
  const pop = ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null);
  await page.click('#pdfBtn');
  const view = await pop;
  ok('registered visitor gets the view with no gate', !!view);
  const gateOpen = await page.evaluate(() => !document.getElementById('unlock')?.hidden);
  ok('gate stays shut for a registered visitor', !gateOpen);
  if (view) {
    await view.waitForLoadState('domcontentloaded').catch(() => {});
    const ticked = await view.evaluate(() => document.querySelectorAll('li.done').length).catch(() => 0);
    ok('the tick made on screen shows in the download', ticked >= 1, `${ticked} ticked rows`);
  }
  await ctx.close();
}

await browser.close();
server.close();
if (fails.length) { console.log(`\nPDF GATE FAIL: ${fails.join(', ')}`); process.exit(1); }
console.log('\nPASS: PDF gate behaves correctly');
