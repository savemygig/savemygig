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
 */
const CACHE = 'smg-v10';

// The rescue path, offline. If a page is not here it still works online.
const PRECACHE = [
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
  '/knowledge/rekordbox',
  '/knowledge/dictionary',
  '/saved',
  '/files-lost',
  '/offline',
  '/search-index.json',
  '/fonts/archivo-latin-wght-normal.woff2',
  '/fonts/inter-latin-wght-normal.woff2',
  '/images/seal-72.webp',
  '/images/seal-72.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll is all-or-nothing, so add individually: one 404 must not
      // abandon the entire precache.
      .then((c) => Promise.all(PRECACHE.map((u) => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

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
  // appeared in THEIR search (Antonio caught it live with "DJM 900").
  // Network-first keeps search current online and still works offline.
  const isSearchIndex = url.pathname === '/search-index.json';

  if (isHTML || isSearchIndex) {
    e.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
          return res;
        })
        .catch(() =>
          caches.match(req).then((hit) => hit || caches.match('/offline') || caches.match('/'))
        )
    );
    return;
  }

  e.respondWith(
    caches.match(req).then((hit) =>
      hit ||
      fetch(req).then((res) => {
        if (res.ok && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        }
        return res;
      }).catch(() => hit)
    )
  );
});
