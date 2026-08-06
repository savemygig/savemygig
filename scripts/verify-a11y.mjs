/*
 * Ad hoc verification harness for the batch5 accessibility items.
 * Not part of the gate; run by hand:
 *   node scripts/verify-a11y.mjs dist
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

let fails = 0;
const ok = (n, d = '') => console.log(`PASS  ${n}${d ? '  (' + d + ')' : ''}`);
const bad = (n, d = '') => { fails++; console.log(`FAIL  ${n}${d ? '  (' + d + ')' : ''}`); };
const is = (cond, n, d) => (cond ? ok(n, d) : bad(n, d));

async function open(path, width, height = 850) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('#ck')?.remove());
  return page;
}

/* ---- 1. inert while the search overlay is open ---- */
for (const w of [390, 1280]) {
  const page = await open('/', w);
  const before = await page.evaluate(() => {
    const snap = (el) => (el ? el.inert : 'missing');
    return [snap(document.querySelector('header.site-nav-wrap')), snap(document.getElementById('main')), snap(document.querySelector('footer.site-footer'))];
  });
  is(before.every((v) => v === false), `@${w} nothing inert before open`, before.join(','));
  await page.click('#navSearchBtn');
  await page.waitForTimeout(120);
  const after = await page.evaluate(() => {
    const snap = (el) => (el ? el.inert : 'missing');
    return [snap(document.querySelector('header.site-nav-wrap')), snap(document.getElementById('main')), snap(document.querySelector('footer.site-footer'))];
  });
  is(after.every((v) => v === true), `@${w} header + #main + footer inert while open`, after.join(','));

  // THE REAL TEST: every NAMED node in the accessibility tree, other than the
  // WebArea root (whose name is the document title), must live inside the
  // dialog. Anything else is page content a virtual cursor can still reach.
  const tree = await page.accessibility.snapshot({ interestingOnly: false });
  const outside = [];
  let total = 0, inDialog = 0;
  (function walk(n, insideDialog, isRoot) {
    if (!n) return;
    const dlg = insideDialog || n.role === 'dialog';
    if (n.name && !isRoot) { total++; if (dlg) inDialog++; else outside.push(`${n.role}:${n.name}`); }
    (n.children || []).forEach((c) => walk(c, dlg, false));
  })(tree, false, true);
  is(outside.length === 0, `@${w} a11y tree carries no page content while overlay open`,
    outside.length ? 'reachable outside the dialog: ' + outside.slice(0, 8).join(' | ')
                   : `${total} named nodes, all ${inDialog} inside the dialog`);

  // Close, and everything comes back, with focus returned to the button.
  await page.keyboard.press('Escape');
  await page.waitForTimeout(120);
  const restored = await page.evaluate(() => {
    const snap = (el) => (el ? el.inert : 'missing');
    return {
      inert: [snap(document.querySelector('header.site-nav-wrap')), snap(document.getElementById('main')), snap(document.querySelector('footer.site-footer'))],
      focus: document.activeElement && document.activeElement.id,
    };
  });
  is(restored.inert.every((v) => v === false), `@${w} inert cleared on close`, restored.inert.join(','));
  is(restored.focus === 'navSearchBtn', `@${w} focus returns to the search button`, 'activeElement #' + restored.focus);
  await page.close();
}

/* ---- 2. the skip link actually moves focus ---- */
for (const [path, label] of [['/', 'Base'], ['/protocol/usb/start', 'Tunnel']]) {
  const page = await open(path, 390);
  const before = await page.evaluate(() => document.activeElement.tagName);
  await page.evaluate(() => document.querySelector('.skip-link').focus());
  await page.keyboard.press('Enter');
  await page.waitForTimeout(150);
  const after = await page.evaluate(() => ({
    id: document.activeElement.id,
    tag: document.activeElement.tagName,
    outline: getComputedStyle(document.activeElement).outlineStyle,
  }));
  is(after.id === 'main', `${label} ${path}: skip link moves document.activeElement to #main`,
    `${before} -> ${after.tag}#${after.id}`);
  is(after.outline === 'none', `${label} ${path}: no focus ring painted round the whole page`, 'outline-style: ' + after.outline);
  await page.close();
}

/* ---- 3. .foot-live contrast ---- */
{
  const page = await open('/', 1280);
  const m = await page.evaluate(() => {
    const el = document.querySelector('.foot-live');
    const cs = getComputedStyle(el);
    return { color: cs.color, opacity: cs.opacity, fontSize: cs.fontSize, bg: getComputedStyle(document.body).backgroundColor };
  });
  const rgb = (s) => s.match(/[\d.]+/g).map(Number);
  const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  const lum = ([r, g, b]) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  const a = Number(m.opacity);
  const fg = rgb(m.color), bg = rgb(m.bg);
  const eff = fg.map((v, i) => v * a + bg[i] * (1 - a));
  const L1 = lum(eff), L2 = lum(bg);
  const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
  is(m.opacity === '1', '.foot-live carries no opacity', 'opacity: ' + m.opacity);
  is(ratio >= 4.5, `.foot-live contrast ${ratio.toFixed(3)}:1 on --bg`, `${m.color} @ ${m.fontSize}, AA needs 4.5`);
  await page.close();
}

/* ---- 4. the search close button: 44x44 and attached to its panel ---- */
for (const w of [390, 1280]) {
  const page = await open('/', w);
  await page.click('#navSearchBtn');
  await page.waitForTimeout(120);
  const g = await page.evaluate(() => {
    const b = document.getElementById('searchClose').getBoundingClientRect();
    const p = document.querySelector('.so-panel').getBoundingClientRect();
    return { bw: b.width, bh: b.height, gap: p.top - b.bottom, right: p.right - b.right };
  });
  is(g.bw >= 44 && g.bh >= 44, `@${w} close button is ${g.bw}x${g.bh}, --tap-min is 44`);
  is(Math.abs(g.gap) <= 1, `@${w} close button is attached to the panel`, `gap ${g.gap.toFixed(1)}px`);
  is(Math.abs(g.right) <= 1, `@${w} close button is flush with the panel's right edge`, `${g.right.toFixed(1)}px`);
  await page.close();
}

/* ---- 5. sv-toggle out of the tab order above 640, ringed below ---- */
for (const [w, want] of [[1280, false], [390, true]]) {
  const page = await open('/knowledge/pioneer-dj/cdj-3000', w);
  const r = await page.evaluate(() => {
    const el = document.getElementById('sv-toggle');
    if (!el) return { missing: true };
    const cs = getComputedStyle(el);
    return { display: cs.display, name: el.labels ? Array.from(el.labels).filter((l) => getComputedStyle(l).display !== 'none').length : -1 };
  });
  is(!r.missing, `@${w} the toggle is still in the markup`);
  is((r.display !== 'none') === want, `@${w} toggle ${want ? 'is' : 'is not'} rendered/tabbable`, 'display: ' + r.display);
  if (want) {
    // Focus it and confirm a ring lands on a label the reader can see.
    const ring = await page.evaluate(() => {
      const el = document.getElementById('sv-toggle');
      el.focus();
      const vis = Array.from(document.querySelectorAll('.sv-more')).filter((l) => getComputedStyle(l).display !== 'none');
      return vis.map((l) => ({ txt: l.textContent.trim().slice(0, 12), outline: getComputedStyle(l).outlineWidth + ' ' + getComputedStyle(l).outlineStyle }));
    });
    is(ring.some((x) => x.outline.includes('solid') && parseFloat(x.outline) > 0),
      `@${w} the focus ring is drawn on the visible label`, JSON.stringify(ring));
  } else {
    // Tab order must not contain it.
    const inTab = await page.evaluate(() => {
      const els = Array.from(document.querySelectorAll('input,button,a[href],select,textarea,[tabindex]'));
      return els.filter((e) => e.id === 'sv-toggle' && getComputedStyle(e).display !== 'none').length;
    });
    is(inTab === 0, `@${w} the toggle is not a tab stop`, inTab + ' reachable');
  }
  await page.close();
}

await browser.close();
server.close();
console.log(fails ? `\n${fails} FAILURE(S)` : '\nAll accessibility checks PASS');
process.exit(fails ? 1 : 0);
