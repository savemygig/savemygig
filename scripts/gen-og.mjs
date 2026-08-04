#!/usr/bin/env node
/**
 * OG CARD GENERATOR. Rebuilds the 13 social sharing cards in public/og/.
 *
 * WHY THIS EXISTS. These were hand-exported images with the wordmark baked in
 * as pixels, so they could not follow the brand: when the wordmark changed on
 * 2026-08-03 (exclamation mark removed, accent moved from MY to GIG) every one
 * of them silently became wrong, and no code change could fix them. They are
 * flat type on a flat background, which means they never needed to be
 * hand-exported in the first place. Now they are generated, so the brand has
 * exactly one source of truth again.
 *
 * FOUR THINGS WERE WRONG AND ARE FIXED HERE, found by measuring the old PNGs:
 *   1. "SAVE MY GIG!" with the exclamation mark, on all 13.
 *   2. RED WAS #FF3B3B. The brand red is #FF4D2E. They never matched, on any
 *      card, since the day they were made.
 *   3. GREEN WAS #00FF66. The brand green is #3AD884. Same story.
 *   4. rekordbox-not-detecting-usb used a completely different design from the
 *      other twelve: a two-tone white/red title, a bold subtitle and different
 *      type sizes. One card in thirteen off the system.
 * Also normalised: spaced hyphens in subtitles became commas (house style, and
 * a spaced hyphen reads as a substitute en dash, which is banned in source),
 * and "Rekordbox" became "rekordbox", which is how the manufacturer writes it
 * and how the rest of the site does.
 *
 * THE COLOUR IS NOT DECORATION. It follows the site's colour language: red for
 * a live failure, green where the reader has time. An error card is red, a
 * reference or prevention card is green. Same axis as the rescue flow.
 *
 * RUN: node scripts/gen-og.mjs
 * Deliberately NOT in the gate. It needs a browser, it writes to public/, and
 * the output is committed. Run it when a card's text or the brand changes.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

// tone: 'red'   a live failure, something is broken right now
// tone: 'green' reference or prevention, the reader has time
const CARDS = [
  { slug: 'usb-not-recognized-cdj',            tone: 'red',   title: 'USB NOT RECOGNIZED',       sub: 'The fastest checks, in order' },
  { slug: 'cdj-error-e-8302',                  tone: 'red',   title: 'ERROR E-8302',             sub: 'CANNOT PLAY TRACK, fixable on site' },
  { slug: 'playlists-not-showing-cdj',         tone: 'red',   title: 'PLAYLISTS MISSING?',       sub: 'Tracks play, playlists gone, the fix' },
  { slug: 'rekordbox-export-failed',           tone: 'red',   title: 'EXPORT FAILED?',           sub: 'rekordbox to USB, repaired' },
  { slug: 'rekordbox-file-is-missing',         tone: 'red',   title: '"FILE IS MISSING"',        sub: 'Your music is still there' },
  { slug: 'rekordbox-not-detecting-usb',       tone: 'red',   title: 'USB MISSING IN REKORDBOX', sub: 'Device will not show in Export mode' },
  { slug: 'waveforms-not-loading-cdj',         tone: 'red',   title: 'WAVEFORMS BLANK?',         sub: 'What it means, why it rarely matters tonight' },
  { slug: 'emergency-loop-mode',               tone: 'red',   title: 'EMERGENCY LOOP',           sub: 'Why the player is looping, and your exit' },
  { slug: 'format-usb-for-cdj',                tone: 'green', title: 'FAT32 + MBR',              sub: 'Format a USB for CDJs, step by step' },
  // `cased` opts out of the uppercase transform. exFAT and FAT32 are written
  // that way by the people who define them, and UPPERCASING them to EXFAT is
  // the kind of small wrongness a technical reader notices immediately. The
  // first regenerated pass shipped "EXFAT VS FAT32" and it looked amateur.
  { slug: 'exfat-vs-fat32-cdj',                tone: 'green', title: 'exFAT vs FAT32', cased: true, sub: 'Which format your CDJ actually reads' },
  { slug: 'best-usb-size-for-djing',           tone: 'green', title: '32GB? 64GB? 1TB?',         sub: 'The USB size DJs actually need' },
  { slug: 'dj-usb-backup-strategy',            tone: 'green', title: 'TWO DRIVES, ZERO PANIC',   sub: 'The backup system that ends USB fear' },
  { slug: 'move-rekordbox-library-new-laptop', tone: 'green', title: 'NEW LAPTOP, SAME LIBRARY', sub: 'Migrate rekordbox without losing cues' },
];

// Brand tokens, copied from global.css. If those change, change these.
const BG = '#0a0a0b';
const RED = '#ff4d2e';
const GREEN = '#3ad884';
const TEXT = '#f3f1ec';
const DIM = '#8a867c';

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const b64 = (p) => fs.readFileSync(path.join(ROOT, 'public', p)).toString('base64');
const ARCHIVO = b64('fonts/archivo-latin-wght-normal.woff2');
const INTER = b64('fonts/inter-latin-wght-normal.woff2');

// The title has to fit two lines at 1200x630 whatever its length, so the size
// steps down with the character count instead of being one guessed value.
const titleSize = (t) => (t.length <= 14 ? 112 : t.length <= 20 ? 100 : t.length <= 26 ? 88 : 78);

const page = (c) => {
  const accent = c.tone === 'red' ? RED : GREEN;
  return `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:'Archivo';font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${ARCHIVO}) format('woff2-variations');}
@font-face{font-family:'Inter';font-weight:100 900;font-display:block;src:url(data:font/woff2;base64,${INTER}) format('woff2-variations');}
*{margin:0;padding:0;box-sizing:border-box}
body{width:1200px;height:630px;background:${BG};font-family:Inter,sans-serif;position:relative;overflow:hidden}
.bar{position:absolute;left:0;top:0;width:12px;height:100%;background:${accent}}
.pad{position:absolute;left:60px;right:70px;top:0;height:100%}
.brand{display:flex;align-items:center;gap:14px;margin-top:56px}
.dot{width:16px;height:16px;border-radius:50%;background:${RED};flex:0 0 auto}
.name{font-family:Archivo;font-weight:900;font-size:31px;letter-spacing:-0.02em;color:${TEXT};text-transform:uppercase;white-space:nowrap}
.name .ac{color:${RED}}
.dom{font-family:Inter;font-weight:400;font-size:22px;color:${DIM};margin-top:8px;margin-left:30px}
.title{font-family:Archivo;font-weight:900;font-size:${titleSize(c.title)}px;line-height:0.98;letter-spacing:-0.02em;color:${accent};text-transform:${c.cased ? 'none' : 'uppercase'};position:absolute;top:190px;left:0;right:0}
.foot{position:absolute;bottom:56px;left:0;right:0}
.k{font-family:Inter;font-weight:400;font-size:33px;color:${TEXT};margin-bottom:12px}
.s{font-family:Inter;font-weight:400;font-size:22px;color:${DIM}}
</style></head><body>
<div class="bar"></div>
<div class="pad">
  <div class="brand"><span class="dot"></span><span class="name">Save My <span class="ac">Gig</span></span></div>
  <div class="dom">savemygig.com</div>
  <div class="title">${esc(c.title)}</div>
  <div class="foot"><div class="k">${esc(c.sub)}</div>
  <div class="s">Free emergency guides for DJs, no account, no ads in the flow</div></div>
</div>
</body></html>`;
};

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { const r = createRequire('/opt/node-tools/'); ({ chromium } = r('playwright')); }

const browser = await chromium.launch();
const page1 = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
const outDir = path.join(ROOT, 'public', 'og');

for (const c of CARDS) {
  const file = path.join(outDir, `${c.slug}.png`);
  if (!fs.existsSync(file)) { console.error(`  MISSING TARGET ${c.slug}.png, skipped`); continue; }
  await page1.setContent(page(c), { waitUntil: 'load' });
  await page1.evaluate(() => document.fonts.ready);
  await page1.screenshot({ path: file });
  console.log(`  ${c.tone.padEnd(5)} ${c.slug}.png`);
}
await browser.close();

// Every generated card must correspond to a real article, and every article's
// card must be generated. A card for a deleted article is dead weight; an
// article whose card was forgotten ships the wrong image to every share.
const onDisk = fs.readdirSync(outDir).filter((f) => f.endsWith('.png')).map((f) => f.replace('.png', '')).sort();
const generated = CARDS.map((c) => c.slug).sort();
const missing = onDisk.filter((s) => !generated.includes(s));
const extra = generated.filter((s) => !onDisk.includes(s));
console.log(`\nGenerated ${CARDS.length} cards.`);
if (missing.length || extra.length) {
  console.error('OG card set MISMATCH');
  missing.forEach((s) => console.error(`  on disk but not generated: ${s}`));
  extra.forEach((s) => console.error(`  generated but not on disk: ${s}`));
  process.exit(1);
}
console.log('OG card set PASS (every card on disk is generated from this file)');
