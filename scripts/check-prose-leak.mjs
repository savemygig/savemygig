#!/usr/bin/env node
/*
 * ENGLISH PROSE MUST NOT LEAK INTO A TRANSLATED PAGE. Added 2026-08-08.
 *
 * WHAT WENT WRONG, and it was my instruction that caused it. facts.js is the single
 * source of truth for every specification, and it is language neutral for numbers,
 * versions and URLs. It is NOT language neutral for the prose fields, and there are
 * roughly forty of them: masterUnityPosition, soundcardSpec, channelsDetail,
 * headshellWiring, antiSkatingInstruction, platterMarkings, media, variants and
 * more. The /pt and /es model pages interpolate those values verbatim, so raw
 * English lands mid-sentence inside a Portuguese or Spanish paragraph.
 *
 * When I briefed the translation work I told the agents, in writing, to leave every
 * facts.js interpolation exactly as it was because "those field values are English
 * strings and that is expected". For versions and file systems that is right. For
 * a sentence it is not, and the result was a Portuguese booth briefing that reads
 * "a unidade do master fica around 3 o'clock, which is 8 on the dial", and a
 * Xone:92 master level fix where the corrective INSTRUCTION is only in English.
 *
 * WHY check-i18n DID NOT CATCH IT. That check guards hreflang, canonicals and
 * English LINK leaks. A leaked link is a URL; this is prose, so nothing looked at
 * it. The firmware matrix pages already solved exactly this problem, with per
 * language SYMPTOM and AREA maps and check-firmware-i18n to enforce them. The
 * mechanism existed. It had simply never been applied to the model pages.
 *
 * HOW THIS DETECTS IT. English function words are the giveaway: a Portuguese or
 * Spanish sentence never contains "which is", "with no", "switchable to". Matching
 * on function-word PHRASES rather than single words avoids the false positives that
 * single words would produce, since "no", "a" and "and" all exist in one or both
 * target languages, and product names legitimately contain English nouns.
 *
 * READ ONLY, and it reads the BUILT page because the leak only becomes visible
 * after interpolation.
 */

import fs from 'node:fs';
import path from 'node:path';

const DIST = process.argv[2] || 'dist';
let failed = 0;

/*
 * Phrases that cannot occur in Brazilian Portuguese or neutral Latin American
 * Spanish prose. Each is multi-word on purpose. Anything that could plausibly be a
 * product name, a control label or a shared technical term is excluded, which is
 * why this list is short: it is built for zero false positives rather than for
 * coverage, and one hit is enough to prove a field leaked.
 */
const ENGLISH_PHRASES = [
  'which is', 'with no', 'switchable to', 'switchable pre or post',
  'instead of', 'as well as', 'each with', 'rather than',
  'is left positive', 'is right positive',
  'at the same value', 'to the same value',
  'on the top panel for', 'on the rear for',
  'and no disc drive', 'no SD card slot and',
  'wide,', 'deep,', 'high,',
  'switched on', 'in black, and the',
  'or later as', 'by default, switchable',
  'stereo in and', 'stereo out at',
  'channels with', 'returns.',
  'at the outer groove', 'direct reading',
  'buttons together', 'while the platter is turning',
  'for torque and', 'for brake',
  'with the average around', 'and the loudest peaks',
  'per cent', 'plus or minus',
];

// Model names, control labels and vendor strings that legitimately contain
// English and must never be flagged.
const ALLOWED = [
  'Device Library', 'OneLibrary', 'Device Library Plus', 'rekordbox',
  'Save My Gig', 'DJ Booth Intelligence', 'Emergency Mode',
  'MASTER INSERT RETURN', 'USB STOP', 'MASTER TEMPO', 'PRO DJ LINK',
  'START-STOP', 'LFO FORM', 'WAKE UP', 'CLUB SETUP', 'SOUND COLOR FX',
  'BEAT FX', 'Beat FX', 'MASTER REC', 'TRACK FILTER', 'HOT CUE', 'HOT LOOP',
  'Serato DJ Pro', 'Engine DJ', 'Stagehand', 'ShowKontrol',
];

function mainText(html) {
  const m = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
  let body = m ? m[1] : html;
  body = body.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '');
  let t = body.replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&amp;/g, '&');
  for (const a of ALLOWED) t = t.split(a).join(' ');
  return t.replace(/\s+/g, ' ');
}

const walk = (dir) => (fs.existsSync(dir) ? fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
  const p = path.join(dir, e.name);
  return e.isDirectory() ? walk(p) : p.endsWith('.html') ? [p] : [];
}) : []);

const byPage = new Map();
for (const lang of ['pt', 'es']) {
  for (const file of walk(path.join(DIST, lang, 'knowledge'))) {
    const text = mainText(fs.readFileSync(file, 'utf8'));
    const hits = [];
    for (const phrase of ENGLISH_PHRASES) {
      let i = text.indexOf(phrase);
      while (i !== -1) {
        hits.push({ phrase, context: text.slice(Math.max(0, i - 55), i + phrase.length + 45).trim() });
        i = text.indexOf(phrase, i + phrase.length);
      }
    }
    if (hits.length) byPage.set(file, hits);
  }
}

if (byPage.size === 0) {
  console.log('English prose leak check PASS (no untranslated English prose in any /pt or /es knowledge page)');
  process.exit(0);
}

const ranked = [...byPage.entries()].sort((a, b) => b[1].length - a[1].length);
let total = 0;
for (const [file, hits] of ranked) {
  total += hits.length;
  failed++;
  console.error(`FAIL  ${file.replace(`${DIST}/`, '')}: ${hits.length} English prose fragment(s)`);
  for (const h of hits.slice(0, 3)) console.error(`        "${h.phrase}" in: ...${h.context}...`);
  if (hits.length > 3) console.error(`        and ${hits.length - 3} more`);
}
console.error(`\nEnglish prose leak check FAIL: ${total} fragment(s) across ${byPage.size} page(s).`);
console.error('\nfacts.js holds these as ENGLISH PROSE and the translated pages interpolate them');
console.error('verbatim. Give the field per-language values, or translate it through a map in the');
console.error('page the way the firmware matrix pages already do for their symptom strings.');
process.exit(1);
