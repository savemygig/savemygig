#!/usr/bin/env node
/**
 * THE AUTOLINKER. Antonio's ruling, 2026-08-03:
 *
 *   "Every gear, every equipment, the Pioneer, the AlphaTheta, the software,
 *    the hardware, that has a brand and a model, and it's on our website, you
 *    should make the hyperlink go there internally. But if we are talking
 *    about any type of function like PRO DJ LINK or LAN connection or FAT32,
 *    MBR, since we don't have a specific page per item of this category, we
 *    send it to the dictionary."
 *
 * That is the concept registry's rule, applied to the whole site instead of
 * page by page. src/data/concepts.js already decides WHERE each term goes
 * (product -> its own page, concept -> its defining article or the dictionary
 * anchor). This script decides WHERE THE LINK IS PLACED, and nothing else.
 *
 * WHY A BUILD STEP AND NOT 199 HAND EDITS. Hand-linking is a one-time fix
 * that starts rotting with the next article somebody writes. This runs on
 * every build, so new content is linked the day it ships and the rule cannot
 * drift out of one page's memory.
 *
 * IT RUNS ON `dist`, AFTER astro build AND BEFORE build-search-index, so the
 * search index is generated from the same HTML the visitor receives.
 *
 * ------------------------------------------------------------------ THE RULES
 * Every one of these was a decision, not a default. Changing one changes the
 * reading experience of the whole site, so change them here and nowhere else.
 *
 * 1. FIRST MENTION PER PAGE, ONCE. "rekordbox" appears up to 40 times on a
 *    page. Linking all of them turns prose into a link farm, reads badly and
 *    looks spammy to a search engine. One link, the first time, then plain
 *    text.
 *
 * 2. THE RESCUE TUNNEL GETS NOTHING. /protocol/** is excluded outright,
 *    46 links that this script deliberately does not add. A DJ two minutes
 *    from a set who taps FAT32 out of curiosity has left the rescue. Antonio's
 *    standing ruling on the emergency flow is "do not auto-link everything, do
 *    not forbid links": links in the tunnel stay a deliberate editorial choice,
 *    one at a time, written by hand into emergency-tree.js.
 *
 * 3. LEGAL PAGES GET NOTHING. A privacy policy peppered with links to gear
 *    pages reads wrong and weakens the document.
 *
 * 4. A PAGE NEVER LINKS TO ITSELF. The CDJ-3000 page does not link the words
 *    "CDJ-3000" to the CDJ-3000 page.
 *
 * 5. AN EXISTING LINK TO THE SAME DESTINATION WINS. If an author already
 *    linked that term by hand, anywhere on the page, this adds nothing. Human
 *    editorial placement always beats the machine's.
 *
 * 6. NEVER INSIDE headings, existing links, code, buttons, summaries, SVG,
 *    script or style. Headings are excluded because a linked heading changes
 *    the page's visual hierarchy, and because heading text is what the search
 *    index scores highest.
 *
 * 7. LONGEST LABEL FIRST, so "CDJ-3000X" is matched before "CDJ-3000" and the
 *    more specific product always wins its own link.
 *
 * 8. WORD BOUNDARIES ONLY. "MBR" must not match inside another word.
 *
 * SAFETY: this walks HTML as a token stream and only ever rewrites TEXT
 * between tags. It never parses or rewrites tags, never touches attributes,
 * and cannot nest an <a> inside an <a>, which is the failure that would
 * silently break navigation.
 *
 * 10. LANGUAGE AWARE (2026-08-05, and it is a BUG FIX, not a feature).
 *     Every destination in the registry is an ENGLISH path, and until today
 *     this script injected them verbatim into the Portuguese and Spanish
 *     pages: about 415 links that took a Brazilian reader out of /pt and into
 *     English mid-sentence, the largest remaining English leak on the
 *     translated site. Every injected destination is now prefixed with the
 *     language of the page it lands on, derived from the OUTPUT PATH
 *     (dist/pt/... -> /pt), and prefixed only after checking the prefixed
 *     file really exists in dist. Where it does not, the English destination
 *     stands: a working link to the wrong language beats a 404 in the right
 *     one, and this way a page that has not been translated yet degrades
 *     instead of breaking.
 *
 *     The exclusion test in rule 2/3 STRIPS THE LANGUAGE PREFIX FIRST, which
 *     is the other half of the same bug. /protocol was excluded but
 *     /pt/protocol was not, so the translated rescue tunnel was getting the
 *     46 links the English tunnel is deliberately denied, and /pt/card and
 *     /es/card carried three links the English card did not. The tunnel must
 *     be link-free in every language: a DJ two minutes from a set does not
 *     become a browser because the page is in Portuguese.
 */

import fs from 'node:fs';
import path from 'node:path';
import { CONCEPTS, DICTIONARY } from '../src/data/concepts.js';
import { LANGS } from '../src/i18n/registry.js';

const DIST = process.argv[2] || 'dist';

// Rules 2 and 3. Utility and machine-facing pages are excluded too: they are
// not read as prose and a link in them is noise.
// These are ENGLISH paths. Rule 10: a page URL has its language prefix
// stripped before it is tested against them, so one entry covers all three
// languages and a new language is covered the day it ships.
const EXCLUDED_PREFIXES = ['/protocol', '/legal', '/404', '/offline', '/card', '/card-ready'];

// Rule 10. From the registry, so the day a fourth language lands it is
// covered without touching this file.
const LANG_PREFIXES = LANGS.map((l) => l.prefix).filter(Boolean);
/** The language prefix of a site path, or '' for English. */
const prefixOf = (url) => LANG_PREFIXES.find((p) => url === p || url.startsWith(p + '/')) || '';
/** A site path with its language prefix removed, i.e. the English path. */
const stripLang = (url) => {
  const p = prefixOf(url);
  return p ? (url.slice(p.length) || '/') : url;
};

// Rule 6.
const SKIP_TAGS = new Set(['a', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'code', 'pre', 'button', 'summary', 'svg', 'script', 'style', 'textarea', 'select', 'option', 'title']);

const destOf = (c) => (c.kind === 'product' ? c.page : (c.article || `${DICTIONARY}#${c.anchor}`));

// Rule 7: longest label first, across the whole vocabulary.
const VOCAB = CONCEPTS
  .flatMap((c) => [c.label, ...(c.aliases || [])].map((label) => ({ label, dest: destOf(c), key: c.key, kind: c.kind })))
  .sort((a, b) => b.label.length - a.label.length);

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function walk(dir, out = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (e.name.endsWith('.html')) out.push(p);
  }
  return out;
}

const urlOf = (file) =>
  '/' + path.relative(DIST, file).replace(/index\.html$/, '').replace(/\.html$/, '').replace(/\/$/, '');

// Rule 10. Does the built site actually have this page? build.format is
// 'file', so a page is foo.html, but index.html is checked too so the helper
// keeps working if that ever changes. Cached: this is asked once per
// (destination, language) pair, thousands of times over a full run.
const distHasCache = new Map();
const distHas = (p) => {
  const clean = p.replace(/\/$/, '');
  if (distHasCache.has(clean)) return distHasCache.get(clean);
  const yes = fs.existsSync(path.join(DIST, `${clean}.html`)) ||
              fs.existsSync(path.join(DIST, clean, 'index.html'));
  distHasCache.set(clean, yes);
  return yes;
};

// Counted at INJECTION time, not here: localizeDest is asked about every term
// in the vocabulary on every page, so counting it would report thousands of
// "prefixed destinations" for a few hundred actual links.
let localizedLinks = 0;
let englishFallbackLinks = 0;
const missingTranslations = new Set();

/**
 * Rule 10. An English registry destination, moved into `prefix`'s language,
 * but ONLY when that page exists. Fragments survive the move: the dictionary
 * anchors (#fat32, #mbr) are the same ids in all three languages because the
 * dictionary is generated from one term list.
 */
const localizeDest = (dest, prefix) => {
  if (!prefix) return dest;
  const [p, frag] = dest.split('#');
  if (!distHas(prefix + p)) {
    missingTranslations.add(prefix + p);
    return dest;
  }
  return prefix + p + (frag ? `#${frag}` : '');
};

let totalLinks = 0;
let pagesTouched = 0;
const perTerm = new Map();
const files = walk(DIST);

for (const file of files) {
  const url = urlOf(file) || '/';
  // Rule 10: the language prefix comes off BEFORE the exclusion test, so
  // /pt/protocol/usb/start is excluded exactly like /protocol/usb/start.
  const lang = prefixOf(url);
  const enUrl = stripLang(url);
  if (EXCLUDED_PREFIXES.some((p) => enUrl === p || enUrl.startsWith(p + '/'))) continue;

  const html = fs.readFileSync(file, 'utf8');

  // Only the article body. Everything outside <main> is chrome that repeats on
  // every page, and linking the nav or the footer would produce the same links
  // on all 107 pages.
  const mainStart = html.indexOf('<main');
  if (mainStart === -1) continue;
  const mainOpenEnd = html.indexOf('>', mainStart);
  const mainEnd = html.lastIndexOf('</main>');
  if (mainOpenEnd === -1 || mainEnd === -1 || mainEnd <= mainOpenEnd) continue;

  const head = html.slice(0, mainOpenEnd + 1);
  const body = html.slice(mainOpenEnd + 1, mainEnd);
  const tail = html.slice(mainEnd);

  // Rules 4, 5 and 10, decided per page before any rewriting. Rule 10 runs
  // FIRST: rules 4 and 5 both compare a destination against this page's own
  // URL and its own existing hrefs, and on a /pt page both of those are
  // prefixed. Testing the English destination against them would let the
  // Portuguese rekordbox page link the word "rekordbox" to itself.
  const available = VOCAB
    .map((v) => (lang ? { ...v, dest: localizeDest(v.dest, lang) } : v))
    .filter((v) => {
      const destPath = v.dest.split('#')[0];
      if (url === destPath) return false;                    // rule 4
      if (html.includes(`href="${v.dest}"`)) return false;   // rule 5
      return true;
    });
  if (!available.length) continue;

  const done = new Set();                                   // rule 1, per destination
  let added = 0;

  // A REAL SCANNER, NOT A SPLIT. The first version used
  // body.split(/(<[^>]+>)/), which desynchronises the moment a `>` appears
  // inside a quoted attribute or a bare `<` appears in text. On the firmware
  // page that produced
  //   <a href="/knowledge/pioneer-dj/<a href="...">rekordbox</a>#onelibrary">
  // a link injected INTO an href. Caught by the nested-anchor assertion below,
  // which is the entire reason that assertion exists.
  // This walks character by character, treats a tag as everything from `<` to
  // the matching `>` OUTSIDE quotes, and only ever rewrites text between tags.
  const out = [];
  const stack = [];
  const VOID = new Set(['br', 'img', 'input', 'hr', 'meta', 'link', 'source', 'path', 'circle', 'rect', 'use', 'col', 'area', 'embed', 'track', 'wbr']);
  let i = 0;

  // RULE 9: DENSITY. First-mention-per-page is not enough on its own. The FAQ
  // answer about drive formats names NTFS, exFAT, FAT32, GPT, MBR and
  // rekordbox in two lines, all legitimate first mentions, and linking every
  // one produced 5 links in 24 words on /fix/usb-not-recognized-cdj. That is a
  // link farm: it reads badly and it is what a search engine penalises.
  // So, per block (a p, li or td):
  //   at most MAX_PER_BLOCK links added, and
  //   nothing added at all if the block ALREADY holds that many links.
  // The second half protects the hand-built rows ("rekordbox reference ·
  // CDJ-3000X · CDJ-2000NXS2 ·  ...") which are deliberately dense and are not
  // this script's business.
  const BLOCK_TAGS = new Set(['p', 'li', 'td', 'dd', 'blockquote', 'figcaption']);
  const MAX_PER_BLOCK = 2;
  let blockLinks = 0;      // anchors seen in the current block, existing + added
  let blockDepth = 0;      // how deep we are inside the current block

  while (i < body.length) {
    const lt = body.indexOf('<', i);

    // ---- text run up to the next tag
    if (lt !== i) {
      const end = lt === -1 ? body.length : lt;
      let text = body.slice(i, end);

      if (text.trim() && !stack.some((t) => SKIP_TAGS.has(t))) {   // rule 6
        // ALL MATCHES ARE FOUND AGAINST THE ORIGINAL TEXT, THEN SPLICED ONCE.
        // Matching term-by-term against a string that previous terms had
        // already rewritten is what produced
        //   <a href="/knowledge/pioneer-dj/<a href="...">rekordbox</a>#onelibrary">
        // on the firmware page: "OneLibrary" linked first, then "rekordbox"
        // matched inside the href that insert had just created. Never search
        // markup you generated.
        const hits = [];
        for (const v of available) {
          if (done.has(v.dest)) continue;                          // rule 1
          // Rule 8. Boundaries are explicit rather than \b, which does not
          // behave around the hyphens and digits in CDJ-2000NXS2.
          const re = new RegExp(`(^|[^A-Za-z0-9-])(${esc(v.label)})(?![A-Za-z0-9-])`);
          const m = re.exec(text);
          if (!m) continue;
          const at = m.index + m[1].length;
          hits.push({ at, end: at + m[2].length, word: m[2], dest: v.dest, key: v.key });
        }

        // Rule 7 resolved positionally: earliest first, and where two terms
        // overlap (CDJ-3000 inside CDJ-3000X) the longer one already sorted
        // first in VOCAB, so it claims the span and the shorter is dropped.
        hits.sort((a, b) => a.at - b.at || (b.end - b.at) - (a.end - a.at));
        const kept = [];
        let cursor = -1;
        for (const h of hits) {
          if (h.at < cursor) continue;
          // Rule 9. Outside any block we allow the link (headings are already
          // excluded, so this is mostly bare text in a div).
          if (blockDepth > 0 && blockLinks >= MAX_PER_BLOCK) break;
          kept.push(h);
          cursor = h.end;
          if (blockDepth > 0) blockLinks++;
        }

        // Splice from the end so earlier offsets stay valid.
        for (let k = kept.length - 1; k >= 0; k--) {
          const h = kept[k];
          text = text.slice(0, h.at) + `<a href="${escHtml(h.dest)}">${h.word}</a>` + text.slice(h.end);
        }
        for (const h of kept) {
          done.add(h.dest);
          added++;
          perTerm.set(h.key, (perTerm.get(h.key) || 0) + 1);
          // Rule 10 accounting, on the links that actually shipped.
          if (lang) (prefixOf(h.dest) ? localizedLinks++ : englishFallbackLinks++);
        }
      }
      out.push(text);
      i = end;
      if (lt === -1) break;
    }

    // ---- comment, CDATA or doctype: copied verbatim, never scanned
    if (body.startsWith('<!--', i)) {
      const close = body.indexOf('-->', i);
      const end = close === -1 ? body.length : close + 3;
      out.push(body.slice(i, end));
      i = end;
      continue;
    }

    // ---- a tag: find the `>` that is NOT inside a quoted attribute value
    let j = i + 1;
    let quote = null;
    while (j < body.length) {
      const ch = body[j];
      if (quote) { if (ch === quote) quote = null; }
      else if (ch === '"' || ch === "'") quote = ch;
      else if (ch === '>') break;
      j++;
    }
    const tag = body.slice(i, Math.min(j + 1, body.length));
    out.push(tag);
    i = j + 1;

    const name = (tag.match(/^<\/?\s*([a-zA-Z0-9-]+)/) || [])[1]?.toLowerCase();
    if (name) {
      if (tag[1] === '/') {
        const idx = stack.lastIndexOf(name);
        if (idx !== -1) stack.splice(idx, 1);
        if (BLOCK_TAGS.has(name) && blockDepth > 0) { blockDepth--; if (!blockDepth) blockLinks = 0; }
      } else if (!tag.endsWith('/>') && !VOID.has(name)) {
        stack.push(name);
        // Rule 9 bookkeeping. A new block resets the budget; anchors already
        // inside it count against that budget.
        if (BLOCK_TAGS.has(name)) { if (!blockDepth) blockLinks = 0; blockDepth++; }
        else if (name === 'a' && blockDepth > 0) blockLinks++;
      }
    }
  }

  const rebuilt = out.join('');

  if (added) {
    fs.writeFileSync(file, head + rebuilt + tail);
    totalLinks += added;
    pagesTouched++;
  }
}

// ------------------------------------------------------------------ ASSERTIONS
// A silent autolinker is a liability: it edits every page in the site and
// nobody reads 107 diffs. These are the invariants that make it trustworthy.
const problems = [];

for (const file of walk(DIST)) {
  const url = urlOf(file) || '/';
  const html = fs.readFileSync(file, 'utf8');

  // Rules 2, 3 and 10 held. Same prefix-stripped test as the writer above:
  // if the two ever disagree, the checker skips pages the writer edited.
  const enUrl = stripLang(url);
  if (EXCLUDED_PREFIXES.some((p) => enUrl === p || enUrl.startsWith(p + '/'))) continue;

  // No nested anchors. This is the one failure that would break navigation
  // invisibly, so it is checked on the real output rather than trusted.
  const mainStart = html.indexOf('<main');
  if (mainStart === -1) continue;
  // Scripts, styles AND COMMENTS are stripped before counting. Both produced
  // false failures on the homepage:
  //   script  the search builds markup in JS strings ('<a href="/faq">FAQ</a>')
  //   comment a source note reads "it used to be an <a> styled as an input"
  // A naive count reads both as real anchors and reports a broken link on a
  // page that is fine. The scanner above already handles comments; this is
  // the checker catching up with it.
  const body = html
    .slice(mainStart, html.lastIndexOf('</main>'))
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<!--[\s\S]*?-->/g, '');
  let depth = 0;
  for (const tag of body.match(/<\/?a\b[^>]*>/g) || []) {
    if (tag.startsWith('</')) depth--;
    else depth++;
    if (depth > 1) { problems.push(`${url}: nested <a>`); break; }
    if (depth < 0) { problems.push(`${url}: unbalanced </a>`); break; }
  }

  // Rule 10 held. On a translated page, no anchor may point at an English
  // registry destination that HAS a translated page. This is checked on the
  // real output because the whole class of bug being fixed here was invisible
  // in the source: nothing in any .astro file said "/knowledge/dictionary",
  // this script put it there.
  if (prefixOf(url)) {
    const pre = prefixOf(url);
    for (const v of VOCAB) {
      const [p] = v.dest.split('#');
      if (!distHas(pre + p)) continue;                        // no translation, English is correct
      if (body.includes(`href="${v.dest}"`)) {
        problems.push(`${url}: links English ${v.dest} but ${pre}${p} exists`);
        break;
      }
    }
  }
}

const top = [...perTerm.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8);
console.log(`Autolink: ${totalLinks} links added across ${pagesTouched} pages`);
console.log(`  top terms: ${top.map(([k, n]) => `${k} ${n}`).join(', ')}`);
console.log(`  excluded: ${EXCLUDED_PREFIXES.join(' ')} (in every language)`);
console.log(`  language: ${localizedLinks} links prefixed, ${englishFallbackLinks} left English (no translated page)`);
if (missingTranslations.size) {
  console.log(`  no translated page for: ${[...missingTranslations].sort().slice(0, 6).join(' ')}${missingTranslations.size > 6 ? ` (+${missingTranslations.size - 6})` : ''}`);
}

if (problems.length) {
  console.error('\nAutolink FAIL');
  problems.slice(0, 20).forEach((p) => console.error('  ' + p));
  process.exit(1);
}
console.log('Autolink PASS (no nested or unbalanced anchors)');
