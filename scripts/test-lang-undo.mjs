/*
 * THE LANGUAGE UNDO, in a real browser.
 *
 * WHY THIS TEST EXISTS. Antonio clicked a link to the plain domain from
 * WhatsApp and landed on the SPANISH site with no explanation and no obvious
 * way back. Everything worked as specified; the specification was wrong. The
 * fix (2026-08-05) is one dismissible line on the redirect's landing pageview,
 * and the only thing that makes it safe is WHEN it appears. A line that shows
 * up on a deep link, or on a page the visitor navigated to themselves, or after
 * they have already used the picker, is worse than the silence it replaced: it
 * would tell people the site is confused about where they are.
 *
 * None of that timing is visible in the built HTML. The marker is a
 * sessionStorage flag written immediately before a location.replace and consumed
 * on the other side, so it can only be checked by driving it.
 *
 * WHAT IS ASSERTED, in order:
 *   1. SMG_LANG='es' + visit "/"  -> lands on /es AND shows the undo line.
 *   2. Same for pt, so this is not one hardcoded language.
 *   3. No stored preference, browser locale es-419 -> same thing, because the
 *      navigator.languages path is the one that caught Antonio.
 *   4. The landing URL carries NO query string. The marker deliberately is not
 *      ?from=auto, because that would be a second crawlable URL for the two
 *      most important pages on the translated sites.
 *   5. The translation notice stands down on that pageview, so a phone never
 *      gets two grey strips above the h1.
 *   6. /es/checklist opened directly -> NO line. A deep link is never
 *      redirected, so there is nothing to undo.
 *   7. /es opened directly -> NO line. Navigating there yourself is not being
 *      moved.
 *   8. Going back to /es later in the same session -> NO line. The marker is
 *      consumed on read, not merely peeked at.
 *   9. Tapping "Ver en inglés" lands on "/" AND leaves SMG_LANG='en', and a
 *      second visit to "/" then stays on "/". This is the whole point: an undo
 *      that has to be repeated every visit has not undone anything.
 *  10. Dismissing hides it, and it stays hidden for the rest of the session.
 *
 * Run: node scripts/test-lang-undo.mjs dist
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

/* NO SERVICE WORKER IN THIS TEST, and it is not laziness.
 * Every context here walks several pages, and the worker precaches 65 routes
 * plus assets on install, in ONE language per script URL: walking /, /pt and
 * /es installs three workers and fires roughly two hundred background fetches
 * through the little static server above, all competing for Chromium's six
 * connections per host. That made the `load` event on the heaviest page
 * (/es/checklist) exceed 30 seconds under gate load, which is a flake with
 * nothing to do with what is being tested.
 * Nothing asserted below depends on the worker: the install card reads
 * display-mode, navigator.standalone, the user agent, localStorage and
 * beforeinstallprompt, none of which the worker touches. The worker's own
 * behaviour is covered by test-offline.mjs, test-offline-langs.mjs (which kills
 * the origin) and test-sw-revalidate.mjs.
 */
async function noServiceWorker(ctx) {
  await ctx.addInitScript(() => {
    try {
      if (navigator.serviceWorker) {
        navigator.serviceWorker.register = () => Promise.resolve({ scope: '/' });
      }
    } catch (e) { /* nothing to stub, nothing to do */ }
  });
}

/** A fresh tab whose storage already holds `pref`, which is what a returning
 *  visitor's browser looks like.
 *
 *  Seeded by visiting a page and writing once, NOT with addInitScript.
 *  addInitScript re-runs on every navigation in the context, so it would keep
 *  putting the old preference back after the undo link had replaced it, and the
 *  test would report the undo as broken when the site was fine. /offline is used
 *  because it is a real page that the detection script provably leaves alone: it
 *  is English and it is not the root, so the script returns before touching
 *  anything. */
async function tab({ pref = null, locale = 'en-US' } = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, locale });
  await noServiceWorker(ctx);
  const page = await ctx.newPage();
  if (pref) {
    await page.goto(base + '/offline', { waitUntil: 'domcontentloaded' });
    await page.evaluate((v) => { try { localStorage.setItem('SMG_LANG', v); } catch (e) {} }, pref);
  }
  return { ctx, page };
}

/** Is the line actually on screen? `hidden` is the shipped default, so a
 *  present-but-hidden element counts as absent, which is the behaviour the
 *  visitor experiences. */
const undoState = (page) => page.evaluate(() => {
  const el = document.getElementById('langUndo');
  const tx = document.getElementById('txNotice');
  return {
    present: !!el,
    visible: !!el && !el.hidden,
    text: el ? el.textContent.replace(/\s+/g, ' ').trim() : null,
    linkHref: el ? (el.querySelector('a') || {}).getAttribute?.('href') : null,
    noticeVisible: !!tx && !tx.hidden,
    pathname: location.pathname,
    search: location.search,
  };
});

// ---------------------------------------------------------------------------
// 1 + 2. The stored-preference path, in both languages.
// ---------------------------------------------------------------------------
for (const [code, prefix, phrase] of [
  ['es', '/es', 'Estás viendo el sitio en español'],
  ['pt', '/pt', 'Você está vendo o site em português'],
]) {
  const { ctx, page } = await tab({ pref: code });
  await page.goto(base + '/', { waitUntil: 'load' });
  const s = await undoState(page);
  ok(`SMG_LANG=${code}: / redirects to ${prefix}`, s.pathname === prefix, s.pathname);
  ok(`SMG_LANG=${code}: the undo line is visible`, s.visible);
  ok(`SMG_LANG=${code}: it is written in that language`, !!s.text && s.text.includes(phrase),
    (s.text || '').slice(0, 52));
  ok(`SMG_LANG=${code}: its link points at the English homepage`, s.linkHref === '/', String(s.linkHref));
  // 4. No crawlable variant was created to carry the marker.
  ok(`SMG_LANG=${code}: the landing URL has no query string`, s.search === '', JSON.stringify(s.search));
  // 5. One strip, not two.
  ok(`SMG_LANG=${code}: the translation notice stands down`, s.noticeVisible === false);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 3. The navigator.languages path, with NO stored preference. This is the one
//    that actually caught Antonio: a browser that reports Spanish first.
// ---------------------------------------------------------------------------
{
  const { ctx, page } = await tab({ locale: 'es-419' });
  await page.goto(base + '/', { waitUntil: 'load' });
  const s = await undoState(page);
  ok('no preference, browser says es-419: / redirects to /es', s.pathname === '/es', s.pathname);
  ok('no preference, browser says es-419: the undo line is visible', s.visible);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 6. A DEEP LINK IS NEVER REDIRECTED AND NEVER EXPLAINED. Opening
//    /es/checklist directly is not being moved, so there is nothing to undo,
//    and the line is not even rendered into that page.
// ---------------------------------------------------------------------------
{
  const { ctx, page } = await tab({ pref: 'es' });
  await page.goto(base + '/es/checklist', { waitUntil: 'load' });
  const s = await undoState(page);
  ok('/es/checklist direct: stays put', s.pathname === '/es/checklist', s.pathname);
  ok('/es/checklist direct: no undo line at all', s.present === false && s.visible === false);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 7 + 8. Navigating to /es YOURSELF is not being moved. And coming back to it
//    later in the same session is not either: the marker is consumed on read.
// ---------------------------------------------------------------------------
{
  const { ctx, page } = await tab({ pref: 'es' });
  await page.goto(base + '/es', { waitUntil: 'load' });
  let s = await undoState(page);
  ok('/es typed directly: the line stays hidden', s.present === true && s.visible === false);

  // Now do it the other way: get redirected (line shows), leave, come back.
  await page.goto(base + '/', { waitUntil: 'load' });
  s = await undoState(page);
  ok('redirected once: the line shows', s.visible === true, s.pathname);
  await page.goto(base + '/es/checklist', { waitUntil: 'load' });
  await page.goto(base + '/es', { waitUntil: 'load' });
  s = await undoState(page);
  ok('returning to /es in the same session: the line is gone', s.visible === false);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// USING THE PICKER IS NOT BEING MOVED EITHER. Choosing Spanish yourself from
// the header lands you on /es by a plain anchor, so no marker exists and no
// line appears. If it ever did, the site would be explaining a decision the
// visitor had just made on purpose.
// ---------------------------------------------------------------------------
{
  const { ctx, page } = await tab();                     // en-US, no preference
  await page.goto(base + '/', { waitUntil: 'load' });
  ok('picker: no redirect for an English browser', (await undoState(page)).pathname === '/');
  // At 390px the picker lives inside the nav drawer, so it has to be opened
  // first. This is the real path a phone takes to it.
  await page.evaluate(() => {
    const links = document.getElementById('navLinks');
    const toggle = document.getElementById('navToggle');
    if (toggle && links && !links.getClientRects().length) toggle.click();
    document.getElementById('langWrap').open = true;
  });
  await page.waitForSelector('.lang-opt[data-lang="es"]', { state: 'visible', timeout: 5000 });
  await Promise.all([
    page.waitForURL((u) => new URL(u).pathname === '/es', { timeout: 8000 }).catch(() => {}),
    page.click('.lang-opt[data-lang="es"]'),
  ]);
  await page.waitForLoadState('load');
  const s = await undoState(page);
  const pref = await page.evaluate(() => { try { return localStorage.getItem('SMG_LANG'); } catch (e) { return null; } });
  ok('picker: lands on /es', s.pathname === '/es', s.pathname);
  ok('picker: no undo line', s.visible === false);
  ok("picker: the choice is remembered as 'es'", pref === 'es', String(pref));
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 9. THE UNDO HAS TO STICK. Tapping the link goes to English AND writes the
//    preference, so the plain domain stops guessing.
// ---------------------------------------------------------------------------
{
  const { ctx, page } = await tab({ pref: 'es' });
  await page.goto(base + '/', { waitUntil: 'load' });
  ok('undo: line visible before the tap', (await undoState(page)).visible === true);

  await Promise.all([
    page.waitForURL((u) => new URL(u).pathname === '/', { timeout: 8000 }).catch(() => {}),
    page.click('#langUndoGo'),
  ]);
  await page.waitForLoadState('load');
  const after = await page.evaluate(() => ({
    pathname: location.pathname,
    pref: (() => { try { return localStorage.getItem('SMG_LANG'); } catch (e) { return null; } })(),
    lang: document.documentElement.lang,
  }));
  ok('undo: lands on the English homepage', after.pathname === '/', after.pathname);
  ok('undo: the page really is English', after.lang === 'en', String(after.lang));
  ok("undo: SMG_LANG is now 'en'", after.pref === 'en', String(after.pref));

  // The assertion that matters: it does not have to be done again.
  await page.goto(base + '/', { waitUntil: 'load' });
  const second = await page.evaluate(() => ({ pathname: location.pathname }));
  ok('undo: a second visit to / no longer redirects', second.pathname === '/', second.pathname);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 10. Dismissal. Hidden now, and hidden for the rest of the session.
// ---------------------------------------------------------------------------
{
  // locale pt-BR as well as the stored preference, so that clearing the
  // preference below still produces a SECOND automatic redirect (this time via
  // navigator.languages) and the dismissal is genuinely tested against one.
  const { ctx, page } = await tab({ pref: 'pt', locale: 'pt-BR' });
  await page.goto(base + '/', { waitUntil: 'load' });
  ok('dismiss: line visible first', (await undoState(page)).visible === true);
  await page.click('#langUndoClose');
  ok('dismiss: hidden immediately', (await undoState(page)).visible === false);
  await page.evaluate(() => { try { localStorage.removeItem('SMG_LANG'); } catch (e) {} });
  await page.goto(base + '/', { waitUntil: 'load' });
  const s = await undoState(page);
  ok('dismiss: still hidden later in the session', s.visible === false, s.pathname);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 11. RULE 6: ON A SHORT PHONE, THE HOMEPAGE'S THIRD DOOR OUTRANKS THE NOTICE.
//
// The translation strip costs 125px above the h1. On a 375x667 iPhone SE the
// first screen is about 559px with the URL bar expanded, and with the strip up
// the third homepage door landed at 557 to 560px depending on which rotating
// tagline the page happened to pick: two pixels of room, or one pixel short. So
// on the homepage only, and under 620px of viewport height only, the strip
// stands down, exactly as Rule 5 makes it stand down for the undo line.
//
// FOUR ASSERTIONS, because the failure mode of a rule like this is not that it
// fails to fire, it is that it fires everywhere and quietly deletes the notice.
// So: it fires on the short homepage, it does NOT fire on a tall one, it does
// NOT fire on an inner page at the same short height, and a reader who was
// skipped is not recorded as having seen it.
// ---------------------------------------------------------------------------
{
  const SHORT = { width: 375, height: 559 }; // iPhone SE, URL bar expanded
  const TALL = { width: 375, height: 812 };  // iPhone 13 mini, same width

  const noticeAt = async (viewport, path) => {
    const ctx = await browser.newContext({ viewport });
    await noServiceWorker(ctx);
    const page = await ctx.newPage();
    await page.goto(base + path, { waitUntil: 'load' });
    const s = await page.evaluate(() => {
      const tx = document.getElementById('txNotice');
      let seen = null;
      try { seen = localStorage.getItem('SMG_TX_NOTICE_pt'); } catch (e) { /* private mode */ }
      return { present: !!tx, visible: !!tx && !tx.hidden, seen };
    });
    await ctx.close();
    return s;
  };

  const shortHome = await noticeAt(SHORT, '/pt');
  ok('rule 6: /pt at 375x559 renders the strip but leaves it down',
    shortHome.present === true && shortHome.visible === false, JSON.stringify(shortHome));
  ok('rule 6: standing down does not mark it seen',
    shortHome.seen === null, String(shortHome.seen));

  const tallHome = await noticeAt(TALL, '/pt');
  ok('rule 6: /pt at 375x812 still shows the strip',
    tallHome.visible === true, JSON.stringify(tallHome));

  const shortInner = await noticeAt(SHORT, '/pt/checklist');
  ok('rule 6: /pt/checklist at 375x559 still shows the strip (no doors to lose)',
    shortInner.visible === true, JSON.stringify(shortInner));
}

// ---------------------------------------------------------------------------
// THE MARKER LEAKS NOWHERE. Static, but it belongs with the rest: the whole
// reason it is sessionStorage and not a query parameter is that it must not
// reach the index, the sitemap or analytics as a new page.
// ---------------------------------------------------------------------------
{
  const sitemapFiles = ['sitemap-index.xml', 'sitemap-0.xml'];
  let inSitemap = false;
  for (const f of sitemapFiles) {
    try { if ((await readFile(join(dir, f), 'utf-8')).includes('from=auto')) inSitemap = true; } catch {}
  }
  let inIndex = false;
  for (const f of ['search-index.en.json', 'search-index.pt.json', 'search-index.es.json']) {
    try {
      const s = await readFile(join(dir, f), 'utf-8');
      if (s.includes('from=auto') || s.includes('SMG_AUTO_LANG')) inIndex = true;
    } catch {}
  }
  ok('the marker creates no sitemap URL variant', inSitemap === false);
  ok('the marker creates no search index entry', inIndex === false);
}

await browser.close();
server.close();

console.log('');
if (fails.length) {
  console.error(`Language undo test FAILED: ${fails.length} failure(s)\n  ${fails.join('\n  ')}`);
  process.exit(1);
}
console.log('Language undo test PASS');
