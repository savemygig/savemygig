/*
 * Verifies the two things Antonio reported on the Custom checklist:
 *   1. The drag handle is a real 44x44 target and the arrow inside is clearly
 *      taller than it is wide, so it reads as an arrow rather than a smudge.
 *   2. Dragging across the list does NOT select text, while the rename input
 *      is still selectable.
 * Run: node scripts/test-checklist-drag.mjs dist
 */
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { createRequire } from 'node:module';

let chromium;
try { ({ chromium } = await import('playwright')); }
catch { chromium = createRequire('/opt/node-tools/')('playwright').chromium; }

const dir = process.argv[2] || 'dist';
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

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 900, height: 1000 } });
const fails = [];
const ok = (name, cond, detail = '') => {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
  if (!cond) fails.push(name);
};

await page.addInitScript(() => {
  localStorage.setItem('SMG_CHECKLIST_OPEN', JSON.stringify({ music: true, gear: true, personal: true, logistics: true, backups: true, technical: true, recovery: true, travel: true }));
});
await page.goto(base + '/checklist', { waitUntil: 'networkidle' });
await page.evaluate(() => {
  document.querySelector('#ck')?.remove();
  localStorage.setItem('SMG_UNLOCKED', '1');
});
await page.reload({ waitUntil: 'networkidle' });
await page.evaluate(() => document.querySelector('#ck')?.remove());

// Into Custom, then Edit, which is where handles appear.
await page.click('[data-mode-set="custom"]');
await page.waitForTimeout(400);
const editBtn = await page.$('#editBtn, [data-edit-toggle], .custom-toolbar .btn');
if (editBtn) { await editBtn.click(); await page.waitForTimeout(400); }

const handle = await page.$('.task-drag');
ok('drag handle exists in Custom + Edit', !!handle);

if (handle) {
  const box = await handle.boundingBox();
  ok('handle is at least 44x44', box.width >= 44 && box.height >= 44,
     `${Math.round(box.width)}x${Math.round(box.height)}`);

  const svg = await page.evaluate(() => {
    const s = document.querySelector('.task-drag svg');
    const r = s.getBoundingClientRect();
    return { w: Math.round(r.width), h: Math.round(r.height) };
  });
  // Bounds set by Antonio across three iterations: 16x16 square read as a
  // smudge, 24px tall shouted. The shape test (clearly taller than wide) is
  // what protects the "reads as an arrow" complaint; the size floor only
  // guards against regressing to the original square.
  ok('arrow is clearly taller than wide', svg.h > svg.w * 1.3, `${svg.w}x${svg.h}`);
  ok('arrow is tall enough to read as an arrow', svg.h >= 16 && svg.h <= 20, `${svg.h}px tall`);
}

// Selection: drag across two rows and confirm nothing gets selected.
const rows = await page.$$('li.task');
ok('list has rows to test', rows.length >= 2, `${rows.length} rows`);
if (rows.length >= 2) {
  const a = await rows[0].boundingBox();
  const b = await rows[1].boundingBox();
  await page.mouse.move(a.x + 60, a.y + a.height / 2);
  await page.mouse.down();
  await page.mouse.move(b.x + 220, b.y + b.height / 2, { steps: 12 });
  await page.mouse.up();
  const sel = await page.evaluate(() => (window.getSelection() || {}).toString?.() || '');
  ok('dragging across rows selects no text', sel.trim() === '', sel ? `selected: "${sel.slice(0, 40)}"` : 'nothing selected');
}

// The rename input must be VISIBLY LARGE, not merely present. The checkbox
// hider (.task input) once crushed it to 16x8px: it held the text, took the
// keystrokes, and could not be seen. Playwright counts a 1px box as visible,
// which is how that shipped, so the assertion is now about real size.
{
  const editBtn2 = await page.$('#editToggle');
  if (editBtn2) {
    const pencil = await page.$('.task-edit');
    if (pencil) {
      await pencil.click();
      await page.waitForTimeout(200);
      const box2 = await page.evaluate(() => {
        const i = document.querySelector('.task-label-edit');
        if (!i) return null;
        const r = i.getBoundingClientRect();
        return { w: Math.round(r.width), h: Math.round(r.height), value: i.value,
                 selStart: i.selectionStart, len: i.value.length };
      });
      ok('rename input is really visible', !!box2 && box2.w >= 150 && box2.h >= 20,
         box2 ? `${box2.w}x${box2.h}` : 'no input');
      ok('rename keeps the text, cursor at the end',
         !!box2 && box2.value.length > 0 && box2.selStart === box2.len,
         box2 ? `"${box2.value.slice(0, 24)}...", cursor ${box2.selStart}/${box2.len}` : '');
      await page.keyboard.press('Escape');
    }
  }
}

// The rename input must stay selectable, or renaming breaks.
const inputSelectable = await page.evaluate(() => {
  const el = document.createElement('input');
  el.className = 'task-label-edit';
  document.querySelector('li.task')?.appendChild(el);
  const v = getComputedStyle(el).webkitUserSelect || getComputedStyle(el).userSelect;
  el.remove();
  return v;
});
ok('rename input is still selectable', inputSelectable === 'text', `user-select: ${inputSelectable}`);

// ---- collapsed by default: a FRESH visitor (no stored state) sees the three
// group headers as the index, nothing expanded (Antonio's collapse doctrine).
{
  const freshPage = await browser.newPage({ viewport: { width: 900, height: 1000 } });
  await freshPage.goto(base + '/checklist', { waitUntil: 'networkidle' });
  const counts = await freshPage.evaluate(() => ({
    total: document.querySelectorAll('.task-group').length,
    collapsed: document.querySelectorAll('.task-group.collapsed').length,
  }));
  if (counts.total < 3 || counts.collapsed !== counts.total) {
    console.error(`FAIL  fresh visit starts collapsed  (${counts.collapsed}/${counts.total} collapsed)`);
    process.exit(1);
  }
  console.log(`PASS  fresh visit starts collapsed  (${counts.collapsed}/${counts.total} groups)`);
  await freshPage.close();
}

await browser.close();
server.close();
if (fails.length) { console.log(`\nCHECKLIST DRAG FAIL: ${fails.join(', ')}`); process.exit(1); }
console.log('\nPASS: drag handle and selection behave correctly');
