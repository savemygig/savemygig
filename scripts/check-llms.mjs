#!/usr/bin/env node
/**
 * LLMS.TXT INTEGRITY CHECK.
 *
 * llms.txt is the file AI assistants read to understand what this site is and
 * which page answers which question. It is the GEO equivalent of the sitemap,
 * and because it is written by hand it rots exactly the way the OG cards did.
 *
 * It HAD rotted, found 2026-08-03:
 *   - it linked /knowledge/rekordbox, which has not existed since the
 *     brand-folder move to /knowledge/pioneer-dj/rekordbox. A dead link in the
 *     one file an AI reads to find the answer.
 *   - it described the emergency flow as "three time-based paths (under 60
 *     minutes / 1-3 hours / tomorrow)". That architecture was replaced by five
 *     SYMPTOM doors, with time demoted into the branches. The file was telling
 *     every AI assistant the wrong thing about the site's main feature.
 *   - it described the prevention hub as "the three habits". It has ten rules.
 *   - it omitted the dictionary (around 60 defined terms with stable anchors),
 *     the firmware matrix, and all seven per-model hardware pages, which are
 *     the most citable material on the site.
 *
 * A wrong llms.txt is worse than none: it produces confident, wrong citations.
 *
 * This checks two things the build can prove, and deliberately not a third.
 *   1. Every link in llms.txt resolves to a real page in dist.
 *   2. Every indexable page in the sitemap is either linked from llms.txt or
 *      listed in COVERED_ELSEWHERE below with a reason.
 * It cannot check that the DESCRIPTIONS are still true. That stays human, and
 * the failures above were all description failures, so read the file whenever
 * the architecture changes.
 */

import fs from 'node:fs';
import path from 'node:path';
import { LANGS } from '../src/i18n/registry.js';

const DIST = process.argv[2] || 'dist';
const SITE = 'https://www.savemygig.com';

/**
 * A TRANSLATED PAGE IS COVERED BY ITS ENGLISH COUNTERPART. Added the day
 * Portuguese and Spanish went live.
 *
 * The alternative was listing all 94 translated URLs, and that is the wrong
 * answer for what this file is. llms.txt is not a sitemap. It is a short
 * briefing that says which page answers which question, and its whole value
 * is being readable in one pass. Tripling it with the same answers in three
 * languages would bury the answers under the URLs.
 *
 * The rule this check really enforces is "is this ANSWER described", not "is
 * this URL listed". A translated page is the same answer at a predictable
 * address, and llms.txt now states that mapping explicitly near the top, so
 * an assistant can construct the Portuguese or Spanish URL for any answer it
 * has already found. So: strip the language prefix and ask whether the
 * English original is covered.
 */
const stripLang = (p) => {
  for (const l of LANGS) {
    if (!l.prefix) continue;
    if (p === l.prefix) return '/';
    if (p.startsWith(l.prefix + '/')) return p.slice(l.prefix.length);
  }
  return p;
};

// Indexable pages that llms.txt deliberately does not link, with the reason.
// An AI assistant has no use for these, and listing them would dilute the file.
const COVERED_ELSEWHERE = {
  '/': 'the homepage is the site itself, llms.txt describes it in the header',
  '/legal': 'hub page; /legal/disclaimer is the one with substance and is linked',
};

const txtPath = path.join(DIST, 'llms.txt');
if (!fs.existsSync(txtPath)) {
  console.error('llms.txt MISSING from the build');
  process.exit(1);
}
const txt = fs.readFileSync(txtPath, 'utf8');

const pageExists = (p) => {
  const c = p.replace(/^\//, '').replace(/\/$/, '');
  if (!c) return fs.existsSync(path.join(DIST, 'index.html'));
  return fs.existsSync(path.join(DIST, `${c}.html`)) || fs.existsSync(path.join(DIST, c, 'index.html'));
};

const problems = [];

// 1. every link resolves
const linked = new Set();
for (const m of txt.matchAll(new RegExp(`${SITE}([^)\\s]*)`, 'g'))) {
  const p = (m[1] || '/').split('#')[0] || '/';
  linked.add(p);
  if (!pageExists(p)) problems.push(`dead link: ${p}`);
}

// 2. every indexable page is covered
const sitemapPath = path.join(DIST, 'sitemap-0.xml');
if (fs.existsSync(sitemapPath)) {
  const sitemap = fs.readFileSync(sitemapPath, 'utf8');
  for (const m of sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)) {
    const p = m[1].replace(SITE, '') || '/';
    if (linked.has(p) || COVERED_ELSEWHERE[p]) continue;
    const en = stripLang(p);
    if (en !== p && (linked.has(en) || COVERED_ELSEWHERE[en])) continue;
    problems.push(`indexable page missing from llms.txt: ${p}`);
  }
} else {
  problems.push('sitemap-0.xml not found, coverage not checked');
}

if (problems.length) {
  console.error('\nllms.txt check FAIL');
  problems.forEach((p) => console.error('  ' + p));
  console.error('\n  Fix public/llms.txt, or add the path to COVERED_ELSEWHERE with a reason.');
  process.exit(1);
}
console.log(`llms.txt check PASS (${linked.size} links, all resolve; every indexable page covered)`);
