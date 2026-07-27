/*
 * Discovery pool check. Two promises the rotating homepage placeholder makes:
 *  1. every suggested term actually returns results in the site's own search
 *     (suggesting a dead search teaches "this site has nothing"), and
 *  2. nothing duplicates the Popular fixes row directly above the box
 *     (Antonio's rule: the two lines must teach DIFFERENT territory).
 * Scoring below mirrors Search.astro exactly; if that changes, change this.
 * Run: node scripts/check-discovery.mjs dist
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { DISCOVERY } from '../src/data/discovery.js';

const dir = process.argv[2] || 'dist';
const docs = JSON.parse(await readFile(join(dir, 'search-index.json'), 'utf-8'));

// Keep in sync with the Popular fixes row in src/pages/index.astro.
const POPULAR = ['usb not recognized', 'playlists not showing', 'e-8302', 'export failed', 'exfat vs fat32'];

function score(doc, terms) {
  const t = (doc.t || '').toLowerCase();
  const h = (doc.h || []).join(' ').toLowerCase();
  const d = (doc.d || '').toLowerCase();
  const b = (doc.b || '').toLowerCase();
  let total = 0;
  for (const q of terms) {
    let hit = 0;
    if (t.includes(q)) hit += 12;
    if (h.includes(q)) hit += 8;
    if (d.includes(q)) hit += 4;
    if (b.includes(q)) hit += 2;
    if (!hit) return 0;
    total += hit;
  }
  return total;
}

const fails = [];
for (const [cat, terms] of Object.entries(DISCOVERY)) {
  for (const term of terms) {
    const parts = term.toLowerCase().split(/\s+/).filter(Boolean);
    const hits = docs.filter((d) => score(d, parts) > 0).length;
    // STRONG hit: every word appears in a title, section heading, or meta
    // description. A term that only matches buried body text ("Wi-Fi" did,
    // via one sentence) suggests a search that lands nowhere useful, and
    // Antonio called it: that teaches "this site has nothing". Body-only
    // matches no longer qualify a term for the rotation.
    const strong = docs.filter((d) => {
      const head = ((d.t || '') + ' ' + (d.h || []).join(' ') + ' ' + (d.d || '')).toLowerCase();
      return parts.every((q) => head.includes(q));
    }).length;
    if (hits === 0) fails.push(`${cat}: "${term}" returns NO results`);
    else if (strong === 0) fails.push(`${cat}: "${term}" matches only buried body text (no title/heading hit)`);
    if (POPULAR.includes(term.toLowerCase())) fails.push(`${cat}: "${term}" duplicates the Popular fixes row`);
    console.log(`${hits === 0 || strong === 0 ? 'FAIL' : 'ok  '} ${cat.padEnd(12)} "${term}" -> ${hits} hits, ${strong} strong`);
  }
}
if (fails.length) { console.log('\nDISCOVERY CHECK FAIL:\n' + fails.join('\n')); process.exit(1); }
console.log('\nDiscovery check PASS');
