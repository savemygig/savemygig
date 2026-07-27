/*
 * Ad hoc screenshot helper.
 *   node scripts/shot.mjs dist /emergency 402 out.png [fullPage]
 * Serves dist statically (correct MIME for .js, or module scripts die) and
 * captures the page at a real device width.
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const [dir = 'dist', path = '/', width = '402', out = 'shot.png', full = ''] = process.argv.slice(2);

const MIME = {
  '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript',
  '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.xml': 'application/xml',
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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +width, height: 900 }, deviceScaleFactor: 2 });
await page.goto(base + path, { waitUntil: 'networkidle' });
// The cookie consent card overlays the page and hides content. Kill it.
await page.evaluate(() => document.querySelector('#ck')?.remove());
await page.screenshot({ path: out, fullPage: full === 'full' });
await browser.close();
server.close();
console.log(`wrote ${out} (${path} @ ${width})`);
