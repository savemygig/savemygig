/*
 * THE OFFLINE PROMISE, TESTED HONESTLY.
 *
 * Antonio's question: you load it once on your device, and then it keeps
 * working. Is that promise actually delivered?
 *
 * The only test that answers it is: install the worker, then KILL THE ORIGIN,
 * then walk the rescue. Playwright's setOffline(true) is not enough on its own,
 * because a service worker's own fetches still reach the server, so a page can
 * look cached while its stylesheet is quietly downloaded live.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const DIR = process.argv[2] || 'dist';
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2',
  '.png': 'image/png', '.webp': 'image/webp', '.xml': 'application/xml',
  '.txt': 'text/plain', '.pdf': 'application/pdf', '.ico': 'image/x-icon',
};

let served = 0;
const makeServer = () => createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  for (const c of [join(DIR, p), join(DIR, p + '.html'), join(DIR, p, 'index.html')]) {
    try {
      const buf = await readFile(c);
      served++;
      res.writeHead(200, { 'content-type': MIME[extname(c)] || 'application/octet-stream' });
      return res.end(buf);
    } catch {}
  }
  res.writeHead(404, { 'content-type': 'text/html' }).end('nf');
});

let server = makeServer();
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const PORT = server.address().port;
const base = `http://127.0.0.1:${PORT}`;

const results = [];
const ok = (name, cond, detail = '') => {
  results.push({ name, cond, detail });
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
};

const PATHS = [
  ['USB not recognized', '/protocol/usb/start'],
  ['the four booth moves', '/protocol/usb/moves'],
  ['music will not load', '/protocol/music/start'],
  ['no sound', '/protocol/sound/start'],
  ['no sound deep screen', '/protocol/sound/master'],
  ['frozen player', '/protocol/frozen/start'],
  ['failed rekordbox export', '/protocol/export/start'],
  ['export deep screen', '/protocol/export/format'],
  ['erase consent screen', '/protocol/rebuild/erase'],
  ['triage', '/emergency'],
  ['checklist', '/checklist'],
  ['Emergency Card', '/card'],
];

const LANGS = [
  { code: 'en', prefix: '', label: 'ENGLISH' },
  { code: 'pt', prefix: '/pt', label: 'PORTUGUESE' },
  { code: 'es', prefix: '/es', label: 'SPANISH' },
];

const browser = await chromium.launch();

for (const L of LANGS) {
  console.log(`\n================ ${L.label} ================`);
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
  const page = await ctx.newPage();

  await page.goto(base + (L.prefix || '/'), { waitUntil: 'load' });

  const reg = await page.evaluate(async () => {
    if (!('serviceWorker' in navigator)) return {};
    const r = await navigator.serviceWorker.ready;
    return { scriptURL: r.active ? r.active.scriptURL : null };
  });
  ok(`${L.code}: worker installs on the first visit`, !!reg.scriptURL,
    reg.scriptURL ? reg.scriptURL.replace(base, '') : 'none');

  const filled = await page.evaluate(async (prefix) => {
    const want = [prefix + '/protocol/usb/moves', prefix + '/protocol/sound/master', prefix + '/checklist'];
    const deadline = Date.now() + 60000;
    while (Date.now() < deadline) {
      for (const n of await caches.keys()) {
        const c = await caches.open(n);
        const hits = await Promise.all(want.map((u) => c.match(u)));
        if (hits.every(Boolean)) return { cache: n, count: (await c.keys()).length };
      }
      await new Promise((r) => setTimeout(r, 400));
    }
    return null;
  }, L.prefix);
  ok(`${L.code}: the whole rescue is cached after one visit`, !!filled,
    filled ? `${filled.count} entries in ${filled.cache}` : 'timed out');

  await new Promise((r) => server.close(r));
  console.log(`  -- ORIGIN KILLED (${served} requests served so far) --`);

  const page2 = await ctx.newPage();
  for (const [label, p] of PATHS) {
    let good = false, detail = '';
    try {
      await page2.goto(base + L.prefix + p, { waitUntil: 'load', timeout: 20000 });
      const i = await page2.evaluate(() => {
        const h1 = document.querySelector('h1');
        const rules = Array.from(document.styleSheets).reduce((n, s) => {
          try { return n + s.cssRules.length; } catch { return n; }
        }, 0);
        const red = getComputedStyle(document.documentElement).getPropertyValue('--red').trim();
        const b = getComputedStyle(document.body);
        const img = document.querySelector('header img[src*="brand"], header img');
        return {
          title: (document.title || '').slice(0, 50),
          h1: h1 ? h1.textContent.trim().slice(0, 30) : '',
          rules, red, bg: b.backgroundColor, font: b.fontFamily.slice(0, 24),
          logo: img ? (img.complete && img.naturalWidth > 0) : null,
        };
      });
      good = !!(i.title && i.rules > 0 && i.red) && i.logo !== false && !/^nf$/i.test(i.title);
      detail = `rules=${i.rules} red=${i.red || 'MISSING'} bg=${i.bg} logo=${i.logo === null ? 'n/a' : i.logo} font=${i.font}`;
    } catch (e) {
      detail = 'threw: ' + String(e.message).slice(0, 50);
    }
    ok(`${L.code}: OFFLINE ${label} ${L.prefix + p}`, good, detail);
  }

  const s = await page2.evaluate(async (prefix) => {
    const idx = '/search-index.' + (prefix ? prefix.slice(1) : 'en') + '.json';
    try {
      const r = await fetch(idx);
      if (!r.ok) return { ok: false, why: 'status ' + r.status };
      const docs = await r.json();
      const hit = docs.filter((d) => JSON.stringify(d).toLowerCase().includes('usb')).length;
      return { ok: docs.length > 0 && hit > 0, n: docs.length, hit };
    } catch (e) { return { ok: false, why: String(e.message).slice(0, 40) }; }
  }, L.prefix);
  ok(`${L.code}: OFFLINE search still answers`, s.ok, s.ok ? `${s.n} docs, ${s.hit} match usb` : s.why);

  await ctx.close();
  server = makeServer();
  await new Promise((r) => server.listen(PORT, '127.0.0.1', r));
}

await browser.close();
await new Promise((r) => server.close(r));

const fails = results.filter((r) => !r.cond);
console.log(`\n${results.length - fails.length}/${results.length} passed`);
if (fails.length) {
  console.log('\nFAILURES:');
  for (const f of fails) console.log('  ' + f.name + '  ' + f.detail);
  process.exit(1);
}
console.log('\nTHE OFFLINE PROMISE HOLDS in all three languages, with the origin dead.');
