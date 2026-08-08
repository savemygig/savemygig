#!/usr/bin/env node
/*
 * THE HARDWARE PHOTO ACTUALLY FITS ITS BOX. Added 2026-08-08, after Antonio
 * reported it twice: "The SL 1200 MK2 and MK7 are still with the image in the
 * wrong size."
 *
 * WHAT WENT WRONG. .hw-head and .hw-thumb were copied by hand into the <style>
 * block of every hardware page, 57 identical copies. The Technics pages shipped
 * with a trimmed style block that omitted them, so the image had no box, rendered
 * at its intrinsic size, filled the column and pushed the booth briefing off the
 * screen. A rule that has to be remembered 57 times gets forgotten the 58th, so
 * the rules are now defaults in global.css and this check measures the result.
 *
 * WHY IT MEASURES INSTEAD OF GREPPING FOR THE CSS. The failure is visual and it
 * has more than one cause: a missing rule, a rule that loses on specificity, a
 * width/height attribute pair that does not match the file, or an aspect ratio no
 * previous product had. Grepping for a selector proves the text is present, not
 * that the photo fits. This launches the built pages and reads the geometry, in
 * the same spirit as the fold and promo checks.
 *
 * WHAT IT ASSERTS, per page carrying a .hw-thumb, at desktop and phone width:
 *   - the image fits inside its box on BOTH axes, which is the landscape case
 *     that broke, since a wide photo overflows a box that only caps height
 *   - the image does not overlap the h1
 *   - the page has no horizontal overflow
 *   - the intrinsic width and height attributes match the real image file, so a
 *     reprocessed photo cannot leave stale dimensions behind and shift the layout
 */

import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
const require = createRequire('/opt/node-tools/');
const { chromium } = require('playwright');

const DIST = process.argv[2] || 'dist';
const WIDTHS = [1280, 390];
let failed = 0;
const fail = (msg, ...d) => { failed++; console.error(`FAIL  ${msg}`); d.forEach((x) => console.error(`        ${x}`)); };

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
});

const pages = walk(DIST).filter((f) => fs.readFileSync(f, 'utf8').includes('class="hw-thumb"'));
if (pages.length === 0) {
  console.error('Hardware thumb check: no page carries a .hw-thumb. Run the build first.');
  process.exit(1);
}

/*
 * INTRINSIC SIZE PARITY, checked from the files rather than the browser. A
 * width/height pair that disagrees with the actual .webp reserves the wrong space
 * before the image decodes, which is a layout shift even when the final size is
 * right. This caught nothing on the first run, and it exists because the Technics
 * photos were reprocessed twice and the attributes had to be edited by hand each
 * time.
 */
function webpSize(file) {
  const b = fs.readFileSync(file);
  if (b.slice(0, 4).toString('ascii') !== 'RIFF') return null;
  // VP8L and VP8X and VP8 all encode the canvas differently. VP8X carries it
  // plainly, which is what the pipeline's lossy+alpha output uses.
  for (let i = 12; i < Math.min(b.length - 8, 4096);) {
    const tag = b.slice(i, i + 4).toString('ascii');
    const size = b.readUInt32LE(i + 4);
    const p = i + 8;
    if (tag === 'VP8X') return { w: (b.readUIntLE(p + 4, 3) & 0xffffff) + 1, h: (b.readUIntLE(p + 7, 3) & 0xffffff) + 1 };
    if (tag === 'VP8 ') return { w: b.readUInt16LE(p + 6) & 0x3fff, h: b.readUInt16LE(p + 8) & 0x3fff };
    if (tag === 'VP8L') {
      const bits = b.readUInt32LE(p + 1);
      return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
    }
    i = p + size + (size % 2);
  }
  return null;
}

for (const file of pages) {
  const html = fs.readFileSync(file, 'utf8');
  /*
   * SCOPED TO THE .hw-thumb ANCHOR, not to the first image on the page. The first
   * version searched the whole document and matched the header logo shield every
   * time, so it compared logo-shield.svg's 47x54 against itself and passed while a
   * deliberately corrupted product photo sailed through. Caught by breaking a
   * photo on purpose and watching the check still say PASS, which is the only way
   * this kind of false green ever surfaces.
   */
  const anchor = html.indexOf('class="hw-thumb"');
  if (anchor === -1) continue;
  const m = html.slice(anchor).match(/<img[^>]*src="(\/images\/[^"]+)"[^>]*?width="(\d+)"[^>]*?height="(\d+)"/);
  if (!m) {
    fail(`${file}: a .hw-thumb is present but its image has no width and height attributes`,
      'Without them the browser reserves no space and the page shifts on decode.');
    continue;
  }
  const [, src, w, h] = m;
  const onDisk = path.join(DIST, src.replace(/^\//, ''));
  if (!fs.existsSync(onDisk)) { fail(`${file}: photo missing from the build`, onDisk); continue; }
  const real = webpSize(onDisk);
  if (real && (real.w !== Number(w) || real.h !== Number(h))) {
    fail(`${file}: width/height attributes do not match the image file`,
      `markup says ${w}x${h}, ${src} is actually ${real.w}x${real.h}`,
      'Update the attributes, or the browser reserves the wrong space before decode.');
  }
}

/*
 * LAYOUT PARITY WITH THE REFERENCE PAGES. Added 2026-08-08, same session and the
 * same cause as the photo box.
 *
 * Antonio asked for "the same format, same layouts like the pioneer one", and the
 * hardware pages achieve that by each carrying an identical copy of the same
 * ~17 rule style block. The new Technics and XDJ pages carried a trimmed one, so
 * three rules were missing: the h1 bottom margin, the accent word's 96% size, and
 * the anchor scroll offset. The third is functional, not cosmetic: without it an
 * in-page "Related:" link lands its heading flush against the top of the
 * viewport. All three are defaults in global.css now, and this measures the
 * result rather than trusting anyone to copy a style block correctly.
 *
 * THE REFERENCE IS A PAGE THAT SHIPPED AND WAS APPROVED, not an average, for the
 * same reason the booth briefing band is anchored to the DJM-900NXS2: if the whole
 * corpus drifts, an average drifts with it and the check keeps passing.
 */
const REFERENCE = path.join(DIST, 'knowledge', 'pioneer-dj', 'xdj-1000mk2.html');

async function metrics(page, file) {
  await page.goto(`file://${path.resolve(file)}`);
  return page.evaluate(() => {
    const h1 = document.querySelector('h1');
    const accent = h1?.querySelector('.accent');
    const target = document.querySelector('main [id]');
    const para = [...document.querySelectorAll('main .acc-body p')].find((x) => x.textContent.trim().length > 60);
    const g = (el) => (el ? getComputedStyle(el) : null);
    const h = g(h1), a = g(accent), t = g(target), p = g(para);
    return {
      h1MarginBottom: h?.marginBottom, accentFontSize: a?.fontSize,
      anchorScrollMargin: t?.scrollMarginTop,
      paraColor: p?.color, paraLineHeight: p?.lineHeight,
    };
  });
}

const browser = await chromium.launch();

if (fs.existsSync(REFERENCE)) {
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1280, height: 900 });
  const ref = await metrics(page, REFERENCE);
  let parity = 0;
  for (const file of pages) {
    if (path.resolve(file) === path.resolve(REFERENCE)) continue;
    const m = await metrics(page, file);
    const off = Object.keys(ref).filter((k) => ref[k] && m[k] && ref[k] !== m[k]);
    if (off.length) {
      fail(`${file.replace(`${DIST}/`, '')}: layout differs from the reference hardware page`,
        ...off.map((k) => `${k}: this page ${m[k]}, ${path.basename(REFERENCE)} ${ref[k]}`),
        'The hardware pages are one family. Those rules are defaults in global.css.');
    } else {
      parity++;
    }
  }
  if (parity === pages.length - 1) console.log(`PASS  layout parity ${parity} pages match ${path.basename(REFERENCE)}`);
  await page.close();
} else {
  console.log(`note  reference ${REFERENCE} not built, skipped layout parity`);
}

for (const width of WIDTHS) {
  const page = await browser.newPage();
  await page.setViewportSize({ width, height: 900 });
  let ok = 0;
  for (const file of pages) {
    await page.goto(`file://${path.resolve(file)}`);
    const r = await page.evaluate(() => {
      const img = document.querySelector('.hw-thumb img');
      const box = document.querySelector('.hw-thumb');
      const h1 = document.querySelector('h1');
      if (!img || !box) return null;
      const i = img.getBoundingClientRect(), b = box.getBoundingClientRect();
      const t = h1 ? h1.getBoundingClientRect() : null;
      return {
        iw: Math.round(i.width), ih: Math.round(i.height),
        bw: Math.round(b.width), bh: Math.round(b.height),
        overlapsH1: t ? !(i.right <= t.left || i.left >= t.right || i.bottom <= t.top || i.top >= t.bottom) : false,
        overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    if (!r) continue;
    const label = file.replace(`${DIST}/`, '');
    // One pixel of slack for subpixel rounding.
    if (r.iw > r.bw + 1 || r.ih > r.bh + 1) {
      fail(`${label} @${width}: photo is bigger than its box`,
        `image ${r.iw}x${r.ih} inside a ${r.bw}x${r.bh} box`,
        'A landscape product photo overflows a box that only caps height. Cap both axes.');
    } else if (r.overlapsH1) {
      fail(`${label} @${width}: photo overlaps the headline`, `image ${r.iw}x${r.ih}`);
    } else if (r.overflowX > 0) {
      fail(`${label} @${width}: page scrolls sideways`, `${r.overflowX}px of horizontal overflow`);
    } else {
      ok++;
    }
  }
  if (ok === pages.length) console.log(`PASS  @${width}  ${ok} hardware photos inside their box, clear of the headline`);
  await page.close();
}
await browser.close();

if (failed) {
  console.error(`\nHardware thumb check FAIL: ${failed} problem(s).`);
  process.exit(1);
}
console.log(`\nHardware thumb check PASS (${pages.length} pages, ${WIDTHS.length} widths)`);
