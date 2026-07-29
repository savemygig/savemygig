/*
 * One-off UI test for the accounts/sync build, run against `wrangler pages
 * dev` (real functions + local D1) rather than the gate's static server.
 * Walks the whole story: signed-out row -> magic link -> signed in ->
 * unlocked -> Custom -> create Festival list -> tick -> push -> switch back.
 * Run: node scripts/ui-test-accounts.mjs http://127.0.0.1:8788 <link-token>
 */
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const base = process.argv[2] || 'http://127.0.0.1:8788';
const token = process.argv[3] || 'uitesttoken9';
let failures = 0;
const ok = (cond, name) => {
  console.log((cond ? 'PASS' : 'FAIL') + '  ' + name);
  if (!cond) failures++;
};

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

// 1. Signed out.
await page.goto(base + '/checklist', { waitUntil: 'networkidle' });
// The consent card intercepts clicks in tests: remove it first (gate rule).
await page.evaluate(() => document.getElementById('ck')?.remove());
ok(await page.locator('#acctLine').isVisible(), 'account row visible');
ok((await page.locator('#acctText').textContent()).includes('Sync is off'), 'signed-out text');
ok(await page.locator('#listSwitch').isHidden(), 'switcher hidden signed out');
await page.click('#acctLine');
ok(await page.locator('#acctCard').isVisible(), 'card opens');
ok(await page.locator('#acctForm input').isVisible(), 'email field present');

// 2. Magic link.
await page.goto(base + '/api/auth/link?t=' + token, { waitUntil: 'networkidle' });
ok(page.url().includes('/checklist'), 'link lands on checklist, url=' + page.url());
await page.evaluate(() => document.getElementById('ck')?.remove());
await page.waitForTimeout(1200); // initAccount fetch
const text = await page.locator('#acctText').textContent();
ok(text.includes('Synced as antonio.uitest@djtest.com'), 'signed-in row text: ' + text.trim());
const unlocked = await page.evaluate(() => localStorage.getItem('SMG_UNLOCKED'));
ok(unlocked === '1', 'sign-in registered the device (ruling 3)');

// 3. Custom mode + switcher.
await page.click('[data-mode-set="custom"]');
await page.waitForTimeout(300);
ok(await page.locator('#listSwitch').isVisible(), 'switcher visible in Custom signed in');
ok(await page.locator('#lsBody').isHidden(), 'lists region starts folded (harmonica)');
const headName = await page.locator('#lsActiveName').textContent();
ok(headName === 'My checklist', 'folded header names the active list: ' + headName);
await page.click('#lsHead');
await page.waitForTimeout(200);
ok((await page.locator('.ls-pill').count()) === 1, 'one pill (My checklist)');
await page.click('[data-mode-set="basic"]');
await page.waitForTimeout(200);
ok(await page.locator('#listSwitch').isHidden(), 'switcher hidden in Base (ruling 4)');
await page.click('[data-mode-set="custom"]');
await page.waitForTimeout(200);

// 3.5 Give MAIN some content first (a pristine list deliberately never
// pushes, so it can never clobber another device's list; content = it syncs).
await page.evaluate(() => {
  const g = document.querySelector('.task-group[data-group="music"]');
  if (g) g.classList.remove('collapsed');
  const i = document.querySelector('input[data-key="format"]');
  if (i && !i.checked) i.click();
});
await page.waitForTimeout(3200);

// 4. Create Festival (ensure the region is unfolded first).
if (await page.locator('#lsBody').isHidden()) { await page.click('#lsHead'); await page.waitForTimeout(200); }
await page.click('#lsNewBtn');
await page.fill('#lsNewName', 'Festival');
await page.click('#lsNewForm .add-btn');
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.getElementById('ck')?.remove());
await page.waitForTimeout(1200);
if (await page.locator('#lsBody').isHidden()) { await page.click('#lsHead'); await page.waitForTimeout(200); }
const pills = await page.locator('.ls-pill').allTextContents();
ok(pills.length === 2, 'two pills after create: ' + JSON.stringify(pills));
const active = await page.locator('.ls-pill.is-on .ls-name').textContent();
ok(active === 'Festival', 'Festival is active');
ok((await page.locator('#lsActiveName').textContent()) === 'Festival', 'header follows the active list');
const activeMode = await page.evaluate(() => localStorage.getItem('SMG_CHECKLIST_MODE'));
ok(activeMode === 'custom', 'still in custom after reload, mode=' + activeMode);

// 5. Tick something on Festival, wait for the debounced push.
await page.evaluate(() => {
  const g = document.querySelector('.task-group[data-group="music"]');
  if (g) g.classList.remove('collapsed');
});
// The styled .box span overlays the native input; real users hit the label,
// tests go straight to the input like the drag test does.
await page.evaluate(() => {
  const i = document.querySelector('input[data-key="usb-two"]');
  if (i && !i.checked) i.click();
});
await page.waitForTimeout(3500);

// 6. Server state: two lists, Festival has the tick.
const server = await page.evaluate(async () => (await (await fetch('/api/sync')).json()));
ok(server.ok && server.lists.length === 2, 'server has 2 lists');
const fest = server.lists.find((l) => l.name === 'Festival');
ok(fest && JSON.parse(fest.blob).ticks['usb-two'] === true, 'Festival tick reached the server');
const main = server.lists.find((l) => l.id === 'main');
ok(!!main, 'main list reached the server too');

// 7. Switch back to main via pill (region folded again after the tick wait? no reload happened, still open from step 4's create->reload... unfold defensively).
if (await page.locator('#lsBody').isHidden()) { await page.click('#lsHead'); await page.waitForTimeout(200); }
await page.click('.ls-pill:not(.is-on)');
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.getElementById('ck')?.remove());
await page.waitForTimeout(800);
const active2 = await page.locator('.ls-pill.is-on .ls-name').textContent();
ok(active2 === 'My checklist', 'switched back to My checklist');
const mainTicks = await page.evaluate(() => JSON.parse(localStorage.getItem('SMG_CHECKLIST_V1') || '{}'));
ok(!mainTicks['usb-two'] && mainTicks['format'] === true, 'lists are separate (main kept its own tick, not Festival\'s)');

// 8. Sign out. The card auto-opens when the account still needs a name
// (completion step), so only tap the row if it is actually closed.
if (await page.locator('#acctCard').isHidden()) {
  await page.click('#acctLine');
  await page.waitForTimeout(200);
}
await page.click('#signOutBtn');
await page.waitForTimeout(800);
ok((await page.locator('#acctText').textContent()).includes('Sync is off'), 'signed out again');
ok(await page.locator('#listSwitch').isHidden(), 'switcher gone signed out (ruling 5)');

ok(errors.length === 0, 'zero page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));

await browser.close();
console.log(failures ? `\n${failures} FAILURES` : '\nALL PASS');
process.exit(failures ? 1 : 0);
