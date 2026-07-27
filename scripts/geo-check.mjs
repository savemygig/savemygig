// Geometry gate for Save My Gig. Measures real layout in Chromium.
// Run: node scripts/geo-check.mjs   (or npm run gate:geo)
// Playwright is not a repo dependency; it resolves from the global install at
// /opt/node-tools when not found locally.
import { createRequire } from 'node:module';
let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }
import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname } from 'node:path';

const ROOT = process.argv[2] || 'dist'; // run: node scripts/geo-check.mjs (needs playwright; resolves from /opt/node-tools)
const MIME = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css',
  '.json':'application/json', '.svg':'image/svg+xml', '.png':'image/png',
  '.webp':'image/webp', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain' };

async function resolve(p) {
  p = decodeURIComponent(p.split('?')[0]);
  const cands = [];
  if (p.endsWith('/')) cands.push(join(ROOT, p, 'index.html'));
  else { cands.push(join(ROOT, p + '.html')); cands.push(join(ROOT, p)); cands.push(join(ROOT, p, 'index.html')); }
  if (p === '/') cands.length = 0, cands.push(join(ROOT, 'index.html'));
  for (const c of cands) { try { const s = await stat(c); if (s.isFile()) return c; } catch {} }
  return null;
}
const server = http.createServer(async (req, res) => {
  const f = await resolve(req.url);
  if (!f) { res.writeHead(404); return res.end('nf'); }
  const body = await readFile(f);
  res.writeHead(200, { 'content-type': MIME[extname(f)] || 'application/octet-stream' });
  res.end(body);
});
await new Promise(r => server.listen(0, r));
const port = server.address().port;
const base = `http://127.0.0.1:${port}`;

// Real phone widths, weighted to what DJs actually carry (Antonio: mostly
// iPhone, 16/17 and Pro models). 360 = budget Android, 375 = iPhone SE,
// 390 = iPhone 12-15, 393 = iPhone 16 / Galaxy S23, 402 = iPhone 16 Pro,
// 412 = Pixel, 430 = iPhone 15 Pro Max, 440 = iPhone 16 Pro Max.
const WIDTHS = [360, 375, 390, 393, 402, 412, 430, 440];
const PAGES = ['/', '/emergency', '/fix/cdj-error-e-8302'];
const browser = await chromium.launch();
const fails = [];
const rows = [];
for (const path of PAGES) {
  for (const w of WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: 820 } });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    const m = await page.evaluate(() => {
      const r = (sel) => { const el = document.querySelector(sel); if (!el) return null;
        const b = el.getBoundingClientRect(); return { w: +b.width.toFixed(1), h: +b.height.toFixed(1) }; };
      return {
        toggle: r('#navToggle'), search: r('#navSearchBtn'),
        scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
        doorTitles: [...document.querySelectorAll('.door-title')].map(e => {
          const cs = getComputedStyle(e); const lh = parseFloat(cs.lineHeight) || e.getBoundingClientRect().height;
          return +(e.getBoundingClientRect().height / lh).toFixed(2); }),
        doorDescs: [...document.querySelectorAll('.door-desc')].map(e => {
          const cs = getComputedStyle(e); const lh = parseFloat(cs.lineHeight) || e.getBoundingClientRect().height;
          return +(e.getBoundingClientRect().height / lh).toFixed(2); }),
      };
    });
    await page.close();
    const over = m.scrollW - m.clientW;
    rows.push(`${path} @${w}: toggle=${m.toggle ? m.toggle.w+'x'+m.toggle.h : 'none'} search=${m.search ? m.search.w+'x'+m.search.h : 'none'} overflowX=${over}px${m.doorTitles.length ? ' doorLines=['+m.doorTitles.join(',')+']' : ''}`);
    // Assertions: nav controls must be >= 44x44; no horizontal overflow.
    for (const [name, box] of [['toggle', m.toggle], ['search', m.search]]) {
      if (!box) { fails.push(`${path}@${w}: #${name} missing`); continue; }
      if (box.w < 44 || box.h < 44) fails.push(`${path}@${w}: #${name} ${box.w}x${box.h} < 44`);
    }
    if (over > 0) fails.push(`${path}@${w}: horizontal overflow ${over}px`);
    if (path === '/') for (const dl of m.doorTitles) if (dl > 1.2) fails.push(`/@${w}: a door title wraps (${dl} lines)`);
    // On phones the SHORT description must stay one line, or the third door
    // drops below the fold.
    if (path === '/') for (const dl of m.doorDescs) if (dl > 1.2) fails.push(`/@${w}: a door description wraps (${dl} lines)`);
  }
}
await browser.close();
server.close();
console.log(rows.join('\n'));
console.log(fails.length ? '\nFAIL:\n' + fails.join('\n') : '\nPASS: all geometry assertions hold');
process.exit(fails.length ? 1 : 0);
