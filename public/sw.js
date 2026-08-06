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
 *    Removed from the list. THE FILES THEMSELVES WENT ON 2026-08-06: "they stay
 *    in public/ in case a page wants them back" is how a repo accumulates 274 KB
 *    of assets nothing has ever rendered, and an unreferenced file is not a
 *    spare, it is something every future audit has to re-investigate. Deleted
 *    files live in git history, which is the right place for them.
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
// CACHE is defined below, after LANG_PREFIX, because its name carries the
// install language. See the LANG_PREFIX note.

// How long to wait for the network on an HTML request before serving the
// cached copy. Being fully OFFLINE is not the common failure in a basement:
// one bar of signal is, and a fetch that eventually succeeds after 20 seconds
// is a blank screen for 20 seconds while a perfectly good copy sits in the
// cache. The network request is NOT cancelled when this fires; it keeps
// running and still refreshes the cache, so the next navigation is fresh.
const HTML_NET_TIMEOUT = 4000;

// The rescue path, offline. If a page is not here it still works online.
// THE INSTALL LANGUAGE, added 2026-08-05. The question was whether three
// languages make the site heavier, and the honest answer was "not for a
// visitor, EXCEPT here". This worker precached 73 ENGLISH routes and nothing
// else, so a Brazilian who installed the app from the Portuguese site and then
// lost signal in a basement booth would have got the rescue flow back IN
// ENGLISH. That defeats the entire point of the offline promise.
//
// The naive fix, precaching all three languages, is the one change that WOULD
// make it heavier: every install downloading three copies of pages the reader
// will never open. So the worker caches exactly one language, the one the
// visitor installed from, and the route list below is reused with that
// language's prefix rather than duplicated. Same weight as before, right
// language offline.
//
// The prefix arrives as ?lang= on the registration URL, which is also what
// makes the worker re-install when a visitor switches language: a different
// script URL is a different worker.
const LANG_PREFIX = (function () {
  try {
    var q = new URL(self.location.href).searchParams.get('lang') || '';
    return /^(pt|es)$/.test(q) ? '/' + q : '';
  } catch (e) { return ''; }
})();

// ONE CACHE PER LANGUAGE. Without the suffix, a visitor who switched from
// English to Portuguese would install a second worker that then found "/"
// already sitting in the shared store, cached in English, and would serve
// that. The suffix makes the two stores unrelated, and the activate handler
// below only deletes caches for THIS language, so switching back does not
// force a re-download of the language you just left.
// Bump the version part when the precache list changes.
// v17 (H8, 2026-08-05): the brand lockup left the HTML and became
// /images/brand-lockup.svg, so it has to be precached or every offline page
// renders a broken-image icon where the header logo goes. Bumping the version
// is what makes an already-installed device pick the new file up at all.
const CACHE = 'smg-v17' + (LANG_PREFIX ? '-' + LANG_PREFIX.slice(1) : '');

// The search index this language needs. One flat search-index.json used to
// hold all three languages, which meant every install downloaded 412 KB to
// use a third of it, and the search box never filtered what it got back.
// Three files ship now, one per language, and the worker precaches exactly
// the one its pages will ask for. See scripts/build-search-index.mjs.
const SEARCH_INDEX = '/search-index.' + (LANG_PREFIX ? LANG_PREFIX.slice(1) : 'en') + '.json';

const ROUTES_EN = [
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
  // /protocol/full-recovery and its six screens were HERE and were removed on
  // 2026-08-05. That flow still carries its own "DRAFT, review pending"
  // banner, it is noindex, it is not in the sitemap, and after checking all
  // 307 built pages NOTHING links to it: it is an island awaiting review.
  // Every visitor was nevertheless downloading all seven screens on
  // install, and in Portuguese and Spanish they do not exist at all, so the
  // install fired seven requests that could only 404. PUT THEM BACK the day
  // the flow is approved and linked; until then this is dead weight on a
  // first visit. The pages themselves are unaffected and still work online.
  '/legal/disclaimer',
  '/install',
  '/knowledge',
  '/knowledge/pioneer-dj/rekordbox',
  '/knowledge/dictionary',
  '/saved',
  '/files-lost',
  '/offline',
];

// English paths with the install language's prefix. "/" becomes "/pt" rather
// than "/pt/", matching how the site is actually served.
const ROUTES = LANG_PREFIX
  ? ROUTES_EN.map(function (r) { return r === '/' ? LANG_PREFIX : LANG_PREFIX + r; })
  : ROUTES_EN;

// Non-HTML things the rescue path needs offline. The two woff2 files are the
// site's whole typography; the language's search index is what makes offline
// search work. Everything else a page needs is DERIVED from the page, below.
const EXTRA = [
  SEARCH_INDEX,
  '/fonts/archivo-latin-wght-normal.woff2',
  '/fonts/inter-latin-wght-normal.woff2',
  // The brand mark. Added 2026-08-04 after seeing it: with the CSS fix in
  // place every offline page rendered correctly EXCEPT that the nav lockup
  // was a broken-image icon, because the shield is fetched during the very
  // first page load, before this worker is controlling the page, so it was
  // never runtime-cached. 9.9 KB and 9.3 KB, on 107 and 47 pages.
  '/images/logo-shield.svg',
  '/images/seal-footer.svg',
  // The wordmark + tagline lockup. Added 2026-08-05 with H8, which took it out
  // of the HTML: 15.6 KB inlined 455 times became one 15.6 KB file, so the
  // precache gets SMALLER by this line existing, not bigger. It is fetched
  // during the first page load, before this worker controls the page, exactly
  // like the shield above it, so it would never be runtime-cached and every
  // offline page would show a broken image where the header brand goes.
  '/images/brand-lockup.svg',
];

// The build's own stylesheets and scripts, as referenced by the pages just
// cached. Astro content-hashes these names, so they are read out of the HTML
// rather than written down.
const ASSET_RE = /(?:href|src)="(\/_astro\/[^"]+?\.(?:css|js))"/g;

/*
 * AND WHAT THOSE SCRIPTS THEMSELVES IMPORT (2026-08-06).
 *
 * The rule above reads assets out of the HTML, which was complete for as long
 * as every bundle was a single self-contained file. /checklist code-splits its
 * account layer now, and Vite answers a dynamic import() by giving the entry
 * chunk a STATIC import of a small preload helper. That helper appears in no
 * HTML at all, so it was invisible here, and a module whose static import 404s
 * does not run: the offline checklist would have rendered perfectly and then
 * done nothing, no ticking, no meter, no printable list. Exactly the class of
 * bug as the missing stylesheets in note 1, one layer deeper.
 *
 * So the JS is read too, and its static imports are followed to a fixed point.
 * Static ONLY, deliberately: `import(` never matches, because after `import`
 * this pattern requires a quote and a dynamic import has a parenthesis there.
 * That is the line that keeps 20 KB of account and sync code, which cannot
 * work without a network anyway, out of an offline rescue kit.
 */
const JS_IMPORT_RE = /(?:from|import)\s*(["'])((?:\.\/|\/_astro\/)[^"']+?\.js)\1/g;

/** Resolve a specifier found inside /_astro/x.js to an absolute path. */
function astroSpecifier(spec) {
  return spec.indexOf('/_astro/') === 0 ? spec : '/_astro/' + spec.replace(/^\.\//, '');
}

/**
 * Fetch and cache every asset in `assets`, following the static imports of any
 * JS among them until nothing new turns up. Returns the full set it cached.
 */
async function cacheAssets(cache, assets, poolSize) {
  const done = new Set();
  let wave = Array.from(assets);
  // Two waves cover today's graph (entry -> helper); the loop is written as a
  // fixed point so a deeper chain cannot silently fall out of the cache.
  while (wave.length) {
    const next = new Set();
    await pooled(wave, poolSize, async (url) => {
      if (done.has(url)) return;
      done.add(url);
      const res = await fetch(url, { credentials: 'same-origin' });
      if (!res || !res.ok) return;
      await cache.put(url, res.clone());
      if (!/\.js$/.test(url)) return;
      const code = await res.clone().text();
      JS_IMPORT_RE.lastIndex = 0;
      let m;
      while ((m = JS_IMPORT_RE.exec(code)) !== null) {
        const dep = astroSpecifier(m[2]);
        if (!done.has(dep)) next.add(dep);
      }
    });
    wave = Array.from(next);
  }
  return done;
}

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

/*
 * ---------------------------------------------------------------------------
 * THE COMPLETENESS MARKER (2026-08-06), and it closes the most dangerous bug
 * this worker has had.
 *
 * WHAT HAPPENED, reproduced rather than theorised. Take a device holding a
 * complete smg-v17 cache, 73 entries, offline rescue proven. Deploy a version
 * bump. The device fetches the new sw.js, install runs precache(), and the
 * network at that moment is a basement with one bar, so every route fetch
 * fails. pooled() swallows each failure by design, precache() resolves anyway,
 * skipWaiting() fires either way, and activate then deleted smg-v17 because its
 * version no longer matched. Measured end state: ONE cache entry, the
 * revalidation timestamp, and /emergency, /protocol/usb/start and /checklist
 * all failing to render with the origin dead. A device that had the whole
 * rescue offline five seconds earlier now has nothing, and the DJ finds out in
 * the booth.
 *
 * The old comment on install said "a precache that partly failed still beats an
 * old worker sitting in waiting forever". That is true about the WORKER and
 * false about the CACHE, and conflating the two is what caused this. Taking
 * control early is cheap. Throwing away a working rescue is not.
 *
 * SO: the new cache must PROVE it is usable before anything older is deleted.
 * precache() checks what actually landed and writes this marker only when the
 * bar below is met. activate refuses to delete any older cache unless the
 * marker is present in the NEW one, and asks precache() to try again when it is
 * not. An old cache surviving one extra version costs storage the browser was
 * already holding. The alternative costs a gig.
 *
 * WHERE THE BAR IS, AND WHY IT IS NOT "EVERYTHING".
 *   REQUIRED: every entry in ROUTES, plus the search index, the two fonts and
 *   the brand lockup. That is the whole rescue path, legible and searchable, in
 *   the install language. Nothing on that list is optional: a missing route is
 *   a missing screen, a missing font or lockup is a page that renders wrong,
 *   and the search index is how a DJ finds a screen they cannot name.
 *   BEST EFFORT: the footer seal, the shield, and the /_astro bundles derived
 *   from the HTML. They are fetched and cached but do not gate the marker,
 *   because gating on them would let one decorative SVG failing on a flaky
 *   connection strand an otherwise perfect install on the old cache forever,
 *   which is the opposite failure and just as expensive. The tunnel is legible
 *   without them: scripts/test-offline-langs.mjs asserts the stylesheet rule
 *   count and the red token, and both come from inline CSS, not from /_astro.
 * If a future asset becomes load-bearing, move it into REQUIRED_EXTRA and it
 * starts gating. That is the only edit this decision should ever need.
 */
const PRECACHE_COMPLETE = '/__smg-precache-complete';

// The subset of EXTRA the marker requires. See the note above.
const REQUIRED_EXTRA = [
  SEARCH_INDEX,
  '/fonts/archivo-latin-wght-normal.woff2',
  '/fonts/inter-latin-wght-normal.woff2',
  '/images/brand-lockup.svg',
];

/** True when this cache holds a precache that met the bar. */
async function precacheComplete(cache) {
  return Boolean(await cache.match(PRECACHE_COMPLETE));
}

/**
 * Fill the cache. Resolves true only when the required set is all present,
 * which is the one thing that authorises deleting an older cache.
 */
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

  await cacheAssets(cache, EXTRA.concat(Array.from(assets)), 6);

  // A RETRY MUST BE ABLE TO FINISH WHAT AN EARLIER PASS STARTED, so the bar is
  // measured against the CACHE and not against this run's tally. A device that
  // got 64 of 65 routes and then dropped signal needs to fetch one route on the
  // next attempt, not all 65.
  const missing = [];
  for (const url of ROUTES.concat(REQUIRED_EXTRA)) {
    if (!(await cache.match(url))) missing.push(url);
  }

  if (missing.length) {
    // No marker, so activate keeps the older cache and schedules another try.
    // The read path is unharmed either way: whatever landed is served from this
    // cache, and caches.match() spans every cache in the origin, so anything
    // that did not land still comes out of the previous version's store.
    return false;
  }

  await cache.put(PRECACHE_COMPLETE, new Response(String(Date.now())));
  // The retry budget is spent only on failures, so a completed pass returns it.
  await cache.delete(PRECACHE_TRIES);

  // The 24-hour revalidation window starts here, and ONLY on a complete pass.
  // A device that has just finished precaching has, by definition, the current
  // copy of everything, so without this the revalidation on activate would
  // immediately re-fetch all 65 routes it downloaded one second ago. Stamping
  // an INCOMPLETE pass was the second half of the bug above: it locked the one
  // mechanism that could have refilled the cache out for a full day. See
  // stampRevalidation and PARTIAL_RETRY_MS below.
  await stampRevalidation(cache, Date.now());
  return true;
}

/*
 * ---------------------------------------------------------------------------
 * BACKGROUND REVALIDATION (H15, 2026-08-05)
 *
 * THE BUG THIS FIXES. Until now the precache was only ever refreshed by a
 * manual CACHE version bump in this file. A phone that installed the app on
 * Aug 4 and then lived in that app kept serving Aug 4 tunnel copy forever: the
 * HTML fetch handler is network-first, so an ONLINE visit did refresh whatever
 * page the DJ opened, but the other 64 precached routes were never touched
 * again. Every instruction corrected since install stayed wrong on that device
 * until someone remembered to bump a constant. On a site whose entire purpose
 * is telling a DJ which button to press, silently serving a superseded
 * instruction is the worst failure mode available.
 *
 * WHAT IT DOES. At most once every 24 hours, re-fetch the precached HTML
 * routes and re-put only the ones whose response actually differs.
 *
 * DESIGN CONSTRAINTS, all deliberate:
 *   - QUIET. No message to the page, no reload, no notification. The DJ finds
 *     out by the next screen being right.
 *   - NON-BLOCKING. It never sits in front of respondWith. It runs inside
 *     waitUntil, which keeps the worker alive without delaying a single byte
 *     to the page.
 *   - THE READ PATH IS UNTOUCHED. The fetch handlers below are byte for byte
 *     what they were: network-first HTML, cache-first assets, offline
 *     fallback. This only writes.
 *   - SILENT OFFLINE. Every fetch is inside pooled()'s try/catch. In a
 *     basement the whole pass fails and nothing is disturbed.
 *   - CHEAP WHEN NOTHING CHANGED. ETag or Last-Modified decides it without
 *     reading a body wherever the edge sends them; a body hash is the fallback
 *     for when it does not. An unchanged route costs one conditional-ish GET
 *     and no cache write.
 *   - THROTTLED ACROSS RESTARTS. The timestamp lives in the cache itself, not
 *     in a variable, because a service worker is killed and restarted
 *     constantly. IndexedDB would do the same job with a second storage API
 *     to get wrong.
 *
 * WHY THE CACHE-BUSTING QUERY. Without it a plain fetch can be answered by the
 * browser's own HTTP cache with the exact bytes we already hold, which makes
 * the whole pass a no-op that reports success. `cache: 'no-store'` covers most
 * of it; the query string covers the intermediaries that ignore it. The
 * response is stored under the CLEAN url, so nothing in the read path ever
 * sees the parameter.
 *
 * KNOWN BOUND. New /_astro/*.css and *.js referenced by changed HTML are
 * fetched and added (without this, a deploy that changes a content hash would
 * leave the offline copy of a page styled by a stylesheet that is not in the
 * cache, which was the exact bug the 2026-08-04 pass fixed). Superseded asset
 * files are NOT deleted here: the cache still only grows on a real deploy, and
 * a CACHE version bump clears the lot. If that ever becomes a storage problem
 * it is a prune step here, not a redesign.
 */
const REVALIDATE_EVERY_MS = 24 * 60 * 60 * 1000;

/*
 * THE PARTIAL-PASS BACKOFF, BOUNDED (2026-08-06).
 *
 * The stamp used to be written unconditionally at the end of precache(), and on
 * an install that downloaded NOTHING that was measurably the worse half of the
 * cache-wipe bug documented above precache(): the cache held one entry, the
 * stamp, and revalidationDue() then said "not for another 24 hours", so the one
 * mechanism that could have refilled it was locked out for a day. Restoring the
 * network and navigating brought the cache back to 7 entries and stopped there.
 *
 * The naive fix, "do not stamp a failed pass", buys the opposite failure: with
 * no stamp at all revalidationDue() is always true, so every navigation kicks
 * off a fresh 65-route pass. On the merely SLOW network that caused the partial
 * install in the first place that is the worst available answer, because the
 * retries then compete with the page the DJ is trying to read.
 *
 * So an incomplete cache retries on a SHORT window, a BOUNDED number of times,
 * and then falls back to the daily cycle:
 *
 *   PARTIAL_RETRY_MS   two minutes. A DJ walking through the tunnel makes five
 *                      or ten navigations a minute, so this collapses any real
 *                      burst into one attempt, while a device that regains
 *                      signal is complete again within a page load or two
 *                      rather than tomorrow.
 *   PARTIAL_RETRY_MAX  five. Ten minutes of trying covers "walked upstairs",
 *                      "left the basement", "found the wifi password". Past
 *                      that the network is not momentarily bad, it is bad, and
 *                      hammering it helps nobody, so the daily cycle takes over
 *                      and the next real chance is the next day or the next
 *                      version.
 *
 * NEITHER NUMBER IS LOAD-BEARING FOR CORRECTNESS. Throughout all of this the
 * device is not broken: the previous complete cache is still there and still
 * serving, because cleanupOldCaches() refuses to delete it. That is what makes
 * a conservative retry policy affordable here.
 */
const PARTIAL_RETRY_MS = 2 * 60 * 1000;
const PARTIAL_RETRY_MAX = 5;

// Consecutive failed precache passes for THIS cache. Cleared the moment a pass
// completes. Lives in the cache for the same reason the stamp does: a worker is
// killed and restarted constantly, so a variable would reset the count on every
// wake and the bound would never be reached.
const PRECACHE_TRIES = '/__smg-precache-tries';

async function precacheTries(cache) {
  const hit = await cache.match(PRECACHE_TRIES);
  if (!hit) return 0;
  const n = Number(await hit.text());
  return Number.isFinite(n) && n > 0 ? n : 0;
}

// A synthetic cache key, not a route. It is under a path the site does not
// serve and nothing ever requests, so the fetch handler cannot collide with
// it; it exists only because Cache Storage is the one place a worker can write
// that survives being killed between events.
const REVALIDATE_STAMP = '/__smg-revalidated-at';

function stampRevalidation(cache, when) {
  return cache.put(REVALIDATE_STAMP, new Response(String(when)));
}

/**
 * How long the current stamp buys. A cache whose precache never completed is on
 * the short window, because it still has routes to collect and "come back
 * tomorrow" is the wrong answer to that. Once the bounded number of attempts is
 * spent it joins the daily cycle like everything else.
 */
async function revalidateWindow(cache) {
  if (await precacheComplete(cache)) return REVALIDATE_EVERY_MS;
  if ((await precacheTries(cache)) >= PARTIAL_RETRY_MAX) return REVALIDATE_EVERY_MS;
  return PARTIAL_RETRY_MS;
}

async function revalidationDue(cache, now) {
  const hit = await cache.match(REVALIDATE_STAMP);
  if (!hit) return true;
  const t = Number(await hit.text());
  return !t || now - t >= (await revalidateWindow(cache));
}

/** SHA-256 of a response body, hex. Only called when no validator header is
 *  available on both sides. */
async function bodyHash(res) {
  const buf = await res.arrayBuffer();
  const digest = await crypto.subtle.digest('SHA-256', buf);
  return Array.prototype.map
    .call(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/** true when `fresh` is the same document we already have cached. Consumes
 *  both bodies only in the no-validator case. */
async function unchanged(hit, fresh) {
  const he = hit.headers.get('etag');
  const fe = fresh.headers.get('etag');
  // Weak/strong prefixes are compared as-is: we only care whether the edge
  // says "same" or "different", not which flavour of same.
  if (he && fe) return he === fe;
  const hm = hit.headers.get('last-modified');
  const fm = fresh.headers.get('last-modified');
  if (hm && fm) return hm === fm;
  const [a, b] = await Promise.all([bodyHash(hit), bodyHash(fresh)]);
  return a === b;
}

// One pass at a time per worker instance. Two navigations landing in the same
// second would otherwise both pass the 24-hour check and race each other.
let revalidating = null;

async function revalidate() {
  const cache = await caches.open(CACHE);
  const now = Date.now();
  if (!(await revalidationDue(cache, now))) return;
  // Claim the window BEFORE doing any work, so a pass that dies halfway (the
  // worker being killed, the DJ walking out of signal) does not turn into a
  // retry on every navigation.
  await stampRevalidation(cache, now);

  // AN INCOMPLETE CACHE IS FINISHED BEFORE IT IS REFRESHED (2026-08-06).
  // install runs once per worker, so a precache that fell short has no second
  // chance of its own. This is that second chance, and it is the right place for
  // it: it already runs on activation and on navigation, it is already inside
  // waitUntil and already throttled, so a device that comes back into signal
  // completes the rescue path without the DJ doing anything.
  if (!(await precacheComplete(cache))) {
    if (await precache()) {
      // The marker exists now, so the superseded cache this version was not
      // allowed to touch can finally go. Without this line it would survive
      // until the NEXT worker activation, which is correct but leaves a whole
      // spare rescue path in storage for no reason once this one is proven.
      await cleanupOldCaches();
      // precache() wrote the marker and its own full-day stamp, and it just
      // fetched everything, so there is nothing left here to refresh.
      return;
    }
    // Still short. Count the attempt so the retries are bounded, and leave the
    // short stamp written above in place: the next try is minutes away rather
    // than a day, and there is no point revalidating a set of routes that is
    // not all there yet.
    await cache.put(PRECACHE_TRIES, new Response(String((await precacheTries(cache)) + 1)));
    return;
  }

  const newAssets = new Set();

  await pooled(ROUTES, 3, async (url) => {
    const bust = url + (url.indexOf('?') === -1 ? '?' : '&') + '__smgrv=' + now;
    const fresh = await fetch(bust, { credentials: 'same-origin', cache: 'no-store' });
    if (!fresh || !fresh.ok) return;
    const store = fresh.clone();
    const hit = await cache.match(url);
    if (hit && (await unchanged(hit, fresh))) return;
    await cache.put(url, store.clone());
    const html = await store.text();
    ASSET_RE.lastIndex = 0;
    let m;
    while ((m = ASSET_RE.exec(html)) !== null) newAssets.add(m[1]);
  });

  // Only the ones we do not already hold: content-hashed names never change
  // under the same url, so anything already cached is already current. The
  // import graph is walked from the ones that ARE new, which is enough: a new
  // helper hash can only arrive with a new entry hash that imports it.
  const wanted = [];
  for (const a of newAssets) if (!(await cache.match(a))) wanted.push(a);
  await cacheAssets(cache, wanted, 3);
}

/** Throttled entry point. Safe to call on every navigation. */
function maybeRevalidate() {
  if (revalidating) return revalidating;
  revalidating = revalidate()
    .catch(() => {})
    .then(() => { revalidating = null; });
  return revalidating;
}

self.addEventListener('install', (e) => {
  // skipWaiting either way. That is a statement about the WORKER and it is still
  // right: an old worker stuck in "waiting" forever is worse than a new one that
  // has not finished collecting. What used to be wrong was letting the same
  // reasoning govern the CACHE, and activate no longer does. See the
  // PRECACHE_COMPLETE note above precache().
  e.waitUntil(precache().then(() => self.skipWaiting(), () => self.skipWaiting()));
});

// The cache version, without the language part. Cleanup is keyed on this and
// NOT on the full name: a visitor who switches language installs a second
// worker, and if that worker deleted every cache but its own it would throw
// away the language they just came from, so switching back would re-download
// the whole rescue path on whatever signal they have. Same version, different
// language, is left alone; only an OLD version is deleted, in every language.
// That still bounds the storage at one rescue path per language ever visited,
// and a single version bump clears all of them.
const CACHE_VERSION = CACHE.replace(/-(?:pt|es)$/, '');
const OURS = /^smg-v\d+(?:-(?:pt|es))?$/;

/**
 * Delete superseded caches, but ONLY once this version has proved it can stand
 * on its own. See the PRECACHE_COMPLETE note above precache() for the measured
 * failure this guards: without it, a version bump landing on a dead network
 * deleted a complete rescue and left one cache entry behind.
 *
 * When the marker is absent nothing is deleted and the old cache keeps serving
 * through caches.match(), which spans every cache in the origin. The cost is one
 * extra rescue path in storage until the next successful pass. The benefit is
 * that no DJ is ever left with nothing.
 */
async function cleanupOldCaches() {
  const cache = await caches.open(CACHE);
  if (!(await precacheComplete(cache))) return false;
  const keys = await caches.keys();
  await Promise.all(
    keys
      .filter((k) => OURS.test(k) && k.replace(/-(?:pt|es)$/, '') !== CACHE_VERSION)
      .map((k) => caches.delete(k)),
  );
  return true;
}

self.addEventListener('activate', (e) => {
  e.waitUntil(
    // Claim the pages FIRST, so nothing about taking control waits on storage.
    self.clients.claim()
      .then(() => cleanupOldCaches())
      // Revalidation trigger 1 of 2: activation. After a COMPLETE install this
      // returns immediately, because precache() has already stamped the 24-hour
      // window. After a partial one it is what retries the precache, and the
      // cleanup above then happens on the following activation or navigation.
      .then(() => maybeRevalidate())
      // A completed retry inside maybeRevalidate() means the marker exists now,
      // so the old cache can go. Cheap: one caches.keys() when there is nothing
      // to delete.
      .then(() => cleanupOldCaches())
      .catch(() => {}),
  );
});

/** Cache a copy without blocking the response. Only ever store a real 200. */
function stash(req, res) {
  if (!res || !res.ok || res.type !== 'basic') return;
  const copy = res.clone();
  caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
}

/*
 * IGNORE THE QUERY STRING WHEN READING (2026-08-06).
 *
 * THE HOLE THIS CLOSES, at the end of every single rescue. Every outcome option
 * in the three trees routes to /saved with a query string that records which
 * branch worked: "/saved?path=no_sound&branch=thin" and 74 others. Not one of
 * them links bare /saved. Cache Storage matches on the FULL url unless told
 * otherwise, so a cache holding a perfect copy of /saved was a miss for every
 * URL the tunnel actually navigates to. Measured with the origin process killed:
 * /saved rendered "YOU'RE BACK ON.", /saved?path=no_sound&branch=thin rendered
 * "You are offline". The payoff screen at the end of the rescue, in the exact
 * no-signal basement the precache exists for, told the DJ they had no
 * connection. /files-lost carries the same shape.
 *
 * ignoreSearch is right for this site rather than merely convenient: the query
 * strings here are ANALYTICS PARAMETERS, read by the page's own script to label
 * an event. They never change what the document is. There is no URL on this
 * site where two query strings mean two different pages, and if one is ever
 * added it needs its own cache key, not a relaxation of this.
 *
 * The gate now covers the class rather than the instance: scripts/
 * test-offline-langs.mjs walks real outcome URLs taken from the trees, in all
 * three languages, including a /files-lost one.
 */
const MATCH_ANY_QUERY = { ignoreSearch: true };

/**
 * Cached copy, then the offline page, then home. Awaited, not ||'d.
 *
 * IN THE INSTALL LANGUAGE FIRST (2026-08-06). Both fallbacks were the ENGLISH
 * paths, and this worker precaches exactly one language: on a Portuguese install
 * the cache holds /pt/offline and /pt, never /offline or /, so both branches
 * missed and a genuinely uncached URL offline resolved to Response.error(), which
 * is a raw browser error page. Surfaced by the new outcome-URL cases in
 * scripts/test-offline-langs.mjs, where English at least reached /offline and
 * Portuguese and Spanish reached net::ERR_FAILED. The English paths are kept as
 * the second try, because caches.match() spans every cache in the origin and a
 * reader who has visited both languages may well have them.
 */
async function offlineFallback(req, isHTML) {
  const hit = await caches.match(req, MATCH_ANY_QUERY);
  if (hit) return hit;
  if (isHTML) {
    return (await caches.match(LANG_PREFIX + '/offline')) ||
      (await caches.match('/offline')) ||
      (await caches.match(LANG_PREFIX || '/')) ||
      (await caches.match('/')) ||
      Response.error();
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

  // Revalidation trigger 2 of 2: navigation. Activation happens once, and a
  // worker only runs when an event wakes it, so the 24-hour timer needs
  // something to check it. This is that something, and it is deliberately here
  // rather than inside respondWith: waitUntil keeps the worker alive for the
  // pass WITHOUT the page waiting on any of it, and maybeRevalidate() returns
  // an already-settled promise on all but one navigation a day. The response
  // this event produces is decided entirely by the code below, unchanged.
  if (isHTML) e.waitUntil(maybeRevalidate());

  // The search index regenerates every deploy: cache-first froze it at
  // whatever the visitor's first fetch saw, so pages added later never
  // appeared in THEIR search (caught live in production with "DJM 900").
  // Network-first keeps search current online and still works offline.
  //
  // ALL THREE INDEXES, NOT JUST THE INSTALLED ONE (2026-08-06). This tested
  // `=== SEARCH_INDEX`, which is only the install language's file, so a request
  // for either of the other two fell through to the cache-first branch below
  // and was frozen at whatever the first fetch happened to return, permanently.
  // That is reachable in one tap: a reader who installed from /pt and follows
  // any link into an English page (an autolink fallback, the undo line, the
  // picker) and searches there was getting the exact bug network-first exists
  // to prevent. The worker still PRECACHES only its own language; this is about
  // how the other two are READ on the occasions a page asks for them.
  const isSearchIndex = /^\/search-index\.(?:en|pt|es)\.json$/.test(url.pathname);

  if (isHTML || isSearchIndex) {
    const net = fetch(req).then((res) => { stash(req, res); return res; });
    // Whichever answers first: the network, or the cache once the network has
    // had HTML_NET_TIMEOUT to prove itself. `undefined` out of the timeout arm
    // means nothing was cached, so keep waiting on the network.
    // ignoreSearch for the same reason offlineFallback uses it: on one bar of
    // signal this arm is what serves the end of the rescue, and every outcome
    // URL carries a query string. See the note on MATCH_ANY_QUERY.
    const slow = new Promise((resolve) => { setTimeout(resolve, HTML_NET_TIMEOUT); })
      .then(() => caches.match(req, MATCH_ANY_QUERY));
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
