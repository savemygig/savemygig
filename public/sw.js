/*
 * Service worker.
 *
 * The point of this is ONE THING: the rescue flow has to work with no signal.
 * A basement club with no reception is exactly where a DJ needs this site, and
 * exactly where a normal website is useless. So the whole emergency tunnel and
 * the checklist are precached on install.
 *
 * Strategy, deliberately conservative so a bad cache can never strand anyone:
 *   - HTML: network first, fall back to cache. Fresh content when online,
 *     working pages when not.
 *   - static assets (css/js/fonts/images): cache first, they are
 *     content-hashed or effectively immutable.
 *   - anything under /api/: never touched. Those are live calls.
 *
 * Bump CACHE when the precache list changes; old caches are deleted on activate.
 *
 * ---------------------------------------------------------------------------
 * PERF / CORRECTNESS PASS 2026-08-04. Four things were measured and changed.
 *
 * 1. THE OFFLINE PROMISE WAS ONLY HALF TRUE, and the gate did not catch it.
 *    The precache listed 70 HTML routes and not one stylesheet. Astro emits
 *    its CSS as content-hashed /_astro/*.css files, so a route could be in the
 *    cache while the CSS that makes it legible was not. Measured, with the
 *    origin process actually killed rather than flagged offline: /checklist,
 *    /emergency, /protocol/music/start, /install and the knowledge pages ALL
 *    rendered as unstyled Times New Roman, with --red resolving to "" and
 *    every stylesheet reporting 0 rules. That is the precise scenario this
 *    site exists for, and it was broken.
 *    scripts/test-offline.mjs passes today because it uses Playwright's
 *    context.setOffline(true), which only emulates offline for the PAGE's
 *    network stack: a service worker's own fetches still reach the origin, so
 *    the CSS was quietly being fetched live during the "offline" test. Kill
 *    the server instead and the test fails. That fix is in scripts/, so it is
 *    reported rather than made here.
 *    Install now reads each precached page and caches the /_astro/*.css and
 *    /_astro/*.js it references. Deriving them from the HTML rather than
 *    hardcoding them means the list cannot go stale when a content hash
 *    changes, which is exactly how a hardcoded list would rot.
 *
 * 2. TWO PRECACHED IMAGES ARE RENDERED BY NO PAGE. /images/seal-72.png and
 *    /images/seal-72.webp appear in no HTML in the built site (checked across
 *    all 107 pages); the only references anywhere in the repo were these two
 *    lines. They cost a measured 35.1 KB of the install on every first visit.
 *    Removed from the list. The files stay in public/ in case a page wants
 *    them back.
 *
 * 3. INSTALL WAS 77 PARALLEL FETCHES. Measured at the origin (the page's own
 *    devtools session does not see service-worker requests) a first visit was
 *    9 requests / 101.7 KB for the page, then 77 requests / 893.7 KB fired at
 *    once the moment the page finished loading. On a phone on 4G that is the
 *    precache competing with whatever the DJ does next. It is a pool of 6 at a
 *    time now: same bytes, same end state, spread out instead of dumped.
 *
 * 4. THE OFFLINE FALLBACK COULD NOT FIRE.
 *      caches.match('/offline') || caches.match('/')
 *    Both sides are Promises and a Promise is always truthy, so the || never
 *    reached the second branch: if /offline was missing from the cache the
 *    whole expression resolved to undefined and respondWith rejected with a
 *    network error instead of falling back to the home page. Awaited properly.
 *
 * Also: a response is only written to the cache when res.ok. The old code
 * cached whatever came back, so one transient 502 from the edge would pin an
 * error page onto a rescue URL until the next deploy.
 */
const CACHE = 'smg-v15';

// How long to wait for the network on an HTML request before serving the
// cached copy. Being fully OFFLINE is not the common failure in a basement:
// one bar of signal is, and a fetch that eventually succeeds after 20 seconds
// is a blank screen for 20 seconds while a perfectly good copy sits in the
// cache. The network request is NOT cancelled when this fires; it keeps
// running and still refreshes the cache, so the next navigation is fresh.
const HTML_NET_TIMEOUT = 4000;

// The rescue path, offline. If a page is not here it still works online.
const ROUTES = [
  '/',
  '/emergency',
  '/checklist',
  '/card',
  '/protocol/export/backup',
  '/protocol/export/dead-checks',
  '/protocol/export/export',
  '/protocol/export/find',
  '/protocol/export/format',
  '/protocol/export/fresh',
  '/protocol/music/other-track',
  '/protocol/export/errors',
  '/protocol/export/erase',
  '/protocol/export/repair',
  '/protocol/export/start',
  '/protocol/export/usb-check',
  '/protocol/export/verify',
  '/protocol/frozen/link',
  '/protocol/frozen/live',
  '/protocol/frozen/restart',
  '/protocol/frozen/start',
  '/protocol/music/folder',
  '/protocol/music/start',
  '/protocol/rebuild/copy',
  '/protocol/rebuild/copy-back',
  '/protocol/rebuild/erase',
  '/protocol/rebuild/fallback',
  '/protocol/rebuild/format',
  '/protocol/rebuild/load',
  '/protocol/rebuild/no-erase',
  '/protocol/rebuild/risk',
  '/protocol/rebuild/second-copy',
  '/protocol/rebuild/second-format',
  '/protocol/rebuild/second-usb',
  '/protocol/shared/computer',
  '/protocol/shared/survival',
  '/protocol/shared/usb-check',
  '/protocol/shared/usb-dead',
  '/protocol/sound/channel',
  '/protocol/sound/channel-2',
  '/protocol/sound/channel-3',
  '/protocol/sound/fallback',
  '/protocol/sound/house',
  '/protocol/sound/master',
  '/protocol/sound/master-2',
  '/protocol/sound/phones',
  '/protocol/sound/phones-2',
  '/protocol/sound/start',
  '/protocol/sound/wrong',
  '/protocol/sound/wrong-2',
  '/protocol/usb/booth',
  '/protocol/usb/computer',
  '/protocol/usb/link',
  '/protocol/usb/moves',
  '/protocol/usb/restart',
  '/protocol/usb/start',
  '/protocol/sound/thin',
  '/protocol/full-recovery',
  '/protocol/full-recovery/value',
  '/protocol/full-recovery/health',
  '/protocol/full-recovery/rescue',
  '/protocol/full-recovery/rebuild',
  '/protocol/full-recovery/retire',
  '/protocol/full-recovery/verify',
  '/legal/disclaimer',
  '/install',
  '/knowledge',
  '/knowledge/pioneer-dj/rekordbox',
  '/knowledge/dictionary',
  '/saved',
  '/files-lost',
  '/offline',
];

// Non-HTML things the rescue path needs offline. The two woff2 files are the
// site's whole typography; /search-index.json is what makes offline search
// work. Everything else a page needs is DERIVED from the page, below.
const EXTRA = [
  '/search-index.json',
  '/fonts/archivo-latin-wght-normal.woff2',
  '/fonts/inter-latin-wght-normal.woff2',
  // The brand mark. Added 2026-08-04 after seeing it: with the CSS fix in
  // place every offline page rendered correctly EXCEPT that the nav lockup
  // was a broken-image icon, because the shield is fetched during the very
  // first page load, before this worker is controlling the page, so it was
  // never runtime-cached. 9.9 KB and 9.3 KB, on 107 and 47 pages.
  '/images/logo-shield.svg',
  '/images/seal-footer.svg',
];

// The build's own stylesheets and scripts, as referenced by the pages just
// cached. Astro content-hashes these names, so they are read out of the HTML
// rather than written down.
const ASSET_RE = /(?:href|src)="(\/_astro\/[^"]+?\.(?:css|js))"/g;

/** Run `fn` over `items` with at most `n` in flight. */
async function pooled(items, n, fn) {
  const queue = items.slice();
  const workers = [];
  for (let i = 0; i < Math.min(n, queue.length); i++) {
    workers.push((async () => {
      while (queue.length) {
        const item = queue.shift();
        // One bad URL must never abandon the rest of the precache.
        try { await fn(item); } catch (e) { /* ignore */ }
      }
    })());
  }
  await Promise.all(workers);
}

async function precache() {
  const cache = await caches.open(CACHE);
  const assets = new Set();

  await pooled(ROUTES, 6, async (url) => {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (!res || !res.ok) return;
    await cache.put(url, res.clone());
    const html = await res.text();
    ASSET_RE.lastIndex = 0;
    let m;
    while ((m = ASSET_RE.exec(html)) !== null) assets.add(m[1]);
  });

  await pooled(EXTRA.concat(Array.from(assets)), 6, async (url) => {
    const res = await fetch(url, { credentials: 'same-origin' });
    if (res && res.ok) await cache.put(url, res.clone());
  });
}

self.addEventListener('install', (e) => {
  // skipWaiting either way: a precache that partly failed still beats an old
  // worker sitting in "waiting" forever.
  e.waitUntil(precache().then(() => self.skipWaiting(), () => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

/** Cache a copy without blocking the response. Only ever store a real 200. */
function stash(req, res) {
  if (!res || !res.ok || res.type !== 'basic') return;
  const copy = res.clone();
  caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
}

/** Cached copy, then the offline page, then home. Awaited, not ||'d. */
async function offlineFallback(req, isHTML) {
  const hit = await caches.match(req);
  if (hit) return hit;
  if (isHTML) {
    return (await caches.match('/offline')) || (await caches.match('/')) || Response.error();
  }
  return Response.error();
}

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;      // never touch third parties
  if (url.pathname.startsWith('/api/')) return;          // live calls stay live

  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  // The search index regenerates every deploy: cache-first froze it at
  // whatever the visitor's first fetch saw, so pages added later never
  // appeared in THEIR search (caught live in production with "DJM 900").
  // Network-first keeps search current online and still works offline.
  const isSearchIndex = url.pathname === '/search-index.json';

  if (isHTML || isSearchIndex) {
    const net = fetch(req).then((res) => { stash(req, res); return res; });
    // Whichever answers first: the network, or the cache once the network has
    // had HTML_NET_TIMEOUT to prove itself. `undefined` out of the timeout arm
    // means nothing was cached, so keep waiting on the network.
    const slow = new Promise((resolve) => { setTimeout(resolve, HTML_NET_TIMEOUT); })
      .then(() => caches.match(req));
    e.respondWith(
      Promise.race([net, slow])
        .then((res) => res || net)
        .catch(() => offlineFallback(req, isHTML))
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req)
        .then((res) => { stash(req, res); return res; })
        .catch(() => offlineFallback(req, false))
    )
  );
});
