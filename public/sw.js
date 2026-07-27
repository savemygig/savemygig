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
const CACHE = 'smg-v5';

// The rescue path, offline. If a page is not here it still works online.
const PRECACHE = [
  '/',
  '/emergency',
  '/checklist',
  '/card',
  '/protocol/critical',
  '/protocol/critical/symptom',
  '/protocol/critical/folder-view',
  '/protocol/critical/have-computer',
  '/protocol/critical/usb-check',
  '/protocol/critical/no-laptop',
  '/protocol/critical/no-laptop-2',
  '/protocol/critical/no-laptop-3',
  '/protocol/critical/risk',
  '/protocol/critical/second-usb',
  '/protocol/critical/second-usb-format',
  '/protocol/critical/second-usb-copy',
  '/protocol/critical/no-erase',
  '/protocol/critical/copy',
  '/protocol/critical/erase',
  '/protocol/critical/format',
  '/protocol/critical/copy-back',
  '/protocol/critical/load',
  '/protocol/critical/fallback',
  '/protocol/critical/usb-dead',
  '/protocol/critical/now',
  '/protocol/no-sound',
  '/protocol/no-sound/channel',
  '/protocol/no-sound/channel-2',
  '/protocol/no-sound/channel-3',
  '/protocol/no-sound/master',
  '/protocol/no-sound/master-2',
  '/protocol/no-sound/house',
  '/protocol/no-sound/phones',
  '/protocol/no-sound/phones-2',
  '/protocol/no-sound/wrong',
  '/protocol/no-sound/wrong-2',
  '/protocol/no-sound/fallback',
  '/protocol/quick-fix',
  '/protocol/quick-fix/usb-check',
  '/protocol/quick-fix/rekordbox-check',
  '/protocol/quick-fix/backup',
  '/protocol/quick-fix/repair',
  '/protocol/quick-fix/format',
  '/protocol/quick-fix/export',
  '/protocol/quick-fix/fresh-usb',
  '/protocol/quick-fix/dead-checks',
  '/protocol/quick-fix/no-computer',
  '/protocol/quick-fix/verify',
  '/protocol/full-recovery',
  '/protocol/full-recovery/value',
  '/protocol/full-recovery/health',
  '/protocol/full-recovery/rescue',
  '/protocol/full-recovery/rebuild',
  '/protocol/full-recovery/retire',
  '/protocol/full-recovery/verify',
  '/disclaimer',
  '/knowledge',
  '/knowledge/rekordbox',
  '/saved',
  '/files-lost',
  '/offline',
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

  if (isHTML) {
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
