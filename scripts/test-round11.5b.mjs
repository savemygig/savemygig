/*
 * Round-11.5 follow-up verification: chevron direction fix, New/pill info-mode
 * coverage, Move->Manage rename, vertical rhythm spacing unification.
 * Run: node scripts/test-round11.5b.mjs http://localhost:8788
 */
import { createRequire } from 'node:module';
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const DIST = path.resolve('dist');
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  let filePath = path.join(DIST, p);
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    const alt = filePath + '.html';
    if (fs.existsSync(alt)) filePath = alt;
    else if (fs.existsSync(path.join(filePath, 'index.html'))) filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) { res.writeHead(404); res.end('not found'); return; }
  const ext = path.extname(filePath);
  const type = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json' }[ext] || 'application/octet-stream';
  res.writeHead(200, { 'Content-Type': type });
  fs.createReadStream(filePath).pipe(res);
});
await new Promise((r) => server.listen(8799, r));
const base = 'http://localhost:8799';

let fails = 0;
const ok = (c, n) => { console.log((c ? 'PASS' : 'FAIL') + '  ' + n); if (!c) fails++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 1280, height: 1000 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.route('**/api/auth/me', (route) => route.fulfill({
  status: 200, contentType: 'application/json',
  body: JSON.stringify({ ok: true, email: 'antonio@example.com', artist: 'Antonio', google: null }),
}));
await page.route('**/api/sync', (route) => {
  if (route.request().method() === 'GET') {
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, lists: [] }) });
  }
  return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
});

await page.goto(base + '/checklist', { waitUntil: 'networkidle' });
await page.evaluate(() => document.getElementById('ck')?.remove());
await page.waitForTimeout(300);

// Switch to Custom so the Lists switcher renders.
await page.click('[data-mode-set="custom"]');
await page.waitForTimeout(200);

// ---- 1. Chevron direction ----
const lsHead = page.locator('#lsHead');
const closedRot = await page.locator('#lsHead .ls-chev').evaluate((el) => getComputedStyle(el).transform);
const closedExpanded = await lsHead.getAttribute('aria-expanded');
ok(closedExpanded === 'false', 'Lists header starts collapsed (aria-expanded=false)');
// rotate(-45deg) matrix: a=cos(-45)=0.707, b=sin(-45)=-0.707
const isRightPointing = (m) => { const n = m.match(/matrix\(([^)]+)\)/); if (!n) return false; const v = n[1].split(',').map(Number); return Math.abs(v[1] + 0.7071) < 0.05; };
const isDownPointing = (m) => { const n = m.match(/matrix\(([^)]+)\)/); if (!n) return false; const v = n[1].split(',').map(Number); return Math.abs(v[1] - 0.7071) < 0.05; };
ok(isRightPointing(closedRot), 'Lists chevron points RIGHT while collapsed: ' + closedRot);

await lsHead.click();
await page.waitForTimeout(200);
const openRot = await page.locator('#lsHead .ls-chev').evaluate((el) => getComputedStyle(el).transform);
const openExpanded = await lsHead.getAttribute('aria-expanded');
ok(openExpanded === 'true', 'Lists header now expanded (aria-expanded=true)');
ok(isDownPointing(openRot), 'Lists chevron points DOWN while expanded: ' + openRot);

// Category group chevron unaffected by the .ls-chev fix (different class,
// untouched by this round) -- sanity-check it still matches its own
// collapsed/expanded state rather than assuming which one Custom mode
// starts in.
const musicGroupCollapsed = await page.locator('.task-group[data-group="music"]').evaluate((el) => el.classList.contains('collapsed'));
const musicChev = await page.locator('.task-group[data-group="music"] .chev').evaluate((el) => getComputedStyle(el).transform);
ok(musicGroupCollapsed ? isRightPointing(musicChev) : isDownPointing(musicChev), `Category chevron (Music, ${musicGroupCollapsed ? 'collapsed' : 'expanded'}) matches its own state: ` + musicChev);

// Sync chip chevron unaffected by this change (already correct since round 3).
const syncClosedRot = await page.locator('#acctLine .ls-chev').evaluate((el) => getComputedStyle(el).transform);
ok(isRightPointing(syncClosedRot), 'Sync chip chevron unaffected, still right when closed: ' + syncClosedRot);

// ---- 2. New/Move/Delete toolbar: rename + explainer coverage ----
const moveLabel = await page.locator('#lsMoveBtn .ls-btn-label').textContent();
ok(moveLabel.trim() === 'Manage', 'Move button relabeled to "Manage": ' + moveLabel);
const moveAria = await page.locator('#lsMoveBtn').getAttribute('aria-label');
ok(/manage/i.test(moveAria || ''), 'Move button aria-label updated: ' + moveAria);

// Toggle Manage mode on, confirm label swaps to Done and back.
await page.click('#lsMoveBtn');
await page.waitForTimeout(150);
const doneLabel = await page.locator('#lsMoveBtn .ls-btn-label').textContent();
ok(doneLabel.trim() === 'Done', 'Manage button shows "Done" while active: ' + doneLabel);
await page.click('#lsMoveBtn');
await page.waitForTimeout(150);
const backLabel = await page.locator('#lsMoveBtn .ls-btn-label').textContent();
ok(backLabel.trim() === 'Manage', 'Manage button reverts to "Manage" label: ' + backLabel);

// Desktop hover-a-beat: New button now has an explainer.
await page.hover('#lsNewBtn');
await page.waitForTimeout(1300);
const newExplainText = await page.locator('.explain-pop').textContent().catch(() => null);
ok(/creates a new list/i.test(newExplainText || ''), 'New button explainer shown on hover: ' + newExplainText);
await page.mouse.move(50, 50);
await page.waitForTimeout(250);

// Desktop info (i) toggle lights up New + a pill together with everything else.
await page.click('#explainInfoBtn');
await page.waitForTimeout(150);
const newLit = await page.locator('#lsNewBtn').evaluate((el) => el.classList.contains('info-lit'));
ok(newLit, 'New button is lit (amber) when info mode is clicked on');
const pillLit = await page.locator('.ls-pill').first().evaluate((el) => el.classList.contains('info-lit'));
ok(pillLit, 'A list pill is lit (amber) when info mode is clicked on');
await page.mouse.move(300, 50);
await page.waitForTimeout(250);
const newLitAfter = await page.locator('#lsNewBtn').evaluate((el) => el.classList.contains('info-lit'));
ok(!newLitAfter, 'New button reverts (un-lit) after mouseleave off the ⓘ button');

// ---- 3. Vertical rhythm: mode-row / readiness / list-switch / custom-toolbar / task-groups all equal ----
const rect = (sel) => page.locator(sel).first().evaluate((el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
const modeRowR = await rect('.mode-row');
const readinessR = await rect('.readiness');
const listSwitchR = await rect('#listSwitch');
const customToolbarR = await rect('#customToolbar');
const groups = await page.locator('.task-group').all();
const g0 = await groups[0].evaluate((el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
const g1 = await groups[1].evaluate((el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });

const gapModeToReadiness = readinessR.top - modeRowR.bottom;
const gapReadinessToList = listSwitchR.top - readinessR.bottom;
const gapListToToolbar = customToolbarR.top - listSwitchR.bottom;
const gapToolbarToGroup = g0.top - customToolbarR.bottom;
const gapGroupToGroup = g1.top - g0.bottom;

const near = (a, b, tol = 2) => Math.abs(a - b) <= tol;
console.log(`gaps(px): mode->readiness=${gapModeToReadiness.toFixed(1)} readiness->list=${gapReadinessToList.toFixed(1)} list->toolbar=${gapListToToolbar.toFixed(1)} toolbar->group=${gapToolbarToGroup.toFixed(1)} group->group=${gapGroupToGroup.toFixed(1)}`);
ok(near(gapModeToReadiness, gapReadinessToList), 'mode-row->readiness gap matches readiness->list-switch gap');
ok(near(gapReadinessToList, gapListToToolbar), 'readiness->list-switch gap matches list-switch->toolbar gap');
ok(near(gapListToToolbar, gapToolbarToGroup), 'list-switch->toolbar gap matches toolbar->first group gap');
ok(near(gapToolbarToGroup, gapGroupToGroup), 'toolbar->group gap matches group->group gap');
ok(near(gapModeToReadiness, 25.6, 3), 'the unified gap is ~1.6rem (25.6px): ' + gapModeToReadiness.toFixed(1));

// ---- iOS auto-zoom fix: every visible text input must compute >= 16px ----
const lsNewFontSize = await page.evaluate(() => {
  const btn = document.getElementById('lsNewBtn');
  btn.click();
  const el = document.getElementById('lsNewName');
  const size = parseFloat(getComputedStyle(el).fontSize);
  return size;
});
ok(lsNewFontSize >= 16, `new-list name input computes >= 16px font-size (was 0.85rem/~14.5px): ${lsNewFontSize}px`);

// #lsHead is now an explain target too.
await page.hover('#lsHead');
await page.waitForTimeout(1300);
const lsHeadExplain = await page.locator('.explain-pop').textContent().catch(() => null);
ok(/create a new list/i.test(lsHeadExplain || ''), 'Lists header (#lsHead) has an explainer: ' + lsHeadExplain);
await page.mouse.move(50, 50);
await page.waitForTimeout(250);

ok(errors.length === 0, 'zero page errors (desktop)' + (errors.length ? ': ' + errors.join(' | ') : ''));
await ctx.close();

// ---- 4. Mobile: Delete-mode sub-controls survive info mode being on ----
{
  const mctx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const mpage = await mctx.newPage();
  const merrors = [];
  mpage.on('pageerror', (e) => merrors.push(String(e)));
  await mpage.route('**/api/auth/me', (route) => route.fulfill({
    status: 200, contentType: 'application/json',
    body: JSON.stringify({ ok: true, email: 'antonio@example.com', artist: 'Antonio', google: null }),
  }));
  await mpage.route('**/api/sync', (route) => {
    if (route.request().method() === 'GET') {
      return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, lists: [{ id: 'main', n: 'Default', u: Date.now() }, { id: 'l2', n: 'Warung', u: Date.now() }] }) });
    }
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await mpage.goto(base + '/checklist', { waitUntil: 'networkidle' });
  await mpage.evaluate(() => document.getElementById('ck')?.remove());
  await mpage.waitForTimeout(300);
  await mpage.click('[data-mode-set="custom"]');
  await mpage.waitForTimeout(300);
  await mpage.click('#lsHead');
  await mpage.waitForTimeout(200);

  // Arm Delete mode first (normal tap, info mode still off).
  await mpage.click('#lsDelBtn');
  await mpage.waitForTimeout(150);
  const deleteActive = await mpage.locator('#lsDelBtn').evaluate((el) => el.classList.contains('active'));
  ok(deleteActive, 'mobile: Delete mode arms normally with info mode off');

  // Now turn info mode ON via the touch toggle.
  await mpage.click('#explainInfoBtn');
  await mpage.waitForTimeout(150);
  const infoOn = await mpage.locator('#explainInfoBtn').getAttribute('aria-pressed');
  ok(infoOn === 'true', 'mobile: info mode toggled on');

  // Tap the × on a non-active pill: must arm it (not swallowed into a "tap to switch" explainer).
  const xBtn = mpage.locator('.ls-pill:not(.is-on) .ls-x').first();
  await xBtn.click();
  await mpage.waitForTimeout(150);
  const armed = await xBtn.evaluate((el) => el.classList.contains('armed'));
  const popCountAfterX = await mpage.locator('.explain-pop').count();
  ok(armed, 'mobile: tapping × while info mode is ALSO on still arms delete (not swallowed)');
  ok(popCountAfterX === 0, 'mobile: no explainer popped from tapping ×');

  // Tapping the plain pill body (not ×) while info mode is on DOES show its explainer.
  await mpage.click('#explainInfoBtn'); // reset info mode off first to clear any open popup state cleanly
  await mpage.waitForTimeout(150);
  await mpage.click('#lsDelBtn'); // turn delete mode off too
  await mpage.waitForTimeout(150);
  await mpage.click('#explainInfoBtn'); // info mode on again, delete mode off
  await mpage.waitForTimeout(150);
  const pill = mpage.locator('.ls-pill:not(.is-on)').first();
  await pill.click();
  await mpage.waitForTimeout(150);
  const pillPopText = await mpage.locator('.explain-pop').textContent().catch(() => null);
  ok(/tap to switch/i.test(pillPopText || ''), 'mobile: tapping a plain pill while info mode is on shows its explainer: ' + pillPopText);

  // Delete-mode × badge is now bigger and visible (Maya's real-tester report).
  // Info mode is still ON from the previous check -- turn it off first, or
  // these taps get swallowed into explainers instead of toggling anything.
  const infoStillOn = await mpage.locator('#explainInfoBtn').getAttribute('aria-pressed');
  if (infoStillOn === 'true') { await mpage.click('#explainInfoBtn'); await mpage.waitForTimeout(150); }
  await mpage.click('#lsDelBtn');
  await mpage.waitForTimeout(150);
  const xSize = await mpage.locator('.ls-x').first().evaluate((el) => { const r = el.getBoundingClientRect(); return { w: r.width, h: r.height }; });
  ok(xSize.w >= 24 && xSize.h >= 24, `delete × badge is at least 24x24 (was 17x17): ${xSize.w}x${xSize.h}`);
  await mpage.click('#lsDelBtn'); // off again before the Move-mode check below
  await mpage.waitForTimeout(150);

  // Rename pencil input also must be >= 16px.
  await mpage.click('#lsMoveBtn');
  await mpage.waitForTimeout(150);
  const pencilFontSize = await mpage.evaluate(() => {
    const pencil = document.querySelector('.ls-pencil');
    pencil.click();
    const input = document.querySelector('.ls-name-edit');
    return input ? parseFloat(getComputedStyle(input).fontSize) : null;
  });
  ok(pencilFontSize >= 16, `list-rename input computes >= 16px font-size (was 0.82rem/~13.9px): ${pencilFontSize}px`);

  // No page-level horizontal overflow after all this interaction (sanity,
  // matches the global.css overflow-x:hidden fix).
  const overflowInfo = await mpage.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, innerWidth: window.innerWidth }));
  ok(overflowInfo.scrollWidth <= overflowInfo.innerWidth, `no page-level horizontal overflow after interaction: scrollWidth=${overflowInfo.scrollWidth} innerWidth=${overflowInfo.innerWidth}`);

  ok(merrors.length === 0, 'zero page errors (mobile)' + (merrors.length ? ': ' + merrors.join(' | ') : ''));
  await mctx.close();
}

// ---- .acct-form input (name/email fields in the Sync card) font-size ----
{
  const actx = await browser.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  const apage = await actx.newPage();
  await apage.route('**/api/auth/me', (route) => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: false }) }));
  await apage.goto(base + '/checklist', { waitUntil: 'networkidle' });
  await apage.evaluate(() => document.getElementById('ck')?.remove());
  await apage.waitForTimeout(300);
  await apage.click('#acctLine');
  await apage.waitForTimeout(200);
  const acctFontSize = await apage.evaluate(() => {
    const el = document.querySelector('.acct-form input[name="email"], #acctCard input[type="email"]');
    return el ? parseFloat(getComputedStyle(el).fontSize) : null;
  });
  ok(acctFontSize !== null && acctFontSize >= 16, `Sync-card email input computes >= 16px font-size (was 0.9rem/~15.3px): ${acctFontSize}px`);
  await actx.close();
}

await browser.close();
server.close();
console.log(fails ? `\n${fails} FAILURES` : '\nALL PASS');
process.exit(fails ? 1 : 0);
