/*
 * Ad hoc verification harness for the batch5 visual-system items (B).
 *   node scripts/verify-visual.mjs dist
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
const base = `http://${'127.0.0.1'}:${server.address().port}`;
const browser = await chromium.launch();

let fails = 0;
const is = (cond, n, d = '') => { if (!cond) fails++; console.log(`${cond ? 'PASS' : 'FAIL'}  ${n}${d ? '  (' + d + ')' : ''}`); };

async function open(path, width, height = 860) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(base + path, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.querySelector('#ck')?.remove());
  return page;
}

const RGB = { red: 'rgb(255, 77, 46)', amber: 'rgb(217, 164, 65)', green: 'rgb(58, 216, 132)', dim: 'rgb(154, 151, 143)' };

/* ---- 6. status-line tone per page, pulse on red only ---- */
const TONE = [
  ['/emergency', 'red'], ['/404', 'red'], ['/offline', 'red'],
  ['/fix/usb-not-recognized-cdj', 'red'], ['/fix/cdj-error-e-8302', 'red'],
  ['/prepare', 'amber'], ['/recovery', 'amber'], ['/files-lost', 'amber'],
  ['/fix/format-usb-for-cdj', 'amber'], ['/fix/exfat-vs-fat32-cdj', 'amber'],
  ['/checklist', 'green'], ['/saved', 'green'], ['/card-ready', 'green'],
  ['/knowledge', 'dim'], ['/knowledge/dictionary', 'dim'], ['/gear', 'dim'],
  ['/card', 'dim'], ['/faq', 'dim'], ['/about', 'dim'], ['/legal', 'dim'],
  ['/install', 'dim'], ['/partners', 'dim'], ['/feedback', 'dim'],
  ['/knowledge/pioneer-dj/cdj-3000', 'dim'], ['/knowledge/pioneer-dj/firmware', 'dim'],
];
for (const L of ['', '/pt', '/es']) {
  let bad = 0, pulsing = [];
  for (const [p, want] of TONE) {
    const page = await open(L + p, 1280);
    const r = await page.evaluate(() => {
      const el = document.querySelector('.status-line');
      if (!el) return null;
      const cs = getComputedStyle(el);
      const led = getComputedStyle(el, '::before');
      return { text: cs.color, led: led.backgroundColor, anim: led.animationName, dur: led.animationDuration };
    });
    await page.close();
    if (!r) { bad++; console.log(`   MISSING eyebrow ${L + p}`); continue; }
    const okTone = r.text === RGB[want] && r.led === RGB[want];
    if (!okTone) { bad++; console.log(`   ${L + p}: want ${want} ${RGB[want]}, got text ${r.text} / led ${r.led}`); }
    const animates = r.anim !== 'none';
    if (animates !== (want === 'red')) { pulsing.push(`${L + p} anim=${r.anim} tone=${want}`); }
  }
  is(bad === 0, `${L || '/en'}: all ${TONE.length} eyebrow tones correct`);
  is(pulsing.length === 0, `${L || '/en'}: the pulse is on red and only red`, pulsing.join('; '));
}

/* ---- 7. one danger geometry, and /card is on the palette ---- */
for (const L of ['', '/pt', '/es']) {
  const page = await open(L + '/card', 1280);
  const r = await page.evaluate(() => {
    const g = document.querySelector('.panel-go'), w = document.querySelector('.panel-warn'), d = document.querySelector('.panel-danger');
    const grab = (el) => {
      if (!el) return null;
      const cs = getComputedStyle(el);
      return { bl: cs.borderLeftWidth, blc: cs.borderLeftColor, btc: cs.borderTopColor, bt: cs.borderTopWidth, bg: cs.backgroundColor };
    };
    return { go: grab(g), warn: grab(w), danger: grab(d), inline: document.querySelectorAll('[style*="rgba(0,255,102"], [style*="rgba(255,176,32"]').length };
  });
  await page.close();
  is(r.inline === 0, `${L || '/en'}/card: no out-of-palette inline border colours`, r.inline + ' found');
  is(r.go && r.go.btc === 'rgba(58, 216, 132, 0.5)', `${L || '/en'}/card: green panel is .panel-go on --green-border`, r.go && r.go.btc);
  is(r.warn && r.warn.btc === 'rgba(217, 164, 65, 0.4)', `${L || '/en'}/card: amber panel is .panel-warn on --amber`, r.warn && r.warn.btc);
  is(r.danger && r.danger.bl === '3px' && r.danger.blc === RGB.red,
    `${L || '/en'}/card: danger panel carries the 3px tone rail`, r.danger && `${r.danger.bl} ${r.danger.blc}`);
}
{
  // The rail is the SAME geometry the tunnel's .alert-card already had.
  const a = await open('/protocol/export/backup', 1280);
  const alert = await a.evaluate(() => {
    const el = document.querySelector('.alert-card');
    if (!el) return null;
    const cs = getComputedStyle(el);
    return { bl: cs.borderLeftWidth, blc: cs.borderLeftColor, bt: cs.borderTopWidth };
  });
  await a.close();
  const b = await open('/recovery', 1280);
  const danger = await b.evaluate(() => {
    const el = document.querySelector('.panel-danger');
    const cs = getComputedStyle(el);
    return { bl: cs.borderLeftWidth, blc: cs.borderLeftColor, bt: cs.borderTopWidth };
  });
  await b.close();
  is(alert && alert.bl === danger.bl && alert.blc === danger.blc && alert.bt === danger.bt,
    'one danger geometry: .alert-card and .panel-danger now agree',
    `alert ${JSON.stringify(alert)} vs danger ${JSON.stringify(danger)}`);
}

/* ---- 9. the drawer is an overlay: scrim, shadow, scroll lock ---- */
for (const L of ['', '/pt', '/es']) {
  const page = await open(L + '/faq', 390);
  // Scroll a little so a lock failure is measurable.
  await page.evaluate(() => window.scrollTo(0, 40));
  await page.waitForTimeout(80);
  const before = await page.evaluate(() => ({ y: window.scrollY, scrim: document.getElementById('navScrim').hidden }));
  await page.click('#navToggle');
  await page.waitForTimeout(200);
  const openState = await page.evaluate(() => {
    const s = document.getElementById('navScrim'), l = document.getElementById('navLinks');
    const cs = getComputedStyle(s), cl = getComputedStyle(l);
    const hdr = getComputedStyle(document.querySelector('.site-nav-wrap'));
    return {
      scrimShown: !s.hidden && cs.display !== 'none',
      // Compare the two elements to EACH OTHER: the assertion is "the same
      // scrim the search overlay uses", not a literal.
      scrimBg: cs.backgroundColor,
      scrimBlur: cs.backdropFilter,
      soBlur: getComputedStyle(document.getElementById('searchOverlay')).backdropFilter,
      soBg: getComputedStyle(document.getElementById('searchOverlay')).backgroundColor,
      scrimZ: cs.zIndex,
      shadow: cl.boxShadow, drawerZ: cl.zIndex,
      headerZ: hdr.zIndex, headerBg: hdr.backgroundColor,
      locked: getComputedStyle(document.documentElement).overflowY,
      expanded: document.getElementById('navToggle').getAttribute('aria-expanded'),
    };
  });
  // The position to hold is the one WHILE OPEN: clicking the toggle scrolls it
  // fully into view, which is the browser's own focus behaviour, not the lock.
  const held = await page.evaluate(() => window.scrollY);
  // A real wheel, not window.scrollBy: a script can still set scrollTop on a
  // clipped root, so scrollBy would test nothing a reader can do.
  await page.mouse.move(195, 700);
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(200);
  const during = await page.evaluate(() => window.scrollY);
  await page.keyboard.press('Escape');
  await page.waitForTimeout(200);
  const after = await page.evaluate(() => ({
    y: window.scrollY,
    scrim: document.getElementById('navScrim').hidden,
    open: document.getElementById('navLinks').classList.contains('open'),
    locked: getComputedStyle(document.documentElement).overflowY,
    expanded: document.getElementById('navToggle').getAttribute('aria-expanded'),
    focus: document.activeElement.id,
  }));
  const tag = L || '/en';
  is(before.scrim === true, `${tag} drawer: no scrim before open`);
  is(openState.scrimShown, `${tag} drawer: scrim is up`, openState.scrimBg + ' ' + openState.scrimBlur);
  is(openState.scrimBg === openState.soBg && openState.scrimBlur === openState.soBlur && openState.scrimBlur.includes('blur(6px)'),
    `${tag} drawer: scrim is byte-for-byte the search overlay's`, `scrim ${openState.scrimBg} ${openState.scrimBlur} vs .so ${openState.soBg} ${openState.soBlur}`);
  is(Number(openState.scrimZ) < Number(openState.drawerZ), `${tag} drawer: scrim sits under the drawer`, `${openState.scrimZ} < ${openState.drawerZ}`);
  is(openState.headerZ === '30' && openState.headerBg === 'rgb(10, 10, 11)', `${tag} drawer: header stays above the scrim, opaque`, openState.headerZ + ' / ' + openState.headerBg);
  is(openState.shadow !== 'none', `${tag} drawer: overlay shadow`, openState.shadow);
  is(openState.locked === 'hidden', `${tag} drawer: body scroll locked`, 'html overflow-y: ' + openState.locked);
  is(during === held, `${tag} drawer: a wheel over the scrim does not scroll the page behind it`, `${held} -> ${during}`);
  is(after.open === false && after.scrim === true && after.expanded === 'false', `${tag} drawer: Escape closes it and resets aria-expanded`);
  is(after.locked !== 'hidden', `${tag} drawer: scroll lock released on close`, 'html overflow-y: ' + after.locked);
  is(after.y === held, `${tag} drawer: scroll position restored on close`, `${held} -> ${after.y}`);
  is(after.focus === 'navToggle', `${tag} drawer: focus returns to the toggle`, '#' + after.focus);
  // And the toggle still toggles.
  await page.click('#navToggle');
  await page.waitForTimeout(150);
  const reopened = await page.evaluate(() => document.getElementById('navLinks').classList.contains('open'));
  await page.click('#navToggle');
  await page.waitForTimeout(150);
  const reclosed = await page.evaluate(() => document.getElementById('navLinks').classList.contains('open'));
  is(reopened && !reclosed, `${tag} drawer: the existing toggle still opens and closes it`);
  await page.close();
}

/* ---- 10. the hero placeholder fits ---- */
for (const L of ['', '/pt', '/es']) {
  for (const w of [360, 390, 1280]) {
    const page = await open(L + '/', w);
    const r = await page.evaluate(() => {
      const box = document.querySelector('.home-srch .srch-input');
      const ph = box.getAttribute('placeholder');
      // Measure the placeholder in the input's own font.
      const c = document.createElement('canvas').getContext('2d');
      const cs = getComputedStyle(box);
      c.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
      return { ph, need: Math.round(c.measureText(ph).width), have: Math.round(box.clientWidth) };
    });
    await page.close();
    is(r.need <= r.have, `${L || '/en'} hero placeholder fits @${w}`, `"${r.ph}" needs ${r.need}px, input is ${r.have}px`);
  }
}

/* ---- 11. /404 is on one alignment axis ---- */
for (const L of ['', '/pt', '/es']) {
  const page = await open(L + '/404', 1280);
  const r = await page.evaluate(() => {
    const q = (s) => document.querySelector(s);
    const left = (el) => Math.round(el.getBoundingClientRect().left);
    return {
      eyebrow: left(q('.status-line')), h1: left(q('h1')), p: left(q('p.dim')),
      cta: left(q('.btn-solid')), home: left(q('main p:last-of-type a')),
      ctaCentred: (() => { const cs = getComputedStyle(q('.btn-solid')); return cs.marginLeft === cs.marginRight && cs.marginLeft !== '0px'; })(),
      eyebrowJustify: getComputedStyle(q('.status-line')).justifyContent,
    };
  });
  await page.close();
  const cols = [r.eyebrow, r.h1, r.p, r.cta, r.home];
  const tag = L || '/en';
  is(new Set(cols).size === 1, `${tag}/404: eyebrow, h1, paragraph, CTA and back-link share one column`, cols.join(' / '));
  is(!r.ctaCentred, `${tag}/404: the CTA is no longer auto-centred`);
  is(r.eyebrowJustify === 'normal' || r.eyebrowJustify === 'flex-start', `${tag}/404: the eyebrow is no longer centred`, r.eyebrowJustify);
}

await browser.close();
server.close();
console.log(fails ? `\n${fails} FAILURE(S)` : '\nAll visual-system checks PASS');
process.exit(fails ? 1 : 0);
