/*
 * Measures whether all three homepage doors are FULLY visible on load, on real
 * phone viewports, with the browser URL bar expanded (first load).
 *
 * The standing rule: all three doors readable on load on every phone. This
 * script exists because that rule has been broken twice by changes that looked
 * harmless on a desktop screenshot.
 *
 * SECOND SECTION, 2026-08-05: THE FIVE /emergency DOORS. Same rule, harder
 * page. The triage screen's five doors ARE the page, and the fifth one
 * (rekordbox export failed) had drifted below the fold: 17px over in English,
 * 50px in Spanish, 71px in Portuguese, because the translated h1 wraps to two
 * lines. Nothing caught it, because this script only ever looked at "/".
 * A door a DJ cannot see is a door they do not know exists.
 *
 * NOTE ON VIEWPORT CONVENTION, because the two sections differ deliberately.
 * The homepage section subtracts URL_BAR from the device height, so its
 * numbers describe a real first load with the address bar expanded. The
 * /emergency section uses the quoted size AS the viewport, because those are
 * the numbers the Aug 5 audit measured and reported ("17px over at 390x844")
 * and a gate that silently means something else by the same figure is worse
 * than no gate. Do not "harmonise" these without re-deriving the thresholds.
 *
 * Run: node scripts/fold-check.mjs dist
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const dir = process.argv[2] || 'dist';

// Real devices, with the first-load URL bar taking about 108px of height.
const URL_BAR = 108;
const DEVICES = [
  { name: 'iPhone SE',        w: 375, h: 667 },
  { name: 'iPhone 13 mini',   w: 375, h: 812 },
  { name: 'Galaxy S23',       w: 360, h: 780 },
  { name: 'iPhone 15/16',     w: 393, h: 852 },
  { name: 'Pixel 8',          w: 412, h: 915 },
  { name: 'iPhone 16 Pro Max',w: 430, h: 932 },
];

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
let worst = Infinity;
const fails = [];

for (const d of DEVICES) {
  const visible = d.h - URL_BAR;
  const page = await browser.newPage({ viewport: { width: d.w, height: visible } });
  await page.goto(base + '/', { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('#ck')?.remove());
  const m = await page.evaluate(() => {
    const doors = [...document.querySelectorAll('.door')];
    return doors.map((el) => {
      const r = el.getBoundingClientRect();
      const t = el.querySelector('.door-title');
      return { title: t ? t.textContent.trim() : '?', bottom: Math.round(r.bottom) };
    });
  });
  await page.close();

  const last = m[m.length - 1];
  const slack = visible - last.bottom;
  worst = Math.min(worst, slack);
  const bad = slack < 0;
  if (bad) fails.push(`${d.name}: "${last.title}" cut off by ${-slack}px`);
  console.log(
    `${bad ? 'FAIL' : 'ok  '} ${d.name.padEnd(19)} ${d.w}x${d.h} ` +
    `visible=${visible}px  lastDoorBottom=${last.bottom}px  slack=${slack >= 0 ? '+' : ''}${slack}px`
  );
}

console.log(`\nTightest device has ${worst >= 0 ? '+' : ''}${worst}px of room below the last door.`);
if (fails.length) { console.log('FOLD CHECK FAIL:\n' + fails.join('\n')); }
else console.log('PASS: all three doors fit on every tested phone');

// ---------------------------------------------------------------------------
// THE FIVE /emergency DOORS, in all three languages.
//
// Two tiers, because "fully visible on the tightest phone in Brazil" and
// "fully visible on a current iPhone" are different promises and only one of
// them is keepable without shrinking the door type below what the homepage
// doors use (which is the line we do not cross: .pad-title is 17px and stays
// there).
//
//   full    every one of the five pads entirely inside the viewport
//   top     the FIFTH pad's TOP edge inside the viewport, so it is visibly
//           there and discoverable even though it needs a short scroll
// ---------------------------------------------------------------------------
const EMERGENCY = [
  { path: '/emergency',    lang: 'en' },
  { path: '/pt/emergency', lang: 'pt' },
  { path: '/es/emergency', lang: 'es' },
];
const EMERGENCY_VIEWPORTS = [
  { w: 390, h: 844, rule: 'full' },   // iPhone 14/15/16
  { w: 430, h: 932, rule: 'full' },   // iPhone Pro Max
  { w: 360, h: 740, rule: 'top'  },   // the common budget Android, and Brazil
];

console.log('');
const eFails = [];
let eWorst = Infinity;

for (const { path, lang } of EMERGENCY) {
  for (const { w, h, rule } of EMERGENCY_VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    // The consent banner is already suppressed on this page, but a stray one
    // would invalidate the measurement, so this is belt and braces and it
    // also keeps the two sections measuring the same thing.
    await page.evaluate(() => document.querySelector('#ck')?.remove());
    const m = await page.evaluate(() => {
      const pads = [...document.querySelectorAll('.pad-grid > .pad')];
      return {
        count: pads.length,
        titleFontPx: pads.length
          ? parseFloat(getComputedStyle(pads[0].querySelector('.pad-title')).fontSize) : 0,
        last: pads.length ? (() => {
          const r = pads[pads.length - 1].getBoundingClientRect();
          const t = pads[pads.length - 1].querySelector('.pad-title');
          return { top: Math.round(r.top), bottom: Math.round(r.bottom), title: t ? t.textContent.trim() : '?' };
        })() : null,
      };
    });
    await page.close();

    // Five doors, always. A missing door is a worse bug than a door below the
    // fold and would otherwise make this check pass by having less to fit.
    if (m.count !== 5) {
      eFails.push(`${path} ${w}x${h}: expected 5 doors, found ${m.count}`);
      console.log(`FAIL ${(path + ' ' + w + 'x' + h).padEnd(28)} only ${m.count} doors`);
      continue;
    }
    // The type floor. .pad-title must never be shrunk to win this check; the
    // fix is always air, never size. 17px is the shipped value.
    if (m.titleFontPx < 17) {
      eFails.push(`${path} ${w}x${h}: .pad-title shrunk to ${m.titleFontPx}px, floor is 17px`);
    }

    const measure = rule === 'full' ? m.last.bottom : m.last.top;
    const slack = h - measure;
    const bad = slack < 0;
    if (rule === 'full') eWorst = Math.min(eWorst, slack);
    if (bad) {
      eFails.push(rule === 'full'
        ? `${path} ${w}x${h}: fifth door "${m.last.title}" cut off by ${-slack}px`
        : `${path} ${w}x${h}: fifth door "${m.last.title}" starts ${-slack}px below the fold, not discoverable`);
    }
    console.log(
      `${bad ? 'FAIL' : 'ok  '} ${(path + ' ' + w + 'x' + h).padEnd(28)} ` +
      `${rule === 'full' ? 'fifthBottom=' + m.last.bottom : 'fifthTop=' + m.last.top}px  ` +
      `title=${m.titleFontPx}px  slack=${slack >= 0 ? '+' : ''}${slack}px  (${rule})`
    );
  }
}

await browser.close();
server.close();

console.log(`\nTightest FULL-visibility case has ${eWorst >= 0 ? '+' : ''}${eWorst}px below the fifth /emergency door.`);
if (eFails.length) { console.log('FOLD CHECK FAIL:\n' + eFails.join('\n')); }
else console.log('PASS: all five emergency doors clear the fold in en, pt and es');

if (fails.length || eFails.length) process.exit(1);
