/*
 * LOCKED MODE FEEDBACK TEST.
 *
 * WHY THIS EXISTS (2026-08-06). Tapping ADVANCED or CUSTOM on /checklist while
 * signed out appeared to do nothing. Three things were true at once and none of
 * them was visible: the segmented control did not move (correct, the mode did
 * not change), the scroll position did not move, and the reveal happened about
 * 140px further down the page on an account card that never said what had just
 * been asked for. From the top of the page that reads as a dead button, and it
 * is the single most likely way a calm, curious visitor decides the checklist
 * is broken.
 *
 * Nothing here ungates anything. Advanced and Custom stay behind a free
 * account, which is the owner's decision; this pins the FEEDBACK LOOP around
 * that gate: locked is legible before the tap, the card names the list that was
 * asked for, and the page moves to the card.
 *
 * Run: node scripts/test-checklist-gate.mjs dist
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

// The word each language's gate heading must contain for each mode: the point
// of the heading is that it names the list that was tapped, so a heading that
// says the wrong one, or says nothing, is a failure.
const PAGES = [
  { path: '/checklist', advanced: 'Advanced', custom: 'Custom' },
  { path: '/pt/checklist', advanced: 'Avançado', custom: 'Pessoal' },
  { path: '/es/checklist', advanced: 'Avanzado', custom: 'Personal' },
];

// WHICH MODES ARE GATED, AND WHICH ARE DELIBERATELY NOT (Antonio, 2026-08-07).
//
// This loop used to run over ['advanced', 'custom'] and assert both were locked.
// His call moved Advanced out from behind the account: "lets make that only for
// the custom mode." So the list changed, and the test that proved the old
// contract now proves the new one.
//
// GATED and FREE are BOTH asserted, on purpose. A test that only checks the
// locked mode would still pass if Advanced were quietly re-locked tomorrow, and
// re-locking it is the exact regression this change invites: the condition lived
// in twelve places before today, and the padlock was hard-coded into the markup.
// It is one place now (GATED_MODES in each checklist page), so the FREE assertion
// below is what keeps it one place.
const GATED = ['custom'];
const FREE = ['advanced'];

for (const page_ of PAGES) {
  // A free mode must switch on the tap with NO account card, and must not ship a
  // padlock in its first paint. Same fresh-context discipline as the gated loop.
  for (const mode of FREE) {
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.goto(base + page_.path, { waitUntil: 'load' });
    await page.evaluate(() => document.querySelector('#ck')?.remove());
    await page.waitForTimeout(250);

    const shipped = await page.evaluate((m) => {
      const b = document.querySelector(`.mode-btn[data-mode-set="${m}"]`);
      return {
        exists: !!b,
        locked: !!(b && b.classList.contains('is-locked')),
        glyph: !!(b && b.querySelector('.mode-lock')),
      };
    }, mode);
    ok(`${page_.path} ${mode}: exists`, shipped.exists);
    ok(`${page_.path} ${mode}: ships with NO lock class`, shipped.locked === false);
    ok(`${page_.path} ${mode}: ships with NO padlock glyph`, shipped.glyph === false);

    await page.click(`.mode-btn[data-mode-set="${mode}"]`);
    await page.waitForTimeout(250);
    const after = await page.evaluate((m) => {
      const card = document.getElementById('acctCard');
      const b = document.querySelector(`.mode-btn[data-mode-set="${m}"]`);
      return {
        gateShown: !!(card && !card.hidden),
        modeOn: !!(b && b.classList.contains('is-on')),
        listMode: (document.getElementById('list') || {}).dataset?.mode || null,
      };
    }, mode);
    ok(`${page_.path} ${mode}: tapping it does NOT open the account gate`, after.gateShown === false);
    ok(`${page_.path} ${mode}: the mode actually switches on`, after.modeOn === true);
    ok(`${page_.path} ${mode}: the list is in that mode`, after.listMode === mode, String(after.listMode));
    ok(`${page_.path} ${mode}: no page errors`, pageErrors.length === 0, pageErrors.join(' | '));
    await ctx.close();
  }

  for (const mode of GATED) {
    // A fresh context every time: a registered device is not gated, and
    // registration is exactly what a previous run would have left behind.
    const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await ctx.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(e.message));
    await page.goto(base + page_.path, { waitUntil: 'load' });
    await page.evaluate(() => document.querySelector('#ck')?.remove());
    await page.waitForTimeout(250);

    const btn = page.locator(`.mode-btn[data-mode-set="${mode}"]`);

    // BEFORE THE TAP. The lock has to be in the first paint, not applied by a
    // script the visitor may have out-run, so this is asserted before any
    // interaction and on the glyph's rendered box, not on the class.
    const before = await page.evaluate((m) => {
      const b = document.querySelector(`.mode-btn[data-mode-set="${m}"]`);
      const basic = document.querySelector('.mode-btn[data-mode-set="basic"]');
      const glyph = b && b.querySelector('.mode-lock');
      const gb = glyph && glyph.getBoundingClientRect();
      const card = document.getElementById('acctCard');
      return {
        locked: !!(b && b.classList.contains('is-locked')),
        // An SVG element has no offsetParent (that is an HTMLElement API), so
        // visibility is measured from its box: display:none gives a 0x0 rect.
        glyphVisible: !!(gb && gb.width > 0 && gb.height > 0),
        glyphSize: gb ? `${Math.round(gb.width)}x${Math.round(gb.height)}` : 'none',
        // The unlocked segment must NOT wear one, or the mark means nothing.
        basicHasGlyph: !!(basic && basic.querySelector('.mode-lock')
          && basic.querySelector('.mode-lock').getBoundingClientRect().width > 0),
        srText: b && b.querySelector('.mode-lock-sr') ? (b.querySelector('.mode-lock-sr').textContent || '').trim() : '',
        cardHidden: !!(card && card.offsetParent === null),
        scrollY: window.scrollY,
      };
    }, mode);
    ok(`${page_.path} ${mode}: the locked state is visible before any tap`,
      before.locked && before.glyphVisible, `lock glyph ${before.glyphSize}`);
    ok(`${page_.path} ${mode}: the unlocked segment carries no lock`, !before.basicHasGlyph);
    ok(`${page_.path} ${mode}: the lock is announced, not just drawn`, before.srText.length > 0,
      JSON.stringify(before.srText.slice(0, 40)));
    ok(`${page_.path} ${mode}: the gate card starts out of sight`, before.cardHidden);

    await btn.click();
    // Long enough for a smooth scroll to land.
    await page.waitForTimeout(900);

    const after = await page.evaluate(() => {
      const card = document.getElementById('acctCard');
      const h = document.getElementById('acctGateH');
      const r = card ? card.getBoundingClientRect() : null;
      return {
        cardVisible: !!card && card.offsetParent !== null && r.height > 0,
        heading: h && h.offsetParent !== null ? (h.textContent || '').trim() : '',
        // In view means IN VIEW, not merely present in the document.
        inViewport: !!r && r.top < window.innerHeight && r.bottom > 0,
        scrollY: window.scrollY,
        // The gate must not have quietly let the mode through.
        mode: document.getElementById('list')?.getAttribute('data-mode'),
        pressed: Array.from(document.querySelectorAll('.mode-btn')).map((b) => b.getAttribute('aria-pressed')).join(','),
      };
    });
    ok(`${page_.path} ${mode}: the tap reveals the gate card`, after.cardVisible);
    ok(`${page_.path} ${mode}: the card names the list that was asked for`,
      after.heading.includes(page_[mode]), JSON.stringify(after.heading.slice(0, 60)));
    ok(`${page_.path} ${mode}: the card is scrolled into view`, after.inViewport,
      `scrollY ${before.scrollY} -> ${after.scrollY}`);
    ok(`${page_.path} ${mode}: still gated, the mode did not change`,
      after.mode === 'basic' && after.pressed === 'true,false,false', `${after.mode} / ${after.pressed}`);
    ok(`${page_.path} ${mode}: no uncaught page errors`, pageErrors.length === 0,
      pageErrors.join(' | ').slice(0, 160));
    await ctx.close();
  }

  /* Opened from the Sync chip the card explains itself, so a heading left over
     from an earlier locked tap must not mislabel it. */
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  await page.goto(base + page_.path, { waitUntil: 'load' });
  await page.evaluate(() => document.querySelector('#ck')?.remove());
  await page.waitForTimeout(250);
  await page.click('.mode-btn[data-mode-set="advanced"]');
  await page.waitForTimeout(500);
  await page.click('#acctLine'); // closes
  await page.waitForTimeout(200);
  await page.click('#acctLine'); // reopens, from the chip this time
  await page.waitForTimeout(300);
  const chipOpen = await page.evaluate(() => {
    const h = document.getElementById('acctGateH');
    return { heading: h && h.offsetParent !== null ? (h.textContent || '').trim() : '' };
  });
  ok(`${page_.path}: the Sync chip opens an unlabelled card, as before`, chipOpen.heading === '',
    JSON.stringify(chipOpen.heading.slice(0, 40)));
  await ctx.close();
}

/* A registered device must see no locks at all. */
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  await ctx.addInitScript(() => {
    try {
      localStorage.setItem('SMG_UNLOCKED', '1');
      localStorage.setItem('SMG_EMAIL', 'gate-check@savemygig.test');
    } catch (e) {}
  });
  const page = await ctx.newPage();
  await page.goto(base + '/checklist', { waitUntil: 'load' });
  await page.waitForTimeout(400);
  const reg = await page.evaluate(() => ({
    locked: document.querySelectorAll('.mode-btn.is-locked').length,
    glyphs: Array.from(document.querySelectorAll('.mode-lock')).filter((g) => g.getBoundingClientRect().width > 0).length,
  }));
  ok('/checklist: a registered device sees no locks', reg.locked === 0 && reg.glyphs === 0,
    `${reg.locked} locked, ${reg.glyphs} glyphs drawn`);
  await ctx.close();
}

await browser.close();
server.close();
if (fails.length) { console.log(`\nCHECKLIST GATE TEST FAIL: ${fails.length}`); process.exit(1); }
console.log('\nChecklist gate test PASS');
