/*
 * Headline line-count and overflow census.
 *   node scripts/measure-headlines.mjs dist out.json
 * Walks every display-type element on a representative set of pages, at three
 * widths, in all three languages, and records how many LINES each headline
 * takes and whether it overflows its container. Run before and after a type
 * change and diff the two files: that is the only way to prove a tracking or
 * word-spacing tweak re-wrapped nothing.
 */
import { createServer } from 'node:http';
import { readFile, writeFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const dir = process.argv[2] || 'dist';
const out = process.argv[3] || 'headlines.json';
const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.xml': 'application/xml', '.webmanifest': 'application/manifest+json',
};
const server = createServer(async (req, res) => {
  const p = decodeURIComponent(req.url.split('?')[0]);
  for (const cand of [join(dir, p), join(dir, p + '.html'), join(dir, p, 'index.html')]) {
    try {
      const buf = await readFile(cand);
      res.writeHead(200, { 'content-type': MIME[extname(cand)] || 'application/octet-stream' });
      return res.end(buf);
    } catch {}
  }
  res.writeHead(404).end('nf');
});
await new Promise((r) => server.listen(0, r));
const base = `http://127.0.0.1:${server.address().port}`;

// The brief's set: the home page, /emergency, a tunnel screen, /prepare and a
// fix article, in all three languages, at the two narrowest phones plus desktop.
const PAGES = ['/', '/emergency', '/protocol/usb/start', '/prepare', '/fix/format-usb-for-cdj'];
const LANGS = ['', '/pt', '/es'];
const WIDTHS = [360, 390, 1280];
const SEL = 'h1, h2, h3, .display, .question, .pad-title, .kb-name, .lg-name, .pt-name, .door-title, .pv-title';

const browser = await chromium.launch();
const result = {};
for (const w of WIDTHS) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  for (const L of LANGS) {
    for (const p of PAGES) {
      const url = (L + (p === '/' ? '/' : p)).replace('//', '/') || '/';
      const resp = await page.goto(base + url, { waitUntil: 'networkidle' });
      if (!resp || resp.status() !== 200) { result[`${w}${url}`] = 'MISSING'; continue; }
      await page.evaluate(() => document.querySelector('#ck')?.remove());
      // Fonts must be settled or every count is a fallback-metric count.
      await page.evaluate(() => document.fonts.ready);
      await page.waitForTimeout(120);
      result[`${w}|${url}`] = await page.evaluate((sel) => {
        const rows = [];
        document.querySelectorAll(sel).forEach((el) => {
          const cs = getComputedStyle(el);
          if (cs.display === 'none' || cs.visibility === 'hidden') return;
          const r = document.createRange();
          r.selectNodeContents(el);
          // Client rects of the contents = one per rendered line box.
          const rects = Array.from(r.getClientRects()).filter((x) => x.width > 0.5 && x.height > 0.5);
          // Merge rects that share a baseline row (inline spans split them).
          const rowsY = [];
          rects.forEach((x) => {
            const hit = rowsY.find((y) => Math.abs(y - x.top) < 4);
            if (hit === undefined) rowsY.push(x.top);
          });
          const box = el.getBoundingClientRect();
          const parent = el.parentElement ? el.parentElement.getBoundingClientRect() : box;
          rows.push({
            k: el.className ? String(el.className).split(' ')[0] : el.tagName.toLowerCase(),
            t: (el.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 46),
            lines: rowsY.length,
            w: Math.round(box.width * 10) / 10,
            over: Math.round(Math.max(0, el.scrollWidth - el.clientWidth)),
            past: Math.round(Math.max(0, box.right - parent.right)),
          });
        });
        return rows;
      }, SEL);
    }
  }
  await page.close();
}
await browser.close();
server.close();
await writeFile(out, JSON.stringify(result, null, 1));
const n = Object.values(result).reduce((a, v) => a + (Array.isArray(v) ? v.length : 0), 0);
console.log(`wrote ${out}: ${Object.keys(result).length} page/width combinations, ${n} headlines measured`);
