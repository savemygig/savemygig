/*
 * Measures whether all three homepage doors are FULLY visible on load, on real
 * phone viewports, with the browser URL bar expanded (first load).
 *
 * The standing rule: all three doors readable on load on every phone. This
 * script exists because that rule has been broken twice by changes that looked
 * harmless on a desktop screenshot.
 *
 * SECOND SECTION, 2026-08-05: THE FIVE /emergency DOORS. Same rule, harder
 * page. The triage screen's five doors ARE the page, and the fifth one
 * (rekordbox export failed) had drifted below the fold: 17px over in English,
 * 50px in Spanish, 71px in Portuguese, because the translated h1 wraps to two
 * lines. Nothing caught it, because this script only ever looked at "/".
 * A door a DJ cannot see is a door they do not know exists.
 *
 * AND THAT SENTENCE WAS STILL TRUE OF THIS SCRIPT'S OWN FIRST SECTION UNTIL
 * 2026-08-06. The /emergency section was taught to loop three languages
 * BECAUSE a translated string broke the fold, and the homepage section, ten
 * lines above it, was left looking at "/" and nothing else. So the gate exited
 * 0 while the Portuguese homepage had its third door 3px below the fold at
 * 360x632, and while the middle door's title wrapped to two lines in pt and es
 * at three separate viewport widths. The homepage section now runs the same
 * device list against /, /pt and /es.
 *
 * The fifth time this project shipped something because a check looked at one
 * language. The rule that follows from that, for anything added here later:
 * a check that names a path is a check that will be wrong the next time the
 * site gains a language. Loop LANGS.
 *
 * THIRD ASSERTION, same date: THE DOOR TITLE HOLDS ONE LINE. It is not enough
 * for the three doors to fit vertically. A wrapped title makes its door taller
 * than the other two and breaks the row of three into something that reads as
 * a mistake, and it is exactly the failure a translation causes and English
 * never shows. Counted with a Range over the title's contents, because a block
 * element returns a single client rect however many lines it holds and every
 * height-based line count on this site has been wrong at least once.
 *
 * NOTE ON VIEWPORT CONVENTION, because the two sections differ deliberately.
 * The homepage section subtracts URL_BAR from the device height, so its
 * numbers describe a real first load with the address bar expanded. The
 * /emergency section uses the quoted size AS the viewport, because those are
 * the numbers the Aug 5 audit measured and reported ("17px over at 390x844")
 * and a gate that silently means something else by the same figure is worse
 * than no gate. Do not "harmonise" these without re-deriving the thresholds.
 *
 * Run: node scripts/fold-check.mjs dist
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const dir = process.argv[2] || 'dist';

// Real devices, with the first-load URL bar taking about 108px of height.
const URL_BAR = 108;
const DEVICES = [
  { name: 'iPhone SE',        w: 375, h: 667 },
  { name: 'iPhone 13 mini',   w: 375, h: 812 },
  { name: 'Galaxy S23',       w: 360, h: 780 },
  { name: 'iPhone 15/16',     w: 393, h: 852 },
  { name: 'Pixel 8',          w: 412, h: 915 },
  { name: 'iPhone 16 Pro Max',w: 430, h: 932 },
];

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.png': 'image/png',
  '.webp': 'image/webp', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
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

// The three homepages. Same device list, same assertions, one per language.
const LANGS = [
  { path: '/',    lang: 'en' },
  { path: '/pt',  lang: 'pt' },
  { path: '/es',  lang: 'es' },
];

const browser = await chromium.launch();
let worst = Infinity;
let worstAt = '';
const fails = [];
const wraps = [];

for (const { path, lang } of LANGS) {
  for (const d of DEVICES) {
    const visible = d.h - URL_BAR;
    const page = await browser.newPage({ viewport: { width: d.w, height: visible } });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelector('#ck')?.remove());
    const m = await page.evaluate(() => {
      const doors = [...document.querySelectorAll('.door')];
      return doors.map((el) => {
        const r = el.getBoundingClientRect();
        const t = el.querySelector('.door-title');
        // ONE RECT PER VISUAL LINE. A Range over the text nodes, never the
        // element's own box: .door-title is display:block, so its own
        // getClientRects() is always length 1 and its height/line-height ratio
        // has rounded a one-line title up to two on this site before.
        let lines = 1, widest = 0;
        if (t) {
          const rg = document.createRange();
          rg.selectNodeContents(t);
          const rects = [...rg.getClientRects()].filter((x) => x.width > 0.5);
          lines = rects.length;
          widest = Math.round(Math.max(...rects.map((x) => x.width)));
        }
        return {
          title: t ? t.textContent.trim() : '?',
          bottom: Math.round(r.bottom),
          lines,
          widest,
          avail: t ? Math.round(t.getBoundingClientRect().width) : 0,
          fontPx: t ? Math.round(parseFloat(getComputedStyle(t).fontSize) * 100) / 100 : 0,
        };
      });
    });
    await page.close();

    // Three doors, always. A missing door would otherwise make this check pass
    // by having less to fit, the same trap the /emergency section guards.
    if (m.length !== 3) {
      fails.push(`${path} ${d.name}: expected 3 doors, found ${m.length}`);
      console.log(`FAIL ${(lang + ' ' + d.name).padEnd(22)} only ${m.length} doors`);
      continue;
    }

    const last = m[m.length - 1];
    const slack = visible - last.bottom;
    if (slack < worst) { worst = slack; worstAt = `${lang} ${d.name}`; }
    const cut = slack < 0;
    if (cut) fails.push(`${path} ${d.name} ${d.w}x${d.h}: "${last.title}" cut off by ${-slack}px`);

    const wrapped = m.filter((x) => x.lines > 1);
    for (const x of wrapped) {
      wraps.push(
        `${path} ${d.w}x${visible}: "${x.title}" wraps to ${x.lines} lines ` +
        `(${x.fontPx}px, needs more than the ${x.avail}px it has)`
      );
    }

    console.log(
      `${cut || wrapped.length ? 'FAIL' : 'ok  '} ${(lang + ' ' + d.name).padEnd(22)} ${d.w}x${d.h} ` +
      `visible=${visible}px  lastDoorBottom=${last.bottom}px  slack=${slack >= 0 ? '+' : ''}${slack}px  ` +
      `titles=${m.map((x) => x.lines).join('/')}line${wrapped.length ? ' <<< WRAPPED' : ''}`
    );
  }
}

console.log(`\nTightest device has ${worst >= 0 ? '+' : ''}${worst}px of room below the last door (${worstAt}).`);

// ---------------------------------------------------------------------------
// THE DOOR TITLE HOLDS ONE LINE, ACROSS THE WIDTH BAND, IN ALL THREE LANGUAGES.
//
// This is a SECOND pass on purpose, at a DIFFERENT height, and the reason is
// the whole bug. The title's size comes from a width-keyed ramp,
// clamp(1.14rem, calc(7.2vw - 6.5px), 1.4rem), which is overridden to a fixed
// 1.2rem on any viewport 700px tall or less. Every device above subtracts a
// 108px URL bar, which puts five of the six under that 700px line, so the loop
// above only ever exercised the SMALL fixed size and could not see the ramp at
// all. The ramp is what overflowed: "RESOLVER PROBLEMA" wrapped at 19.42px in
// pt and es and English never did.
//
// The URL bar collapses the moment a DJ scrolls, and on Android it collapses
// and re-lays-out the page. So the tall viewport is not a hypothetical, it is
// the second half of every session, and it is where the type is largest.
//
// Stepped every 10px rather than only at device widths because the failure is
// JAGGED, not a threshold: glyph advances round, so at the shipped ramp 368 and
// 376 fitted while 360, 364 and 380 did not, all within 2px of each other. A
// check that samples six widths would have called that fixed. It samples the
// band the site supports instead, and 360 is included because it is the common
// budget Android and Brazil.
// ---------------------------------------------------------------------------
console.log('');
const TITLE_WIDTHS = [];
for (let w = 360; w <= 430; w += 10) TITLE_WIDTHS.push(w);
const TALL = 900; // URL bar collapsed: the ramp's largest value at each width

for (const { path, lang } of LANGS) {
  const row = [];
  for (const w of TITLE_WIDTHS) {
    const page = await browser.newPage({ viewport: { width: w, height: TALL } });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.querySelector('#ck')?.remove());
    const m = await page.evaluate(() => {
      const out = [];
      for (const t of document.querySelectorAll('.door-title')) {
        const rg = document.createRange();
        rg.selectNodeContents(t);
        const rects = [...rg.getClientRects()].filter((x) => x.width > 0.5);
        out.push({
          title: t.textContent.trim(),
          lines: rects.length,
          widest: Math.round(Math.max(...rects.map((x) => x.width))),
          avail: Math.round(t.getBoundingClientRect().width),
          fontPx: Math.round(parseFloat(getComputedStyle(t).fontSize) * 100) / 100,
        });
      }
      return out;
    });
    await page.close();

    const wrapped = m.filter((x) => x.lines > 1);
    for (const x of wrapped) {
      wraps.push(
        `${path} ${w}x${TALL}: "${x.title}" wraps to ${x.lines} lines at ${x.fontPx}px, ` +
        `widest line ${x.widest}px in a ${x.avail}px column`
      );
    }
    // Headroom of the LONGEST title at this width, so the report says how close
    // the next translation is allowed to get rather than only pass or fail.
    const tightest = m.reduce((a, b) => (a.avail - a.widest <= b.avail - b.widest ? a : b));
    const head = tightest.avail - tightest.widest;
    row.push(`${w}:${tightest.fontPx}px/${wrapped.length ? 'WRAP' : (head >= 0 ? '+' : '') + head}`);
  }
  console.log(`${row.some((x) => x.includes('WRAP')) ? 'FAIL' : 'ok  '} ${lang} door titles, URL bar collapsed  ${row.join('  ')}`);
}

if (wraps.length) console.log('\nFOLD CHECK FAIL, wrapped door titles:\n' + wraps.join('\n'));
if (fails.length) console.log('FOLD CHECK FAIL:\n' + fails.join('\n'));
if (!fails.length && !wraps.length) {
  console.log('\nPASS: three doors fit, and every door title holds one line at every width from 360 to 430, in en, pt and es');
}
fails.push(...wraps);

// ---------------------------------------------------------------------------
// THE FIVE /emergency DOORS, in all three languages.
//
// Two tiers, because "fully visible on the tightest phone in Brazil" and
// "fully visible on a current iPhone" are different promises and only one of
// them is keepable without shrinking the door type below what the homepage
// doors use (which is the line we do not cross: .pad-title is 17px and stays
// there).
//
//   full    every one of the five pads entirely inside the viewport
//   top     the FIFTH pad's TOP edge inside the viewport, so it is visibly
//           there and discoverable even though it needs a short scroll
// ---------------------------------------------------------------------------
const EMERGENCY = [
  { path: '/emergency',    lang: 'en' },
  { path: '/pt/emergency', lang: 'pt' },
  { path: '/es/emergency', lang: 'es' },
];
const EMERGENCY_VIEWPORTS = [
  { w: 390, h: 844, rule: 'full' },   // iPhone 14/15/16
  { w: 430, h: 932, rule: 'full' },   // iPhone Pro Max
  { w: 360, h: 740, rule: 'top'  },   // the common budget Android, and Brazil
];

console.log('');
const eFails = [];
let eWorst = Infinity;

for (const { path, lang } of EMERGENCY) {
  for (const { w, h, rule } of EMERGENCY_VIEWPORTS) {
    const page = await browser.newPage({ viewport: { width: w, height: h } });
    await page.goto(base + path, { waitUntil: 'networkidle' });
    // The consent banner is already suppressed on this page, but a stray one
    // would invalidate the measurement, so this is belt and braces and it
    // also keeps the two sections measuring the same thing.
    await page.evaluate(() => document.querySelector('#ck')?.remove());
    const m = await page.evaluate(() => {
      const pads = [...document.querySelectorAll('.pad-grid > .pad')];
      return {
        count: pads.length,
        titleFontPx: pads.length
          ? parseFloat(getComputedStyle(pads[0].querySelector('.pad-title')).fontSize) : 0,
        last: pads.length ? (() => {
          const r = pads[pads.length - 1].getBoundingClientRect();
          const t = pads[pads.length - 1].querySelector('.pad-title');
          return { top: Math.round(r.top), bottom: Math.round(r.bottom), title: t ? t.textContent.trim() : '?' };
        })() : null,
      };
    });
    await page.close();

    // Five doors, always. A missing door is a worse bug than a door below the
    // fold and would otherwise make this check pass by having less to fit.
    if (m.count !== 5) {
      eFails.push(`${path} ${w}x${h}: expected 5 doors, found ${m.count}`);
      console.log(`FAIL ${(path + ' ' + w + 'x' + h).padEnd(28)} only ${m.count} doors`);
      continue;
    }
    // The type floor. .pad-title must never be shrunk to win this check; the
    // fix is always air, never size. 17px is the shipped value.
    if (m.titleFontPx < 17) {
      eFails.push(`${path} ${w}x${h}: .pad-title shrunk to ${m.titleFontPx}px, floor is 17px`);
    }

    const measure = rule === 'full' ? m.last.bottom : m.last.top;
    const slack = h - measure;
    const bad = slack < 0;
    if (rule === 'full') eWorst = Math.min(eWorst, slack);
    if (bad) {
      eFails.push(rule === 'full'
        ? `${path} ${w}x${h}: fifth door "${m.last.title}" cut off by ${-slack}px`
        : `${path} ${w}x${h}: fifth door "${m.last.title}" starts ${-slack}px below the fold, not discoverable`);
    }
    console.log(
      `${bad ? 'FAIL' : 'ok  '} ${(path + ' ' + w + 'x' + h).padEnd(28)} ` +
      `${rule === 'full' ? 'fifthBottom=' + m.last.bottom : 'fifthTop=' + m.last.top}px  ` +
      `title=${m.titleFontPx}px  slack=${slack >= 0 ? '+' : ''}${slack}px  (${rule})`
    );
  }
}

await browser.close();
server.close();

console.log(`\nTightest FULL-visibility case has ${eWorst >= 0 ? '+' : ''}${eWorst}px below the fifth /emergency door.`);
if (eFails.length) { console.log('FOLD CHECK FAIL:\n' + eFails.join('\n')); }
else console.log('PASS: all five emergency doors clear the fold in en, pt and es');

if (fails.length || eFails.length) process.exit(1);
