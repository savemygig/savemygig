/*
 * Device-2 test for the accounts/sync build: a FRESH browser profile signs
 * in with a magic link and must pull the account's lists down, apply main,
 * park Festival, and then delete-account must erase the server while the
 * device keeps its list. Run after ui-test-accounts.mjs seeded the server.
 * Run: node scripts/ui-test-device2.mjs http://127.0.0.1:8788 <link-token>
 */
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const base = process.argv[2] || 'http://127.0.0.1:8788';
const token = process.argv[3] || 'device2token';
let fails = 0;
const ok = (c, n) => { console.log((c ? 'PASS' : 'FAIL') + '  ' + n); if (!c) fails++; };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));

await page.goto(base + '/api/auth/link?t=' + token, { waitUntil: 'networkidle' });
await page.evaluate(() => document.getElementById('ck')?.remove());
await page.waitForTimeout(2500); // initAccount + syncNow (+ reload if active changed)
await page.waitForLoadState('networkidle');
await page.evaluate(() => document.getElementById('ck')?.remove());
await page.waitForTimeout(1000);

const reg = await page.evaluate(() => JSON.parse(localStorage.getItem('SMG_LISTS_V1') || '{}'));
ok(reg.lists && reg.lists.length === 2, 'device 2 adopted both lists: ' + JSON.stringify((reg.lists || []).map((l) => l.n)));
ok(reg.active === 'main', 'device 2 active stays its own main');
const ticks = await page.evaluate(() => JSON.parse(localStorage.getItem('SMG_CHECKLIST_V1') || '{}'));
ok(ticks['format'] === true, 'main blob pulled and APPLIED on device 2');
const parked = await page.evaluate(() => {
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k && k.indexOf('SMG_LIST_DATA_') === 0) return JSON.parse(localStorage.getItem(k) || '{}');
  }
  return null;
});
ok(parked && parked.ticks && parked.ticks['usb-two'] === true, 'Festival parked on device 2 with its tick');

// Delete account from device 2.
await page.evaluate(() => { document.getElementById('acctCard').hidden = false; });
await page.click('#delAcctBtn');
await page.waitForTimeout(300);
await page.click('#delAcctBtn');
await page.waitForTimeout(1800);
const txt = await page.locator('#acctText').textContent();
ok(txt.includes('Sync is off'), 'delete account signs the row out');
const unlocked = await page.evaluate(() => localStorage.getItem('SMG_UNLOCKED'));
ok(unlocked === null, 'registration keys cleared after delete');
const ticksAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('SMG_CHECKLIST_V1') || '{}'));
ok(ticksAfter['format'] === true, 'device keeps its list after delete');
ok(errors.length === 0, 'zero page errors' + (errors.length ? ': ' + errors.join(' | ') : ''));

await browser.close();
console.log(fails ? `\n${fails} FAILURES` : '\nALL PASS');
process.exit(fails ? 1 : 0);
