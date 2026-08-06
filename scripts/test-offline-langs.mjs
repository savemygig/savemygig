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

/*
 * THE PATH LIST, AND THE HOLE IT USED TO HAVE (2026-08-06).
 *
 * This test shipped on 2026-08-05 asserting the offline promise in three
 * languages with the origin process dead, and it passed while the LAST SCREEN OF
 * EVERY RESCUE was broken offline. Two mistakes, both worth naming, because they
 * are the general shape of a test that lies:
 *
 *   1. IT TESTED PATHS, NOT THE URLS THE PRODUCT NAVIGATES TO. Every outcome
 *      option in the three emergency trees routes to /saved with a query string
 *      recording which branch worked: "/saved?path=no_sound&branch=thin" and 74
 *      others, and not one bare /saved anywhere. Cache Storage matches on the
 *      FULL url unless told otherwise, so a cache holding a perfect copy of
 *      /saved was a miss for every URL a DJ is ever sent to. The list here held
 *      bare paths only, so the entire class was invisible to it.
 *   2. IT ASSERTED "A STYLED PAGE CAME BACK", NOT "THE RIGHT PAGE CAME BACK".
 *      /offline is itself a styled page with a title and the red token, so the
 *      offline FALLBACK satisfied every condition this test made. It could not
 *      tell the rescue from the apology.
 *
 * Both are fixed. The list now carries real outcome URLs, copied from the `to`
 * values in src/data/emergency-tree*.js, and the check below compares the served
 * document's own canonical against the path that was requested. That identity
 * test is language-agnostic and it hardens all twelve of the original entries
 * too, not just the five new ones. It is what makes a pass here mean something.
 */
const PATHS = [
  ['USB not recognised', '/protocol/usb/start'],
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
  // THE END OF THE RESCUE, which is what nothing was testing. Every one of these
  // is a real `to` value out of the trees, so they are exactly what a DJ's phone
  // asks for the moment something works. The query string is the whole point: it
  // is what turned a cached page into a miss.
  ['outcome, no sound fixed', '/saved?path=no_sound&branch=thin'],
  ['outcome, frozen player restarted', '/saved?path=frozen&branch=restart'],
  ['outcome, playing off another drive', '/saved?path=critical&branch=runlist'],
  ['outcome, export rebuilt', '/saved?path=quick_fix&branch=fresh_usb'],
  ['hand-off, the files really are gone', '/files-lost?path=critical&branch=survival'],
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
    // The path WITHOUT its query string is the document that should come back.
    // The query is analytics: it labels an event and never changes the page.
    const wantPath = L.prefix + p.split('?')[0];
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
        const can = document.querySelector('link[rel="canonical"]');
        return {
          title: (document.title || '').slice(0, 50),
          h1: h1 ? h1.textContent.trim().slice(0, 30) : '',
          rules, red, bg: b.backgroundColor, font: b.fontFamily.slice(0, 24),
          logo: img ? (img.complete && img.naturalWidth > 0) : null,
          // WHICH DOCUMENT IS THIS, REALLY. Every page on the site carries a
          // canonical, so this is the one signal that tells the rescue apart
          // from the offline apology. Without it this whole loop passed on
          // /offline, which is how the query-string hole survived a test whose
          // name is the offline promise.
          canonical: can ? new URL(can.href).pathname.replace(/\/$/, '') : null,
        };
      });
      const isWanted = i.canonical === (wantPath === '/' ? '' : wantPath);
      good = isWanted && !!(i.title && i.rules > 0 && i.red) &&
        i.logo !== false && !/^nf$/i.test(i.title);
      detail = `rules=${i.rules} red=${i.red || 'MISSING'} bg=${i.bg} ` +
        `logo=${i.logo === null ? 'n/a' : i.logo} font=${i.font}` +
        (isWanted ? '' : ` GOT ${i.canonical || 'no canonical'} WANTED ${wantPath}`);
    } catch (e) {
      detail = 'threw: ' + String(e.message).slice(0, 50);
    }
    ok(`${L.code}: OFFLINE ${label} ${L.prefix + p}`, good, detail);
  }

  // THE CHECKLIST HAS TO WORK, NOT JUST DRAW, and this is the run that proves it
  // because the origin process is DEAD (2026-08-06). The loop above says the
  // HTML and CSS are cached; it says nothing about the script. /checklist
  // code-splits its account layer now, and Vite answers that with a STATIC
  // import of a preload helper in the entry chunk which is referenced from no
  // HTML at all: it was invisible to the worker's asset scan, and a module whose
  // static import is missing does not run. The page would have drawn perfectly
  // offline and done nothing. sw.js follows those imports now; this is the
  // assertion that keeps it true.
  const tick = await (async () => {
    try {
      await page2.goto(base + L.prefix + '/checklist', { waitUntil: 'load', timeout: 20000 });
      await page2.waitForTimeout(600);
      const before = await page2.evaluate(() => document.getElementById('pct')?.textContent || '');
      // Clicked through the DOM, not with a pointer: the groups ship COLLAPSED
      // (the 2026-08-04 CLS fix) so the first row is display:none. A collapsed
      // row still counts toward readiness, so this is the same state change.
      await page2.evaluate(() => {
        const b = document.querySelector('.task input[type="checkbox"]');
        if (b) b.click();
      });
      await page2.waitForTimeout(300);
      const after = await page2.evaluate(() => document.getElementById('pct')?.textContent || '');
      await page2.reload({ waitUntil: 'load', timeout: 20000 });
      await page2.waitForTimeout(600);
      const kept = await page2.evaluate(() => document.getElementById('pct')?.textContent || '');
      return { ok: !!before && !!after && before !== after && kept === after, before, after, kept };
    } catch (e) { return { ok: false, why: String(e.message).slice(0, 50) }; }
  })();
  ok(`${L.code}: OFFLINE the checklist ticks and remembers`, tick.ok,
    tick.why || `${tick.before} -> ${tick.after}, kept ${tick.kept}`);

  // A FAILING ASSERTION MUST NOT TAKE THE TEST DOWN WITH IT. If the loop above
  // left the tab on a browser error page, page2.evaluate throws and the whole
  // run died with an uncaught exception instead of printing the failures it had
  // already found. Land somewhere real first, and report rather than crash.
  const s = await (async () => {
    try {
      await page2.goto(base + (L.prefix || '/'), { waitUntil: 'load', timeout: 20000 });
      return await page2.evaluate(async (prefix) => {
        const idx = '/search-index.' + (prefix ? prefix.slice(1) : 'en') + '.json';
        try {
          const r = await fetch(idx);
          if (!r.ok) return { ok: false, why: 'status ' + r.status };
          const docs = await r.json();
          const hit = docs.filter((d) => JSON.stringify(d).toLowerCase().includes('usb')).length;
          return { ok: docs.length > 0 && hit > 0, n: docs.length, hit };
        } catch (e) { return { ok: false, why: String(e.message).slice(0, 40) }; }
      }, L.prefix);
    } catch (e) { return { ok: false, why: 'page unusable: ' + String(e.message).slice(0, 40) }; }
  })();
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
