/*
 * ONE-OFF ASSET GENERATOR, not part of the build.
 *   node scripts/make-panel-800.mjs
 *
 * Writes an 800px-wide sibling for each *-panel-full.webp so the lightbox can
 * offer a srcset instead of handing a phone the 1400px master. Committed as
 * static files in public/images, exactly like the masters and the thumbs, so a
 * Cloudflare Pages build needs no image pipeline and no new dependency: this
 * script exists so the assets are REPRODUCIBLE, not so they are regenerated.
 *
 * It uses `sharp`, which is present only as a transitive dependency of Astro.
 * That is fine for a tool run by hand and would not be fine in the build, which
 * is the other half of why the output is committed.
 *
 * Alpha is preserved deliberately: these panels are cut out on transparency (see
 * the .lightbox note in global.css about why they are not shown on white), so
 * flattening them would put a black or white box round every photo.
 */
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';
import { createRequire } from 'node:module';

const sharp = createRequire(import.meta.url)('sharp');
const DIR = 'public/images';
const WIDTH = 800;
// 82 lands within a few percent of the masters' bytes-per-pixel, so the two
// steps of the srcset look like the same photograph at the same quality.
const QUALITY = 82;

const files = (await readdir(DIR)).filter((f) => f.endsWith('-panel-full.webp'));
let before = 0;
let after = 0;
for (const f of files.sort()) {
  const src = join(DIR, f);
  const out = join(DIR, f.replace('-panel-full.webp', '-panel-800.webp'));
  const meta = await sharp(src).metadata();
  if (meta.width <= WIDTH) { console.log(`skip ${f}: already ${meta.width}px wide`); continue; }
  await sharp(src)
    .resize({ width: WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY, alphaQuality: 100 })
    .toFile(out);
  const a = (await stat(src)).size;
  const b = (await stat(out)).size;
  before += a; after += b;
  const m2 = await sharp(out).metadata();
  console.log(`${f}  ${meta.width}x${meta.height} ${(a / 1024).toFixed(1)}KB`
    + `  ->  ${out.split('/').pop()}  ${m2.width}x${m2.height} ${(b / 1024).toFixed(1)}KB`
    + `  alpha=${m2.hasAlpha}`);
}
console.log(`\n${files.length} masters ${(before / 1024).toFixed(1)}KB, `
  + `800px set ${(after / 1024).toFixed(1)}KB, `
  + `${(100 - (after / before) * 100).toFixed(1)}% smaller per image on average`);
