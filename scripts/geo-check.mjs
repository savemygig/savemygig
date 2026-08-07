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
// ---------------------------------------------------------------------------
// THE FOOTER COFFEE LINK IS CENTRED, AND STAYS CENTRED IN ALL THREE LANGUAGES.
//
// Antonio's rule, set on 2026-07-30 and reaffirmed on sight on 2026-08-06:
// centred under the brand block on desktop, left on phones. It lives in a 176px
// box, the same measure as the four social circles above it, and centring inside
// that box is what puts it under the middle of the SAVE MY GIG lockup.
//
// WHAT THIS GUARDS IS NOT THE CSS, IT IS THE TRANSLATIONS. `justify-content:
// center` cannot centre a label that fills the box: once the text wraps, the
// flex line is full and the cup icon is pinned to the left edge. That is exactly
// what happened on the morning of 2026-08-06, when the Portuguese label was
// "Pague um cafe pra gente". Measured cup positions from the block's left edge
// at 1280, all three languages on the same screen:
//
//     en   +27.91   ("Buy us a coffee", fits, centred)
//     es   +23.41   ("Invitanos un cafe", fits, centred)
//     pt   +0       (wrapped, filled the box, not centred at all)
//
// One element, three positions, and it read as a CSS bug in Portuguese only. The
// label was shortened to "Nos pague um cafe" and all three now fit, so this
// asserts the condition that KEEPS the alignment true rather than the alignment
// alone: one line, and clear space on both sides of the content.
//
// A future translator writing a longer coffee label fails here, at build time,
// with the reason spelled out, instead of silently dragging the cup back to the
// left edge in one language until Antonio spots it in a screenshot.
// 1280 only: the phone rule is width:auto, where there is nothing to centre.
// ---------------------------------------------------------------------------
{
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  for (const path of ['/', '/pt', '/es']) {
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelector('#ck')?.remove());
    const m = await page.evaluate(() => {
      const a = document.querySelector('.foot-bmc');
      if (!a) return null;
      const box = a.getBoundingClientRect();
      const cs = getComputedStyle(a);
      const label = a.querySelector('span');
      // Lines via a Range over the text, not the element's own box: a block
      // element always reports one rect, which is how a wrap hid here before.
      let lines = 1;
      if (label) {
        const rg = document.createRange();
        rg.selectNodeContents(label);
        const tops = new Set(
          [...rg.getClientRects()].filter((r) => r.width > 0.5 && r.height > 0.5)
            .map((r) => Math.round(r.top))
        );
        lines = Math.max(tops.size, 1);
      }
      const icon = a.querySelector('svg');
      const left = icon ? icon.getBoundingClientRect().left - box.left : null;
      const right = label ? box.right - label.getBoundingClientRect().right : null;
      return {
        justify: cs.justifyContent,
        boxW: Math.round(box.width),
        lines,
        left: left === null ? null : +left.toFixed(2),
        right: right === null ? null : +right.toFixed(2),
        text: label ? label.textContent.trim() : '',
      };
    });
    if (!m) { fails.push(`${path}: .foot-bmc not found in the footer`); continue; }
    rows.push(
      `${path} footer coffee: "${m.text}" ${m.lines}line box=${m.boxW}px ` +
      `justify=${m.justify} padL=${m.left} padR=${m.right}`
    );
    if (m.justify !== 'center') {
      fails.push(`${path}: .foot-bmc justify-content is "${m.justify}", expected "center" at 1280 (Antonio's rule)`);
    }
    if (m.lines > 1) {
      fails.push(
        `${path}: the coffee label "${m.text}" wraps to ${m.lines} lines in its ${m.boxW}px box, ` +
        `which pins it left instead of centred. Shorten the label in src/i18n/ui.js.`
      );
    }
    // Centred means clear space on BOTH sides. A label that exactly fills the
    // box reports one line and still is not centred.
    if (m.left !== null && m.left < 4) {
      fails.push(
        `${path}: the coffee label "${m.text}" leaves only ${m.left}px before the cup, so it is not visibly ` +
        `centred in its ${m.boxW}px box. Shorten the label in src/i18n/ui.js.`
      );
    }
    // Symmetry, to a pixel of rounding. Catches an override reaching in later.
    if (m.left !== null && m.right !== null && Math.abs(m.left - m.right) > 1.5) {
      fails.push(
        `${path}: the coffee link is not symmetric in its box (${m.left}px left, ${m.right}px right). ` +
        `Something is overriding the centring.`
      );
    }
  }
  await page.close();
}

await browser.close();
server.close();
console.log(rows.join('\n'));
console.log(fails.length ? '\nFAIL:\n' + fails.join('\n') : '\nPASS: all geometry assertions hold');
process.exit(fails.length ? 1 : 0);
