/*
 * THE INSTALL RECOMMENDATION, in a real browser.
 *
 * WHY IT IS A TEST. src/components/InstallNudge.astro asks a DJ to add the site
 * to their home screen, which is what makes the offline promise durable on iOS.
 * Almost everything that could go wrong with it is INVISIBLE in the built HTML,
 * because the card ships hidden and every decision about it is taken at runtime:
 * whether the app is already installed, which platform this is, whether the
 * reader dismissed it on a different page last week.
 *
 * And the failure modes are not cosmetic. Showing an install pitch inside
 * Emergency Mode breaks the founding rule of the rescue tunnel. Showing an
 * Install button on an iPhone, where there is no install API, is a dead button
 * on the one platform that needs the instruction most. Showing it to somebody
 * who already installed makes the product look like it is not paying attention.
 * None of those would fail a build, and none would look wrong in a screenshot
 * taken on the wrong device.
 *
 * WHAT IS ASSERTED, in order:
 *   1. It renders and is VISIBLE on /saved, /card and /checklist, in all three
 *      languages, in the page's own language.
 *   2. It is not in the HTML at all on /emergency or on rescue tunnel screens,
 *      in all three languages. Not hidden: absent.
 *   3. Already installed (display-mode: standalone, emulated) -> stays hidden.
 *   4. Already installed on iOS (navigator.standalone, emulated) -> stays
 *      hidden. Different signal, same rule.
 *   5. Dismissal persists ACROSS PAGES and across a reload, across this card's
 *      own three placements, and does NOT reach InstallApp's homepage banner in
 *      either direction: they have separate keys on purpose, because intent on
 *      the homepage is not intent on /saved.
 *   6. iOS shows the Share gesture and NO Install button.
 *   7. Chromium: a beforeinstallprompt event is captured, the button appears,
 *      clicking it calls prompt() on the stashed event, and an `accepted`
 *      outcome replaces the card with the confirmation line.
 *   8. Exactly ONE install pitch is visible per page at 390 and 1280, counting
 *      both this card and InstallApp's homepage banner. (The small "Install it
 *      so the checklist survives a closed tab" text link on /checklist is a
 *      context link, not a pitch, and is not counted.)
 *
 * AND THEN THE POST-INSTALL REGISTRATION ASK (section 9), which is the other
 * half of the same decision: install with zero friction, ask afterwards. It has
 * more ways to be wrong than the card does, because it is the only thing on the
 * site that renders for one narrow audience (a reader inside the installed app
 * who has not registered) and must be invisible to everyone else:
 *   9a. Visible in emulated standalone on /, /pt, /es and /checklist, with the
 *       right heading per language.
 *   9b. NOT on /saved (the install card owns that screen; two asks is nagging),
 *       and not on /emergency or a tunnel screen.
 *   9c. NOT in a normal browser tab, on any of its own pages.
 *   9d. NOT when the registration keys are already present, by either key.
 *   9e. Gone for good after a successful submit, with /api/subscribe stubbed.
 *   9f. Never on screen at the same time as the install card. This one is
 *       structural rather than careful (the card returns early WHEN standalone,
 *       the ask returns early UNLESS standalone) and /checklist renders both
 *       into the page, so it is worth proving rather than asserting in prose.
 *
 * Run: node scripts/test-install-nudge.mjs dist
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

const IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 ' +
  '(KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1';

/** Reads the card's runtime state, plus the count of visible install pitches
 *  on the page (this card OR InstallApp's banner). */
const state = (page) => page.evaluate(() => {
  const el = document.getElementById('ingWrap');
  const vis = (e) => !!e && !e.hidden && !!e.getClientRects().length;
  const q = (s) => document.querySelector(s);
  return {
    present: !!el,
    visible: vis(el),
    heading: el ? (el.querySelector('.ing-h') || {}).textContent || '' : '',
    iosVisible: vis(q('#ingIos')),
    btnVisible: vis(q('#ingBtn')),
    doneVisible: vis(q('#ingDone')),
    mainVisible: vis(q('.ing-main')),
    shareGlyphs: el ? el.querySelectorAll('.ing-share svg').length : 0,
    // Both install pitches on the site, counted the same way.
    pitches: [q('#ingWrap'), q('#installWrap')].filter(vis).length,
    // The post-install registration ask.
    piPresent: !!q('#piWrap'),
    piVisible: vis(q('#piWrap')),
    piHead: (q('#piWrap h3') || {}).textContent || '',
    capMsg: (q('#piWrap .cap-msg') || {}).textContent || '',
  };
});

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

/** A tab. `standalone` emulates an installed app; `ios` swaps the UA;
 *  `chromium` fires a synthetic beforeinstallprompt after load. */
async function tab({ ios = false, standalone = null, chromium: chr = false,
  width = 390, height = 844 } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    ...(ios ? { userAgent: IOS_UA } : {}),
  });
  await noServiceWorker(ctx);
  if (standalone === 'display-mode') {
    // matchMedia is patched rather than using Playwright's emulateMedia, which
    // does not support display-mode. The component reads exactly this call.
    await ctx.addInitScript(() => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = (q) =>
        (String(q).indexOf('display-mode: standalone') > -1
          ? { matches: true, media: q, addListener() {}, removeListener() {},
              addEventListener() {}, removeEventListener() {} }
          : real(q));
    });
  }
  if (standalone === 'ios') {
    await ctx.addInitScript(() => {
      Object.defineProperty(window.navigator, 'standalone', { value: true, configurable: true });
    });
  }
  if (chr) {
    // A synthetic event proves the HANDLER PATH: that the component listens,
    // preventDefaults, stashes the event, reveals the button, and calls prompt()
    // on that same object when the button is clicked. Chromium will not fire the
    // real event for a localhost page with no engagement heuristics met, so this
    // is the only way to cover it.
    await ctx.addInitScript(() => {
      window.__smgPrompted = 0;
      window.__smgPrevented = false;
      window.addEventListener('load', function () {
        const e = new Event('beforeinstallprompt');
        const origPrevent = e.preventDefault.bind(e);
        e.preventDefault = function () { window.__smgPrevented = true; origPrevent(); };
        e.prompt = function () { window.__smgPrompted++; };
        e.userChoice = Promise.resolve({ outcome: 'accepted' });
        window.dispatchEvent(e);
      });
    });
  }
  const page = await ctx.newPage();
  return { ctx, page };
}

const PAGES = [
  ['/saved', 'en', 'Keep the rescue on your phone'],
  ['/card', 'en', 'Keep the rescue on your phone'],
  ['/checklist', 'en', 'Keep the rescue on your phone'],
  ['/pt/saved', 'pt', 'Deixe o resgate no seu celular'],
  ['/pt/card', 'pt', 'Deixe o resgate no seu celular'],
  ['/pt/checklist', 'pt', 'Deixe o resgate no seu celular'],
  ['/es/saved', 'es', 'Llévate el rescate en el celular'],
  ['/es/card', 'es', 'Llévate el rescate en el celular'],
  ['/es/checklist', 'es', 'Llévate el rescate en el celular'],
];

// ---------------------------------------------------------------------------
// 1. It is there, visible, and in the right language, on all nine pages.
// ---------------------------------------------------------------------------
{
  const { ctx, page } = await tab();
  for (const [url, lang, head] of PAGES) {
    await page.goto(base + url, { waitUntil: 'load' });
    const s = await state(page);
    ok(`${url}: the card is visible`, s.visible, `${lang}`);
    ok(`${url}: heading is in ${lang}`, s.heading.trim() === head, s.heading.trim().slice(0, 40));
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 2. NOT INSIDE EMERGENCY MODE. Absent from the HTML, not merely hidden: the
//    guard is in the component, so a call site cannot put it here by accident.
// ---------------------------------------------------------------------------
{
  const SILENT = [
    '/emergency', '/pt/emergency', '/es/emergency',
    '/protocol/usb/start', '/protocol/usb/moves', '/protocol/sound/start',
    '/pt/protocol/usb/moves', '/es/protocol/usb/moves',
    '/pt/protocol/frozen/start', '/es/protocol/export/start',
  ];
  const { ctx, page } = await tab();
  for (const url of SILENT) {
    await page.goto(base + url, { waitUntil: 'domcontentloaded' });
    const s = await state(page);
    ok(`${url}: no install pitch anywhere`, s.present === false && s.pitches === 0);
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 3 + 4. Already installed, by either signal.
// ---------------------------------------------------------------------------
for (const [label, opts] of [
  ['display-mode: standalone', { standalone: 'display-mode' }],
  ['navigator.standalone (iOS)', { standalone: 'ios', ios: true }],
]) {
  const { ctx, page } = await tab(opts);
  await page.goto(base + '/saved', { waitUntil: 'load' });
  const s = await state(page);
  ok(`already installed via ${label}: card stays hidden`, s.visible === false && s.present === true);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 5. ONE DISMISSAL ACROSS THIS CARD'S OWN THREE PLACEMENTS, and across a
//    reload, but deliberately NOT across to InstallApp's homepage banner. The
//    card has its own key since 2026-08-05 (Antonio's ruling): a DJ who waved a
//    homepage banner away months ago should still get one chance on the screen
//    where the rescue just worked, because intent there is not the same intent.
// ---------------------------------------------------------------------------
{
  const { ctx, page } = await tab();
  await page.goto(base + '/checklist', { waitUntil: 'load' });
  ok('dismiss: visible on /checklist first', (await state(page)).visible === true);
  await page.click('#ingClose');
  ok('dismiss: hidden immediately', (await state(page)).visible === false);

  await page.reload({ waitUntil: 'load' });
  ok('dismiss: still hidden after a reload', (await state(page)).visible === false);

  await page.goto(base + '/saved', { waitUntil: 'load' });
  ok('dismiss: also silent on /saved', (await state(page)).visible === false);

  await page.goto(base + '/card', { waitUntil: 'load' });
  ok('dismiss: also silent on /card', (await state(page)).visible === false);

  // DIFFERENT KEY, so the homepage banner is NOT collateral damage. Widened
  // first, because that banner is hidden below 640px by its own design and a
  // phone viewport would pass this for the wrong reason.
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.goto(base + '/', { waitUntil: 'load' });
  const home = await state(page);
  ok('dismiss: the homepage banner is NOT silenced by it', home.pitches === 1, `saw ${home.pitches}`);

  // And the reverse: InstallApp's own X must not silence this card.
  await page.click('#installClose');
  await page.evaluate(() => { try { localStorage.removeItem('SMG_NUDGE_DISMISSED'); } catch (e) {} });
  await page.goto(base + '/saved', { waitUntil: 'load' });
  ok('dismiss: the homepage banner\'s X does not silence /saved',
    (await state(page)).visible === true);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 6. iOS: the gesture, and no dead button.
// ---------------------------------------------------------------------------
{
  const { ctx, page } = await tab({ ios: true });
  await page.goto(base + '/saved', { waitUntil: 'load' });
  const s = await state(page);
  const txt = await page.textContent('#ingIos');
  ok('iOS: the card is visible', s.visible);
  ok('iOS: the Share gesture line is shown', s.iosVisible);
  ok('iOS: the gesture names Share and Add to Home Screen',
    /Share/i.test(txt) && /Home Screen/i.test(txt), txt.trim());
  ok('iOS: the Share glyph is an inline SVG', s.shareGlyphs === 1, String(s.shareGlyphs));
  ok('iOS: there is NO Install button', s.btnVisible === false);
  await ctx.close();
}

// pt and es carry their own gesture wording, matching /install in each language.
for (const [url, needle] of [
  ['/pt/saved', 'Adicionar à Tela de Início'],
  ['/es/saved', 'Agregar a inicio'],
]) {
  const { ctx, page } = await tab({ ios: true });
  await page.goto(base + url, { waitUntil: 'load' });
  const txt = (await page.textContent('#ingIos')) || '';
  ok(`iOS ${url}: the gesture is localised`, txt.includes(needle), txt.trim());
  ok(`iOS ${url}: still no Install button`, (await state(page)).btnVisible === false);
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 7. Chromium: the whole beforeinstallprompt path, driven by a synthetic event.
// ---------------------------------------------------------------------------
{
  const { ctx, page } = await tab({ chromium: true });
  await page.goto(base + '/saved', { waitUntil: 'load' });
  // The synthetic event is dispatched from a `load` listener, which can land a
  // tick after goto() resolves. Wait for the effect rather than for a duration.
  await page.waitForSelector('#ingBtn:not([hidden])', { state: 'visible', timeout: 5000 })
    .catch(() => {});
  const before = await state(page);
  const prevented = await page.evaluate(() => window.__smgPrevented);
  ok('Chromium: the event is preventDefaulted', prevented === true);
  ok('Chromium: the Install button appears', before.btnVisible === true);
  ok('Chromium: no iOS gesture line', before.iosVisible === false);

  await page.click('#ingBtn');
  const calls = await page.evaluate(() => window.__smgPrompted);
  ok('Chromium: clicking calls prompt() on the stashed event', calls === 1, String(calls));

  await page.waitForFunction(() => {
    const d = document.getElementById('ingDone');
    return d && !d.hidden;
  }, null, { timeout: 5000 }).catch(() => {});
  const after = await state(page);
  ok('Chromium: an accepted install shows the confirmation', after.doneVisible === true);
  ok('Chromium: and the card itself is replaced, not appended', after.mainVisible === false);
  const doneTxt = (await page.textContent('#ingDone')) || '';
  ok('Chromium: the confirmation is in the page language',
    doneTxt.includes('Installed'), doneTxt.trim());
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 8. EXACTLY ONE INSTALL PITCH PER PAGE, at both widths. InstallApp owns the
//    homepage and is hidden below 640px there by its own design; this card owns
//    the other three pages and never renders on the homepage. They must never
//    both be on screen.
// ---------------------------------------------------------------------------
for (const w of [390, 1280]) {
  const { ctx, page } = await tab({ width: w, height: w === 390 ? 844 : 900 });
  for (const url of ['/', '/saved', '/card', '/checklist',
    '/pt', '/pt/saved', '/pt/card', '/pt/checklist',
    '/es', '/es/saved', '/es/card', '/es/checklist']) {
    await page.goto(base + url, { waitUntil: 'load' });
    const n = (await state(page)).pitches;
    // The homepage banner is desktop-only by design, so "/" legitimately shows
    // zero pitches on a phone: the rotating promo slide carries it there.
    const expected = url === '/' || url === '/pt' || url === '/es' ? (w >= 641 ? 1 : 0) : 1;
    ok(`@${w} ${url}: exactly ${expected} install pitch`, n === expected, `saw ${n}`);
  }
  await ctx.close();
}

// ---------------------------------------------------------------------------
// 9. THE POST-INSTALL REGISTRATION ASK.
// ---------------------------------------------------------------------------

/** A tab that believes it is the installed app. matchMedia is patched rather
 *  than using Playwright's emulateMedia, which has no display-mode support. */
async function appTab({ ios = false, registered = null, width = 390, height = 844 } = {}) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    ...(ios ? { userAgent: IOS_UA } : {}),
  });
  await noServiceWorker(ctx);
  if (ios) {
    await ctx.addInitScript(() => {
      Object.defineProperty(window.navigator, 'standalone', { value: true, configurable: true });
    });
  } else {
    await ctx.addInitScript(() => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = (q) =>
        (String(q).indexOf('display-mode: standalone') > -1
          ? { matches: true, media: q, addListener() {}, removeListener() {},
              addEventListener() {}, removeEventListener() {} }
          : real(q));
    });
  }
  const page = await ctx.newPage();
  if (registered) {
    // Seeded by visiting a page and writing once, not with addInitScript, which
    // re-runs on every navigation and would keep putting state back.
    await page.goto(base + '/offline', { waitUntil: 'domcontentloaded' });
    await page.evaluate((r) => {
      try {
        if (r.unlocked) localStorage.setItem('SMG_UNLOCKED', '1');
        if (r.email) localStorage.setItem('SMG_EMAIL', r.email);
      } catch (e) {}
    }, registered);
  }
  return { ctx, page };
}

// 9a. Visible in the installed app, on its four pages, in the page's language.
{
  const CASES = [
    ['/', 'The rescue is on your phone'],
    ['/checklist', 'The rescue is on your phone'],
    ['/pt', 'O resgate está no seu celular'],
    ['/pt/checklist', 'O resgate está no seu celular'],
    ['/es', 'El rescate ya está en tu celular'],
    ['/es/checklist', 'El rescate ya está en tu celular'],
  ];
  const { ctx, page } = await appTab();
  for (const [url, head] of CASES) {
    await page.goto(base + url, { waitUntil: 'load' });
    const s = await state(page);
    ok(`app ${url}: the post-install ask is visible`, s.piVisible === true);
    ok(`app ${url}: heading is in the page language`, s.piHead.trim() === head, s.piHead.trim().slice(0, 40));
    // 9f, on every page that renders both.
    ok(`app ${url}: the install card is NOT also on screen`, s.visible === false && s.pitches === 0);
  }
  await ctx.close();
}

// 9a again on iOS, where the standalone signal is navigator.standalone instead.
{
  const { ctx, page } = await appTab({ ios: true });
  await page.goto(base + '/', { waitUntil: 'load' });
  ok('app (iOS navigator.standalone): the ask is visible', (await state(page)).piVisible === true);
  await ctx.close();
}

// 9b. Not on /saved, and not inside Emergency Mode. Absent from the HTML, not
//     merely hidden: the guard is in the component.
{
  const { ctx, page } = await appTab();
  for (const url of ['/saved', '/pt/saved', '/es/saved']) {
    await page.goto(base + url, { waitUntil: 'load' });
    const s = await state(page);
    ok(`app ${url}: no registration ask (the install card owns this screen)`, s.piPresent === false);
    ok(`app ${url}: and the install card is silent too, because it is installed`, s.visible === false);
  }
  for (const url of ['/emergency', '/pt/emergency', '/protocol/usb/moves', '/es/protocol/usb/start']) {
    await page.goto(base + url, { waitUntil: 'domcontentloaded' });
    ok(`app ${url}: nothing is ever sold inside Emergency Mode`, (await state(page)).piPresent === false);
  }
  await ctx.close();
}

// 9c. A normal browser tab never sees it, on any of its own pages.
{
  const { ctx, page } = await tab();
  for (const url of ['/', '/checklist', '/pt', '/pt/checklist', '/es', '/es/checklist']) {
    await page.goto(base + url, { waitUntil: 'load' });
    const s = await state(page);
    ok(`browser tab ${url}: the ask stays hidden`, s.piPresent === true && s.piVisible === false);
  }
  await ctx.close();
}

// 9d. Already registered, by either key on its own.
for (const [label, seed] of [
  ['SMG_UNLOCKED', { unlocked: true }],
  ['SMG_EMAIL', { email: 'dj@example.com' }],
  ['both', { unlocked: true, email: 'dj@example.com' }],
]) {
  const { ctx, page } = await appTab({ registered: seed });
  await page.goto(base + '/', { waitUntil: 'load' });
  ok(`app, already registered via ${label}: the ask stays hidden`,
    (await state(page)).piVisible === false);
  await ctx.close();
}

// 9e. A successful submit, with the endpoint stubbed, and it never comes back.
{
  const { ctx, page } = await appTab();
  await page.route('**/api/subscribe', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));
  await page.goto(base + '/', { waitUntil: 'load' });
  ok('app submit: the ask is visible first', (await state(page)).piVisible === true);

  await page.fill('#piWrap input[name="email"]', 'dj@example.com');
  await page.click('#piWrap .cap-form button[type="submit"]');
  await page.waitForFunction(() => {
    const m = document.querySelector('#piWrap .cap-msg');
    return m && m.classList.contains('ok');
  }, null, { timeout: 8000 }).catch(() => {});
  const after = await state(page);
  ok('app submit: it answers in place instead of vanishing mid-message',
    after.piVisible === true && after.capMsg.trim().length > 0, after.capMsg.trim().slice(0, 46));
  const keys = await page.evaluate(() => {
    try { return { u: localStorage.getItem('SMG_UNLOCKED'), e: localStorage.getItem('SMG_EMAIL') }; }
    catch (err) { return {}; }
  });
  ok('app submit: the device is registered', keys.u === '1' && keys.e === 'dj@example.com',
    JSON.stringify(keys));

  await page.reload({ waitUntil: 'load' });
  ok('app submit: gone after a reload', (await state(page)).piVisible === false);
  await page.goto(base + '/checklist', { waitUntil: 'load' });
  ok('app submit: gone on /checklist too', (await state(page)).piVisible === false);
  await ctx.close();
}

// 9e, the dismissal path: its own key, once ever, across both its pages.
{
  const { ctx, page } = await appTab();
  await page.goto(base + '/checklist', { waitUntil: 'load' });
  ok('app dismiss: visible first', (await state(page)).piVisible === true);
  await page.click('#piClose');
  ok('app dismiss: hidden immediately', (await state(page)).piVisible === false);
  await page.reload({ waitUntil: 'load' });
  ok('app dismiss: still hidden after a reload', (await state(page)).piVisible === false);
  await page.goto(base + '/', { waitUntil: 'load' });
  ok('app dismiss: silent on the home page too', (await state(page)).piVisible === false);
  // And it must not have silenced the install card, which is a different ask.
  const nudgeKey = await page.evaluate(() => {
    try { return localStorage.getItem('SMG_NUDGE_DISMISSED'); } catch (e) { return 'err'; }
  });
  ok('app dismiss: it did not write the install card\'s key', nudgeKey === null, String(nudgeKey));
  await ctx.close();
}

await browser.close();
server.close();

console.log('');
if (fails.length) {
  console.error(`Install nudge test FAILED: ${fails.length} failure(s)\n  ${fails.join('\n  ')}`);
  process.exit(1);
}
console.log('Install nudge test PASS');
