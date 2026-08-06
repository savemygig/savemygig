/*
 * Screenshot helper for pages that need to be in a STATE first.
 *   node scripts/shot-state.mjs dist /path 390 out.png <state> [full]
 * States: plain | search | drawer
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const [dir = 'dist', path = '/', width = '390', out = 'shot.png', state = 'plain', full = ''] = process.argv.slice(2);
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
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: +width, height: 860 }, deviceScaleFactor: 2 });
await page.goto(base + path, { waitUntil: 'networkidle' });
await page.evaluate(() => document.querySelector('#ck')?.remove());
if (state === 'search') { await page.click('#navSearchBtn'); await page.waitForTimeout(250); }
if (state === 'drawer') { await page.click('#navToggle'); await page.waitForTimeout(350); }
await page.screenshot({ path: out, fullPage: full === 'full' });
await browser.close();
server.close();
console.log(`wrote ${out} (${path} @ ${width}, state=${state})`);
