/*
 * Promo banner fit test. Antonio's rule from an iPhone screenshot: a banner
 * whose title wraps makes three lines with the CTA and "looks terrible".
 * Every slide must hold ONE title line + ONE CTA line at phone widths.
 * The test unhides each slide in turn and measures both, so no future slide
 * can ship broken.
 * Run: node scripts/test-promo-fit.mjs dist
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
  '.png': 'image/png', '.webp': 'image/webp',
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

for (const width of [360, 390, 430]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  await page.goto(base + '/', { waitUntil: 'load' });
  const bad = await page.evaluate(() => {
    const out = [];
    document.querySelectorAll('.promo-slot .promo').forEach((p) => {
      p.hidden = false;
      const q = p.querySelector('.promo-q');
      const cta = p.querySelector('.promo-cta');
      const qLh = parseFloat(getComputedStyle(q).lineHeight) || parseFloat(getComputedStyle(q).fontSize) * 1.2;
      const cLh = parseFloat(getComputedStyle(cta).lineHeight) || parseFloat(getComputedStyle(cta).fontSize) * 1.2;
      const qLines = Math.round(q.getBoundingClientRect().height / qLh);
      const cLines = Math.round(cta.getBoundingClientRect().height / cLh);
      if (qLines > 1 || cLines > 1) out.push(`"${q.textContent.trim().slice(0, 40)}" q:${qLines} cta:${cLines}`);
      p.hidden = true;
    });
    return out;
  });
  ok(`promos fit one+one lines @${width}`, bad.length === 0, bad.join(' | ') || 'all fit');
  await page.close();
}

await browser.close();
server.close();
if (fails.length) { console.log(`\nPROMO FIT FAIL: ${fails.length}`); process.exit(1); }
console.log('\nPromo fit PASS');
