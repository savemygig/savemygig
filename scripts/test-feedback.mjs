/*
 * FEEDBACK FORM BEHAVIOUR TEST.
 *
 * WHY THIS EXISTS (2026-08-06). /feedback shipped with a success state that
 * never arrived. The submit handler set `form.hidden = true`, but the UA's
 * `[hidden] { display: none }` rule is specificity (0,1,0) and so is
 * `.fbp-form { display: flex }`, which loaded later and won: the entire form
 * stayed on screen with its button frozen on "Sending..." while the thank-you
 * message rendered underneath it. Everybody who ever sent feedback saw that,
 * and no test would have caught it, because the SCRIPT was correct. Only the
 * rendered geometry was wrong, which is why this test asserts on layout
 * (offsetParent / computed display) and not on attributes.
 *
 * It also pins the two things the error path must do, both of which were
 * wrong before: a server-side failure must NOT be reported as "no connection"
 * (it sends a DJ to check their wifi over our own 500), and it must NOT eat
 * the message they typed.
 *
 * /api/feedback is a Cloudflare Function and does not exist in a static dist,
 * so the route is stubbed. Stubbing is the point: it makes both the success
 * and the 500 deterministic instead of dependent on how a missing endpoint
 * happens to fail.
 *
 * Run: node scripts/test-feedback.mjs dist
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

// The wording that may ONLY appear when there is genuinely no network. If one
// of these shows up on a stubbed 500 the honest-error split has regressed.
// Matched case-insensitively against the status line's own text.
const OFFLINE_WORDS = {
  '/feedback': 'no connection',
  '/pt/feedback': 'sem conex',
  '/es/feedback': 'sin conexi',
};

const TYPED = 'The waveform view goes blank on the second deck after about an hour, every gig, and I would rather tell you than complain about it.';

for (const path of ['/feedback', '/pt/feedback', '/es/feedback']) {
  /* ---------- the success state ---------- */
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await ctx.newPage();
  const pageErrors = [];
  page.on('pageerror', (e) => pageErrors.push(e.message));
  await page.route('**/api/feedback', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) }));
  await page.goto(base + path, { waitUntil: 'load' });

  await page.fill('#fb-msg', TYPED);
  await page.click('#fbForm button[type="submit"]');
  await page.waitForTimeout(400);

  // THE ASSERTION THAT WOULD HAVE CAUGHT THE BUG. `hidden` being set is not
  // the claim; being off the screen is. offsetParent === null covers
  // display:none however it is achieved, and the computed display is reported
  // alongside it so a failure says WHY in one line.
  const state = await page.evaluate(() => {
    const form = document.getElementById('fbForm');
    const done = document.getElementById('fbDone');
    const btn = form && form.querySelector('button[type="submit"]');
    return {
      formHiddenAttr: !!(form && form.hasAttribute('hidden')),
      formGone: !!form && form.offsetParent === null && form.getClientRects().length === 0,
      formDisplay: form ? getComputedStyle(form).display : 'missing',
      doneVisible: !!done && done.offsetParent !== null && done.getBoundingClientRect().height > 0,
      doneDisplay: done ? getComputedStyle(done).display : 'missing',
      btnText: btn ? (btn.textContent || '').trim() : '',
    };
  });
  ok(`${path}: the form is genuinely gone after a successful submit`, state.formGone,
    `display: ${state.formDisplay}, hidden attr: ${state.formHiddenAttr}`);
  ok(`${path}: the thank-you is visible`, state.doneVisible, `display: ${state.doneDisplay}`);
  ok(`${path}: no uncaught page errors`, pageErrors.length === 0, pageErrors.join(' | ').slice(0, 160));
  await ctx.close();

  /* ---------- the server-error state ---------- */
  const ctx2 = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const p2 = await ctx2.newPage();
  await p2.route('**/api/feedback', (route) =>
    route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ ok: false }) }));
  await p2.goto(base + path, { waitUntil: 'load' });

  await p2.fill('#fb-msg', TYPED);
  await p2.click('#fbForm button[type="submit"]');
  await p2.waitForTimeout(400);

  const err = await p2.evaluate(() => {
    const form = document.getElementById('fbForm');
    const msg = document.getElementById('fb-msg');
    const st = document.getElementById('fbStatus');
    const btn = form && form.querySelector('button[type="submit"]');
    return {
      formStillVisible: !!form && form.offsetParent !== null,
      typed: msg ? msg.value : '',
      status: st ? (st.textContent || '').trim() : '',
      statusVisible: !!st && st.offsetParent !== null,
      hasMailto: !!(st && st.querySelector('a[href^="mailto:"]')),
      btnUsable: !!btn && !btn.hasAttribute('disabled'),
    };
  });
  ok(`${path}: the typed message survives a 500`, err.typed === TYPED,
    `${err.typed.length} of ${TYPED.length} chars kept`);
  ok(`${path}: the form is still there to resubmit`, err.formStillVisible);
  ok(`${path}: the send button is usable again`, err.btnUsable);
  ok(`${path}: an error is actually shown`, err.statusVisible && err.status.length > 0,
    JSON.stringify(err.status.slice(0, 70)));
  ok(`${path}: a 500 does not claim the visitor is offline`,
    !err.status.toLowerCase().includes(OFFLINE_WORDS[path]),
    `must not contain "${OFFLINE_WORDS[path]}"`);
  ok(`${path}: a server failure offers another way to reach us`, err.hasMailto);
  await ctx2.close();
}

await browser.close();
server.close();
if (fails.length) { console.log(`\nFEEDBACK TEST FAIL: ${fails.length}`); process.exit(1); }
console.log('\nFeedback test PASS');
