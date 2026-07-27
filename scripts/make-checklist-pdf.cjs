/**
 * Generates the downloadable one-page pre-gig checklist PDF.
 * On-brand (Editorial, dark), savemygig.com on it, hand-tick boxes.
 * Item lists MUST stay in sync with src/pages/checklist.astro.
 * Output: public/downloads/save-my-gig-pre-gig-checklist.pdf
 *
 * Run: node scripts/make-checklist-pdf.cjs
 */
const fs = require('fs');
const path = require('path');
const pw = require('/opt/node-tools/node_modules/playwright');
const { chromium } = pw;

const groups = [
  { id: 'basics', title: 'The basics', items: [
    { b: 1, t: 'Two identical USB drives, same export on both' },
    { b: 1, t: 'Headphones' },
    { b: 1, t: 'Phone charged, plus a power bank' },
    { b: 1, t: 'Cash and cards' },
    { b: 1, t: 'Venue address and set time confirmed' },
    { b: 0, t: 'Promoter or club contact saved in your phone' },
    { b: 0, t: 'Your name confirmed on the guest list' },
    { b: 0, t: 'Transport home sorted: parking, ride, or last train' },
    { b: 0, t: 'Running order: when you go on and come off' },
    { b: 0, t: 'A watch you can read in a dark booth' },
    { b: 0, t: 'A pen, for guest lists and split sheets' },
  ]},
  { id: 'technical', title: 'Technical', items: [
    { b: 1, t: 'Both drives FAT32 with MBR, not exFAT or GPT' },
    { b: 1, t: 'Re-exported after the last library change' },
    { b: 1, t: 'No updates today: rekordbox, firmware and OS stay as they are' },
    { b: 1, t: 'Both drives tested on a player, or in Rekordbox' },
    { b: 1, t: 'Rekordbox library backed up to cloud or a 2nd drive' },
    { b: 1, t: 'Emergency Card saved on your phone' },
    { b: 0, t: 'USB-C and USB-A adapters for the booth' },
    { b: 0, t: 'Spare cable and a short USB extension' },
    { b: 0, t: 'Laptop, charger and soundcard, if you use one' },
    { b: 0, t: 'A third backup drive, or an SD card copy' },
    { b: 0, t: 'Drives labelled A and B' },
    { b: 0, t: 'Export matches the club CDJ library format' },
    { b: 0, t: 'A cloud link to your set you can grab at the venue' },
    { b: 0, t: 'A small multitool or screwdriver' },
  ]},
  { id: 'extras', title: 'Extras and add-ons', items: [
    { b: 1, t: 'Any medicine you need' },
    { b: 1, t: 'Right clothes for the venue, plus a spare shirt' },
    { b: 1, t: 'Car keys' },
    { b: 1, t: 'Home keys' },
    { b: 1, t: 'ID and documents, passport if flying' },
    { b: 0, t: 'Earplugs' },
    { b: 0, t: 'Water bottle' },
    { b: 0, t: 'Deodorant and a small towel' },
    { b: 0, t: 'Snacks for a long night' },
    { b: 0, t: 'Hotel address saved offline, if staying over' },
    { b: 0, t: 'A travel adapter, if playing abroad' },
    { b: 0, t: 'Someone to call who can bring a forgotten item' },
  ]},
];

const byId = Object.fromEntries(groups.map((g) => [g.id, g]));
const cat = (g) => `
  <section class="cat">
    <div class="cat-head"><span class="tick"></span><h2>${g.title}</h2></div>
    <ul>
      ${g.items.map((i) => `<li class="${i.b ? 'ess' : ''}"><span class="box"></span><span>${i.t}</span></li>`).join('')}
    </ul>
  </section>`;

const html = `<!doctype html>
<html lang="en"><head><meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Inter:wght@400;500;600;700&display=swap" />
<style>
  @page { size: A4; margin: 0; }
  * { margin: 0; padding: 0; box-sizing: border-box; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  /* Print-friendly: white background, ink-light, readable in B&W or colour. */
  html, body { background: #ffffff; color: #14110e; font-family: 'Inter', Arial, sans-serif; }
  .page { width: 210mm; height: 297mm; padding: 13mm 13mm 10mm; display: flex; flex-direction: column; }
  .top { display: flex; justify-content: space-between; align-items: flex-end; border-bottom: 2px solid #14110e; padding-bottom: 9px; margin-bottom: 12px; }
  .brand { font-weight: 700; font-size: 10px; letter-spacing: 0.22em; text-transform: uppercase; color: #d9381a; margin-bottom: 6px; }
  h1 { font-family: 'Archivo', 'Arial Black', sans-serif; font-weight: 900; font-size: 30px; line-height: 0.98; letter-spacing: -0.02em; text-transform: uppercase; color: #14110e; }
  h1 .a { color: #d9381a; }
  .url { text-align: right; }
  .url .u { font-family: 'Archivo', 'Arial Black', sans-serif; font-weight: 800; font-size: 15px; color: #14110e; }
  .url .s { font-size: 9.5px; color: #6b6b6b; margin-top: 3px; }
  .lede { font-size: 12px; color: #5a5750; margin-bottom: 18px; }
  .lede b { color: #14110e; }
  .cols { display: grid; grid-template-columns: 1fr 1fr; column-gap: 12mm; flex: 1; align-content: start; }
  .col { display: flex; flex-direction: column; }
  .cat { margin-bottom: 20px; }
  .cat-head { display: flex; align-items: center; gap: 9px; margin-bottom: 9px; }
  .cat-head .tick { width: 14px; height: 3px; background: #d9381a; display: inline-block; }
  h2 { font-family: 'Archivo', 'Arial Black', sans-serif; font-weight: 800; font-size: 15px; text-transform: uppercase; letter-spacing: 0.01em; color: #14110e; }
  ul { list-style: none; }
  li { display: flex; align-items: flex-start; gap: 10px; padding: 5px 0; font-size: 12.3px; line-height: 1.34; color: #33302b; }
  li.ess { color: #14110e; font-weight: 700; }
  .box { flex: 0 0 auto; width: 14px; height: 14px; border: 1.5px solid #8a8681; border-radius: 2px; margin-top: 1.5px; }
  li.ess .box { border-color: #14110e; border-width: 2px; }
  .tip { border: 1px solid #d9d6d0; background: #f6f5f2; border-radius: 2px; padding: 13px 15px; margin-top: 4px; }
  .tip h3 { font-family: 'Archivo', 'Arial Black', sans-serif; font-weight: 800; font-size: 12px; text-transform: uppercase; color: #14110e; margin-bottom: 6px; }
  .tip h3 span { color: #d9381a; }
  .tip p { font-size: 11px; line-height: 1.45; color: #5a5750; }
  .notes { margin-top: 8px; }
  .notes .nlabel { font-family: 'Archivo', 'Arial Black', sans-serif; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.06em; color: #8a8681; margin-bottom: 12px; }
  .notes .rule { border-bottom: 1px solid #cfccc6; height: 26px; }
  .foot { border-top: 1px solid #d9d6d0; padding-top: 9px; margin-top: 12px; display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; color: #8a8681; }
  .foot .fu { color: #d9381a; font-weight: 700; letter-spacing: 0.04em; }
</style></head>
<body>
  <div class="page">
    <div class="top">
      <div>
        <div class="brand">Save My Gig</div>
        <h1>Pre-Gig<br /><span class="a">Checklist</span></h1>
      </div>
      <div class="url">
        <div class="u">savemygig.com</div>
        <div class="s">Free DJ rescue and prevention</div>
      </div>
    </div>
    <p class="lede">Tick it before you leave. <b>Bold items are the must-brings</b>, the rest is the full kit. Print it, fold it, keep it in your USB case.</p>
    <div class="cols">
      <div class="col">
        ${cat(byId.basics)}
        ${cat(byId.extras)}
      </div>
      <div class="col">
        ${cat(byId.technical)}
        <div class="tip">
          <h3>The <span>four</span> that prevent most disasters</h3>
          <p>Two identical drives. FAT32 with MBR. Re-exported and tested before you leave. Library backed up. Do these four and the rest is comfort.</p>
        </div>
      </div>
    </div>
    <div class="notes">
      <div class="nlabel">Notes: venue, load-in, contact, set time</div>
      <div class="rule"></div>
      <div class="rule"></div>
    </div>
    <div class="foot">
      <span>Something already failed at the booth? Open <span class="fu">savemygig.com</span> on your phone.</span>
      <span>savemygig.com</span>
    </div>
  </div>
</body></html>`;

(async () => {
  const tmp = path.join('/tmp', 'checklist-pdf.html');
  fs.writeFileSync(tmp, html);
  const outDir = path.join(__dirname, '..', 'public', 'downloads');
  const out = path.join(outDir, 'save-my-gig-pre-gig-checklist.pdf');

  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] });
  const page = await browser.newContext().then((c) => c.newPage());
  await page.goto('file://' + tmp, { waitUntil: 'networkidle' });
  await page.waitForTimeout(600); // let webfonts settle
  await page.pdf({ path: out, printBackground: true, preferCSSPageSize: true });
  // also a PNG preview for review
  await page.setViewportSize({ width: 794, height: 1123 });
  await page.screenshot({ path: '/tmp/checklist-pdf-preview.png', fullPage: true });
  await browser.close();
  console.log('wrote', out, fs.statSync(out).size, 'bytes');
})().catch((e) => { console.error(e); process.exit(1); });
