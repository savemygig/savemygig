/*
 * Measures whether all three homepage doors are FULLY visible on load, on real
 * phone viewports, with the browser URL bar expanded (first load).
 *
 * The standing rule: all three doors readable on load on every phone. This
 * script exists because that rule has been broken twice by changes that looked
 * harmless on a desktop screenshot.
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

await browser.close();
server.close();
console.log(`\nTightest device has ${worst >= 0 ? '+' : ''}${worst}px of room below the last door.`);
if (fails.length) { console.log('FOLD CHECK FAIL:\n' + fails.join('\n')); process.exit(1); }
console.log('PASS: all three doors fit on every tested phone');
