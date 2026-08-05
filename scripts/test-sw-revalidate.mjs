/*
 * SERVICE WORKER BACKGROUND REVALIDATION, unit-style.
 *
 * WHY THIS IS A TEST AND NOT A SCREENSHOT. H15 (2026-08-05) added a pass that
 * re-fetches the precached rescue routes at most once a day and quietly re-puts
 * the ones that changed. Every design constraint on it is about being
 * INVISIBLE: no reload, no message to the page, nothing in front of a response.
 * That means there is nothing to look at. The only way to know it works is to
 * drive it directly, and the only way to know it still works next month is for
 * that to be in the gate.
 *
 * It also guards the thing that would hurt: the pass writes to the same cache
 * the offline rescue path reads from. A bug here does not show up as a broken
 * page in review, it shows up as a DJ in a basement getting a stale or empty
 * screen.
 *
 * HOW. public/sw.js is loaded into a sandbox with a fake Cache Storage, a fake
 * origin it can fetch from, and the real Response/URL/crypto from Node, then
 * the worker's own install and revalidate paths are called and the cache is
 * inspected. No browser, so it runs in about a second.
 *
 * WHAT IS ASSERTED, in order:
 *   1. install precaches every route AND stamps the 24-hour window, so the
 *      activation pass right behind it is a no-op instead of 65 re-fetches.
 *   2. inside 24 hours, a revalidation attempt fetches NOTHING.
 *   3. after 24 hours, with one route's body changed at the origin: that route
 *      is re-put with the new body and the untouched routes are NOT re-put.
 *   4. ETag is used as the decider when the origin sends one, so an unchanged
 *      route costs no cache write even though its body was fetched.
 *   5. Last-Modified is the fallback decider, and a body hash the fallback to
 *      that, so a bare origin with no validators still gets it right.
 *   6. a changed page's NEW /_astro/ stylesheet is pulled into the cache. This
 *      is the regression that would otherwise ship a correct offline page with
 *      no CSS.
 *   7. offline (every fetch throws) is silent: no exception escapes and the
 *      cache still holds exactly what it held before.
 *   8. the pass re-stamps, so it cannot run twice in the same window.
 *   9. requests carry the cache-busting parameter, and nothing is ever stored
 *      under a url containing it.
 *
 * Run: node scripts/test-sw-revalidate.mjs
 */
import { readFile } from 'node:fs/promises';

const ORIGIN = 'https://www.savemygig.com';

let fails = 0;
function ok(name, cond, detail) {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
  if (!cond) fails++;
}

/* ---------------------------------------------------------------- the origin */

// path (no query) -> { body, etag?, lastModified? }
let origin = new Map();
let requests = [];
let offline = false;

function serve(path, body, headers = {}) {
  origin.set(path, { body, headers });
}

async function fakeFetch(input, opts = {}) {
  const raw = typeof input === 'string' ? input : input.url;
  requests.push({ url: raw, cache: opts.cache });
  if (offline) throw new TypeError('Failed to fetch');
  const u = new URL(raw, ORIGIN);
  const entry = origin.get(u.pathname);
  if (!entry) return new Response('not found', { status: 404 });
  return new Response(entry.body, { status: 200, headers: entry.headers });
}

/* --------------------------------------------------------- fake Cache Storage */

class FakeCache {
  constructor() { this.map = new Map(); }
  static key(req) {
    const raw = typeof req === 'string' ? req : req.url;
    const u = new URL(raw, ORIGIN);
    return u.pathname + u.search;
  }
  async put(req, res) { this.map.set(FakeCache.key(req), res); }
  async match(req) {
    const hit = this.map.get(FakeCache.key(req));
    return hit ? hit.clone() : undefined;
  }
  async delete(req) { return this.map.delete(FakeCache.key(req)); }
  keys() { return [...this.map.keys()]; }
}

const stores = new Map();
const caches = {
  async open(name) {
    if (!stores.has(name)) stores.set(name, new FakeCache());
    return stores.get(name);
  },
  async keys() { return [...stores.keys()]; },
  async delete(name) { return stores.delete(name); },
  async match(req) {
    for (const c of stores.values()) { const hit = await c.match(req); if (hit) return hit; }
    return undefined;
  },
};

/* ----------------------------------------------------------------- load sw.js */

const src = await readFile('public/sw.js', 'utf-8');

const listeners = new Map();
const self_ = {
  location: { href: `${ORIGIN}/sw.js` },
  addEventListener(type, fn) { listeners.set(type, fn); },
  skipWaiting: async () => {},
  clients: { claim: async () => {} },
};

const factory = new Function(
  'self', 'caches', 'fetch', 'Response', 'Request', 'URL', 'crypto', 'setTimeout',
  `${src}
   return {
     precache, revalidate, maybeRevalidate, stampRevalidation, revalidationDue,
     CACHE, ROUTES, REVALIDATE_STAMP, REVALIDATE_EVERY_MS,
   };`
);
const sw = factory(self_, caches, fakeFetch, Response, Request, URL, globalThis.crypto, setTimeout);

// Always resolved fresh: the later phases throw the whole Cache Storage away
// and re-install, so holding a reference to one FakeCache would quietly test
// a store nothing is writing to any more.
const store = () => stores.get(sw.CACHE);
const cached = async (path) => {
  const hit = await (await caches.open(sw.CACHE)).match(path);
  return hit ? await hit.text() : null;
};
const held = (path) => store().map.get(path);
const expire = async () =>
  sw.stampRevalidation(await caches.open(sw.CACHE), Date.now() - sw.REVALIDATE_EVERY_MS - 1000);

/* ------------------------------------------------------- seed the fake origin */

const CSS_OLD = '/_astro/style.aaaa.css';
const CSS_NEW = '/_astro/style.bbbb.css';

// Every precached route, with an ETag, plus the non-HTML extras the worker
// wants. The exact route list comes from sw.js, so this test cannot drift from
// the real precache.
function seedOrigin({ etags = true } = {}) {
  origin = new Map();
  for (const r of sw.ROUTES) {
    serve(r, `<html><head><link href="${CSS_OLD}"></head><body>${r} v1</body></html>`,
      etags ? { etag: `"${r}-v1"` } : {});
  }
  serve(CSS_OLD, 'body{color:red}', { etag: '"css-1"' });
  serve(CSS_NEW, 'body{color:blue}', { etag: '"css-2"' });
  for (const extra of ['/search-index.en.json', '/fonts/archivo-latin-wght-normal.woff2',
    '/fonts/inter-latin-wght-normal.woff2', '/images/logo-shield.svg',
    '/images/seal-footer.svg', '/images/brand-lockup.svg']) serve(extra, `x-${extra}`, { etag: `"${extra}"` });
}
seedOrigin();

/* ------------------------------------------------------------------- 1. install */

await sw.precache();
const cachedRoutes = sw.ROUTES.filter((r) => store().map.has(r));
ok('install precaches every route', cachedRoutes.length === sw.ROUTES.length,
  `${cachedRoutes.length}/${sw.ROUTES.length}`);
ok('install caches the CSS the pages reference', store().map.has(CSS_OLD));
ok('install stamps the revalidation window', store().map.has(sw.REVALIDATE_STAMP));

const stampAfterInstall = Number(await cached(sw.REVALIDATE_STAMP));
ok('the stamp is a plausible timestamp', Math.abs(Date.now() - stampAfterInstall) < 60_000);

/* -------------------------------------------------- 2. throttled inside 24 hours */

requests = [];
await sw.maybeRevalidate();
ok('inside 24h a revalidation attempt fetches nothing', requests.length === 0,
  `${requests.length} requests`);

/* --------------------------- 3 + 4. after 24h, only the changed route is re-put */

const CHANGED = '/protocol/usb/moves';           // a real precached rescue screen
const UNCHANGED = '/protocol/usb/start';
serve(CHANGED, `<html><head><link href="${CSS_OLD}"></head><body>${CHANGED} v2 CORRECTED</body></html>`,
  { etag: `"${CHANGED}-v2"` });

const before = { changed: await cached(CHANGED), unchanged: await cached(UNCHANGED) };
// The STORED Response object, not a clone of it: object identity is how this
// test tells "the worker decided not to write" apart from "the worker wrote the
// same bytes again", and only the first of those is the behaviour being claimed.
const unchangedRef = held(UNCHANGED);

await expire();
requests = [];
await sw.maybeRevalidate();

const after = { changed: await cached(CHANGED), unchanged: await cached(UNCHANGED) };
ok('after 24h the changed route is re-put with the new body',
  after.changed.includes('v2 CORRECTED') && before.changed.includes('v1'),
  'v1 -> v2');
ok('the unchanged routes are left exactly as they were',
  after.unchanged === before.unchanged && held(UNCHANGED) === unchangedRef,
  'same body and the same stored Response object, so no re-put happened');
ok('every route was checked', requests.filter((r) => r.url.includes('__smgrv=')).length >= sw.ROUTES.length,
  `${requests.filter((r) => r.url.includes('__smgrv=')).length} conditional GETs`);

/* ------------------------------------------------------- 9. the cache-busting url */

ok('revalidation requests carry the cache-busting parameter',
  requests.every((r) => !sw.ROUTES.includes(new URL(r.url, ORIGIN).pathname) || r.url.includes('__smgrv=')));
ok('revalidation requests bypass the HTTP cache',
  requests.filter((r) => r.url.includes('__smgrv=')).every((r) => r.cache === 'no-store'));
ok('nothing is ever stored under a busted url',
  store().keys().every((k) => !k.includes('__smgrv=')),
  `${store().keys().length} cache entries, none parameterised`);

/* ---------------------------------------------- 6. a new stylesheet gets pulled in */

serve(CHANGED, `<html><head><link href="${CSS_NEW}"></head><body>${CHANGED} v3</body></html>`,
  { etag: `"${CHANGED}-v3"` });
await expire();
await sw.maybeRevalidate();
ok('a changed page brings its new /_astro stylesheet into the cache', store().map.has(CSS_NEW));
ok('the old stylesheet is still there for the pages that still use it', store().map.has(CSS_OLD));

/* -------------------------------- 5. no ETag: Last-Modified, then a body hash */

// Rebuild from scratch with no ETags at all, so the header ladder has to fall
// through to Last-Modified and then to hashing the body.
stores.clear();
seedOrigin({ etags: false });
for (const r of sw.ROUTES) {
  origin.get(r).headers = { 'last-modified': 'Mon, 04 Aug 2026 10:00:00 GMT' };
}
await sw.precache();

serve(CHANGED, `<html><body>${CHANGED} LM v2</body></html>`,
  { 'last-modified': 'Tue, 05 Aug 2026 09:00:00 GMT' });
const lmRef = held(UNCHANGED);
await expire();
await sw.maybeRevalidate();
ok('with no ETag, Last-Modified decides: changed route re-put',
  (await cached(CHANGED)).includes('LM v2'));
ok('with no ETag, Last-Modified decides: unchanged route untouched',
  held(UNCHANGED) === lmRef);

// Now strip Last-Modified too. Same timestamps everywhere means only the bytes
// can tell the two apart.
stores.clear();
seedOrigin({ etags: false });
await sw.precache();
serve(CHANGED, `<html><body>${CHANGED} HASH v2</body></html>`);
const hashRef = held(UNCHANGED);
await expire();
await sw.maybeRevalidate();
ok('with no validators at all, the body hash decides: changed route re-put',
  (await cached(CHANGED)).includes('HASH v2'));
ok('with no validators at all, the body hash decides: unchanged route untouched',
  held(UNCHANGED) === hashRef);

/* --------------------------------------------------------------- 7. offline */

const snapshot = new Map(store().map);
await expire();
offline = true;
let threw = null;
try { await sw.maybeRevalidate(); } catch (e) { threw = e; }
offline = false;
ok('offline, nothing escapes', threw === null, threw ? String(threw) : 'no exception');
ok('offline, the cache is untouched',
  store().map.size === snapshot.size &&
  [...snapshot.keys()].every((k) => k === sw.REVALIDATE_STAMP || held(k) === snapshot.get(k)),
  `${store().map.size} entries, unchanged`);

/* ------------------------------------------------- 8. it re-stamps, so no rerun */

requests = [];
await sw.maybeRevalidate();
ok('a completed pass claims the next 24 hours', requests.length === 0,
  `${requests.length} requests on the immediate second attempt`);

console.log('');
if (fails) {
  console.error(`SW revalidation FAILED: ${fails} failure(s)`);
  process.exit(1);
}
console.log('SW revalidation PASS');
