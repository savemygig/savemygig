/*
 * Round 11.5 verification: icon sizing (desktop info + search), group
 * reorder (Base: Personal Kit last; Advanced: Technical right after Gear),
 * the backup disclaimer banner, and the Lists toolbar redesign (Default
 * name + migration, New/Move/Delete as three separate modes, real rename,
 * mobile compact icons + horizontal-scroll pill row).
 * Run: node scripts/test-round11.5.mjs dist
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const dir = process.argv[2] || 'dist';
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png',
  '.webp': 'image/webp', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
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
let fails = 0;
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
  if (!cond) fails++;
};

// ---- DESKTOP: icon sizing + group order (Base + Advanced) ----
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.goto(base + '/checklist', { waitUntil: 'networkidle' });
  // Advanced/Custom are gated behind device-unlock (Antonio's ruling 3):
  // clicking them locked opens the Sync card instead of switching mode.
  // isUnlocked() reads localStorage live at click time, so no reload needed.
  await page.evaluate(() => { document.getElementById('ck')?.remove(); localStorage.setItem('SMG_UNLOCKED', '1'); });
  await page.waitForTimeout(200);

  const searchSvg = await page.evaluate(() => {
    const s = document.querySelector('.nav-search-btn svg');
    const r = s.getBoundingClientRect();
    return { w: Math.round(r.width * 100) / 100, h: Math.round(r.height * 100) / 100 };
  });
  ok('search icon is 15% bigger on desktop (17.25px)', Math.abs(searchSvg.w - 17.25) < 0.5, JSON.stringify(searchSvg));

  const infoFont = await page.evaluate(() => {
    const b = document.getElementById('explainInfoBtn');
    return b ? getComputedStyle(b).fontSize : null;
  });
  // 0.99rem at a 16px root = 15.84px.
  ok('desktop (i) glyph is 10% bigger (~15.84px)', infoFont && Math.abs(parseFloat(infoFont) - 15.84) < 0.6, infoFont);

  const baseOrder = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.task-group')).filter((g) => !g.hidden).map((g) => g.getAttribute('data-group')));
  ok('Base order: music, gear, logistics, personal', JSON.stringify(baseOrder) === JSON.stringify(['music', 'gear', 'logistics', 'personal']), JSON.stringify(baseOrder));

  await page.click('[data-mode-set="advanced"]');
  await page.waitForTimeout(200);
  const advOrder = await page.evaluate(() =>
    Array.from(document.querySelectorAll('.task-group')).filter((g) => !g.hidden).map((g) => g.getAttribute('data-group')));
  ok('Advanced order: technical right after gear', JSON.stringify(advOrder) === JSON.stringify(['music', 'backups', 'gear', 'technical', 'logistics', 'personal', 'recovery']), JSON.stringify(advOrder));

  ok('backup-note banner visible', await page.locator('.backup-note').isVisible());
  const bnText = await page.locator('.backup-note').textContent();
  ok('banner mentions backup responsibility', /responsibility|on you/i.test(bnText || ''), bnText.trim().slice(0, 60));

  ok('zero page errors (desktop)', errors.length === 0, errors.join(' | '));
  await page.close();
}

// ---- Legal disclaimer page: new section present ----
{
  const page = await browser.newPage();
  await page.goto(base + '/legal/disclaimer', { waitUntil: 'networkidle' });
  const text = await page.locator('main').textContent();
  ok('disclaimer page mentions Monday to Tuesday maintenance window', /Monday to Tuesday/i.test(text || ''));
  ok('disclaimer page states backup responsibility', /Download your list, keep a printed copy/i.test(text || ''));
  await page.close();
}

// ---- Lists toolbar: Default name/migration, New/Move/Delete, real rename ----
// The named-list switcher only renders once signed in (renderPills() bails
// on !acct.email), so /api/auth/me and /api/sync are mocked -- same pattern
// as the round-9 explainer/account tests -- rather than standing up
// wrangler + D1 for what is otherwise a pure front-end check.
{
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  await page.route('**/api/auth/me', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, email: 'round11-5@djtest.com', artist: 'DJ Round Eleven', google: null }),
  }));
  await page.route('**/api/sync', (route) => {
    if (route.request().method() === 'PUT') return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, lists: [] }) });
  });

  // Fresh visitor: registry doesn't exist yet, default should already read "Default".
  await page.goto(base + '/checklist', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.getElementById('ck')?.remove());
  await page.waitForTimeout(500); // initAccount()'s fetch + markSignedIn/syncNow
  await page.click('[data-mode-set="custom"]');
  await page.waitForTimeout(300);
  await page.click('#lsHead');
  await page.waitForTimeout(200);
  let pillName = await page.locator('.ls-pill .ls-name').first().textContent();
  ok('fresh visitor default list is named "Default"', (pillName || '').trim() === 'Default', pillName);

  // Migration: seed the OLD name directly and reload.
  await page.evaluate(() => {
    localStorage.setItem('SMG_LISTS_V1', JSON.stringify({ active: 'main', lists: [{ id: 'main', n: 'My checklist', u: 0 }] }));
  });
  await page.reload({ waitUntil: 'networkidle' });
  await page.evaluate(() => document.getElementById('ck')?.remove());
  await page.waitForTimeout(500);
  await page.click('[data-mode-set="custom"]');
  await page.waitForTimeout(300);
  await page.click('#lsHead');
  await page.waitForTimeout(200);
  pillName = await page.locator('.ls-pill .ls-name').first().textContent();
  ok('"My checklist" migrates to "Default" on load', (pillName || '').trim() === 'Default', pillName);
  const migratedStore = await page.evaluate(() => JSON.parse(localStorage.getItem('SMG_LISTS_V1')).lists[0].n);
  ok('migration persists to storage (not just in-memory)', migratedStore === 'Default', migratedStore);

  // Toolbar: three separate icon buttons now exist.
  ok('New button exists', await page.locator('#lsNewBtn').isVisible());
  ok('Move button exists (separate from Delete)', await page.locator('#lsMoveBtn').isVisible());
  ok('Delete button exists', await page.locator('#lsDelBtn').isVisible());
  // Icon-only on mobile: the word label must not actually be visible (display:none, hover:none viewport).
  const moveLabelVisible = await page.locator('#lsMoveBtn .ls-btn-label').isVisible();
  ok('word labels hidden on mobile (icon-only)', !moveLabelVisible);

  // Create a second list so Move/Delete have something to act on.
  await page.click('#lsNewBtn');
  await page.fill('#lsNewName', 'Warehouse Set');
  await page.click('#lsNewForm .add-btn');
  await page.waitForLoadState('networkidle');
  await page.evaluate(() => document.getElementById('ck')?.remove());
  await page.waitForTimeout(300);
  if (await page.locator('#lsBody').isHidden()) { await page.click('#lsHead'); await page.waitForTimeout(200); }
  ok('two pills after create', (await page.locator('.ls-pill').count()) === 2);

  // Move mode: reveals drag handle + pencil, NOT the delete x. Delete mode
  // is the reverse. They must be mutually exclusive.
  await page.click('#lsMoveBtn');
  await page.waitForTimeout(150);
  ok('Move mode ON: pencil visible', await page.locator('.ls-pencil').first().isVisible());
  ok('Move mode ON: drag handle visible', await page.locator('.ls-drag').first().isVisible());
  ok('Move mode ON: delete x NOT visible', await page.locator('.ls-x').first().isHidden());
  ok('Delete button not also active', !(await page.locator('#lsDelBtn').evaluate((el) => el.classList.contains('active'))));

  // Real rename via the pencil on the (non-active) second pill.
  const secondPill = page.locator('.ls-pill:not(.is-on)');
  await secondPill.locator('.ls-pencil').click();
  await page.waitForTimeout(150);
  const editInput = secondPill.locator('.ls-name-edit');
  ok('rename input appears', await editInput.isVisible());
  await editInput.fill('Warehouse Set 2');
  await editInput.press('Enter');
  await page.waitForTimeout(200);
  const names = await page.locator('.ls-pill .ls-name').allTextContents();
  ok('list actually renamed', names.includes('Warehouse Set 2'), JSON.stringify(names));

  // Switching Delete on turns Move off (mutual exclusivity), and reveals x not pencil.
  await page.click('#lsDelBtn');
  await page.waitForTimeout(150);
  ok('Delete mode ON turns Move OFF', !(await page.locator('#lsMoveBtn').evaluate((el) => el.classList.contains('active'))));
  ok('Delete mode: x visible on other pill', await page.locator('.ls-pill:not(.is-on) .ls-x').isVisible());
  ok('Delete mode: pencil hidden again', await page.locator('.ls-pencil').first().isHidden());

  // Horizontal-scroll row on mobile (CSS check, not just class presence).
  const pillsOverflow = await page.evaluate(() => getComputedStyle(document.getElementById('lsPills')).overflowX);
  ok('pills row scrolls horizontally on mobile', pillsOverflow === 'auto', pillsOverflow);

  ok('zero page errors (mobile lists flow)', errors.length === 0, errors.join(' | '));
  await page.close();
}

await browser.close();
server.close();
console.log(fails ? `\n${fails} FAILURES` : '\nALL PASS');
process.exit(fails ? 1 : 0);
