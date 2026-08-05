/*
 * EMAIL CAPTURE BEHAVIOUR TEST.
 *
 * WHY THIS EXISTS (2026-08-05). The capture form shipped broken: its inline
 * script was TypeScript, so it never parsed, the submit handler never bound,
 * and the browser fell back to a native GET. The visible symptom was a page
 * reload with ?email=someone@example.com in the address bar and no
 * subscription anywhere. scripts/check-inline-scripts.mjs stops the SYNTAX
 * error; this stops the BEHAVIOUR regressing for any other reason (a renamed
 * class, a preventDefault removed, a handler that throws before it binds).
 *
 * /api/subscribe is a Cloudflare Function and does not exist in a static
 * dist, so the route is stubbed with a 200. That is the point: the assertion
 * is about the client path, and stubbing makes it deterministic instead of
 * depending on whether a network call fails fast or slow.
 *
 * Run: node scripts/test-capture.mjs dist
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
  '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg',
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

// One page per language: the block is localized via define:vars, so a broken
// interpolation would only show up on pt or es.
for (const [label, path] of [['/prepare', '/prepare'], ['/pt/prepare', '/pt/prepare'], ['/es/prepare', '/es/prepare']]) {
  // A FRESH CONTEXT PER LANGUAGE, and a second one below for the error path.
  // A successful capture REGISTERS the device (localStorage SMG_UNLOCKED), and
  // a registered device is shown the one-tap send button with the field
  // hidden, so reusing the same storage would leave nothing to type into.
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();

  // Any JS the page cannot parse or run is a failure on its own. This is what
  // was silently true for weeks.
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));

  await page.route('**/api/subscribe', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));

  await page.goto(base + path, { waitUntil: 'load' });

  const form = page.locator('.capture .cap-form').first();
  const has = await form.count();
  ok(`${label}: a capture form is rendered`, has > 0);
  if (!has) { await page.close(); continue; }

  const urlBefore = page.url();
  await form.locator('input[name="email"]').fill('gate-check@savemygig.test');
  await form.locator('button[type="submit"]').click();

  // The status line is a live region that starts empty, so "has text" is the
  // signal that the handler ran to completion.
  const msg = page.locator('.capture .cap-msg').first();
  let msgText = '';
  try {
    await msg.filter({ hasText: /\S/ }).waitFor({ timeout: 6000 });
    msgText = (await msg.innerText()).trim();
  } catch {}

  const urlAfter = page.url();
  ok(`${label}: submit does not navigate`, urlAfter === urlBefore, urlAfter.replace(base, '') || '/');
  ok(`${label}: no email leaks into the URL`, !/[?&]email=/.test(urlAfter));
  ok(`${label}: a status message becomes visible`, msgText.length > 0, JSON.stringify(msgText.slice(0, 60)));
  ok(`${label}: no uncaught page errors`, pageErrors.length === 0, pageErrors.join(' | ').slice(0, 160));

  await page.close();
  await ctx.close();

  // The bad-address path shares the same handler, so prove it is reached too:
  // a rejected address must also stay on the page. Unregistered context.
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  await p2.route('**/api/subscribe', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
  await p2.goto(base + path, { waitUntil: 'load' });
  const form2 = p2.locator('.capture .cap-form').first();
  await form2.locator('input[name="email"]').fill('not-an-email');
  await form2.locator('button[type="submit"]').click();
  const msg2 = p2.locator('.capture .cap-msg').first();
  let err2 = '';
  try {
    await msg2.filter({ hasText: /\S/ }).waitFor({ timeout: 4000 });
    err2 = (await msg2.innerText()).trim();
  } catch {}
  ok(`${label}: a bad address is rejected in place`, err2.length > 0 && p2.url() === urlBefore,
    JSON.stringify(err2.slice(0, 60)));
  await p2.close();
  await ctx2.close();
}

await browser.close();
server.close();
if (fails.length) { console.log(`\nCAPTURE TEST FAIL: ${fails.length}`); process.exit(1); }
console.log('\nCapture test PASS');
