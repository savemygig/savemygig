/*
 * THE SITEMAP INDEX TELLS THE TRUTH ABOUT WHEN THE SITEMAP CHANGED.
 *
 * THE BUG THIS FIXES, measured on 2026-08-07:
 *
 *     sitemap-index.xml lastmod   2026-08-06T18:46:29Z
 *     commit that added 333 hreflang alternates to sitemap-0.xml
 *                                 2026-08-06T20:12:42Z
 *
 * The index was telling Google that sitemap-0.xml had not changed since 18:46,
 * an hour and a half BEFORE the commit that rewrote every entry in it. A crawler
 * that honours that hint has no reason to re-fetch the child, so the alternates
 * could sit there indefinitely, unread.
 *
 * WHY IT HAPPENS, and it is not a bug in @astrojs/sitemap. writeSitemap builds
 * the index entry with `getLatestLastmod(pages) ?? opts.lastmod`, so the entry's
 * date is the MAXIMUM OF THE PAGE lastmods, and the `lastmod` option is only a
 * fallback that can never override it. Reasonable default, wrong answer here,
 * because our page lastmods are deliberately git-derived per page (see
 * scripts/git-lastmod.mjs) and deliberately DO NOT move when a layout, a
 * component or the sitemap configuration changes. That split is correct for the
 * pages: a footer tweak is not a content update and must not claim to be.
 *
 * But it makes the index answer the wrong question. Those are two different
 * facts:
 *
 *     a page's lastmod   "when did what a reader sees on this URL last change"
 *     the index lastmod  "when did this sitemap FILE last change"
 *
 * The second is true whenever the URL SET changes or the shape of each entry
 * changes, and neither of those touches a single page's content date. Adding a
 * language, changing the exclude filter, or adding hreflang alternates all
 * rewrite the file while every page honestly reports the same date as before.
 *
 * SO THE FLOOR IS THE GIT DATE OF THE FILES THAT DETERMINE THE SITEMAP'S SHAPE:
 *
 *     astro.config.mjs        the URL filter, the i18n block, the serializer
 *     src/i18n/registry.js    the live flags, which decide whether /pt and /es
 *                             are in the file at all
 *     scripts/git-lastmod.mjs the dates themselves
 *
 * The result is max(existing index lastmod, those three). Never earlier than
 * what Astro computed, so this can only ever move the date FORWARD, and only to
 * a real commit date that genuinely changed the file.
 *
 * WHAT THIS DELIBERATELY IS NOT: the build time. Stamping "now" on every build
 * would make the index claim a change on a build that altered nothing, which is
 * the exact habit that teaches Google to stop reading the field, and the reason
 * per-page lastmods were moved off the build timestamp in the first place. The
 * fix for lying in one direction is not lying in the other.
 *
 * MUTATES dist, SO IT LIVES IN `build`. Standing doctrine on this project: the
 * gate may only ADD assertions, never transforms, and anything that changes dist
 * belongs in build and is mirrored into gate. scripts/check-build-parity.mjs
 * fails the gate if the two drift. Production shipped without autolinks for days
 * because that rule was broken once.
 */
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

const DIST = process.argv[2] || 'dist';
const ROOT = resolve(new URL('..', import.meta.url).pathname);
const INDEX = join(DIST, 'sitemap-index.xml');

// The files whose content decides which URLs are in the sitemap and what each
// entry looks like. A change to any of them changes the FILE.
const SHAPE_FILES = [
  'astro.config.mjs',
  'src/i18n/registry.js',
  'scripts/git-lastmod.mjs',
];

if (!existsSync(INDEX)) {
  console.error(`sitemap index lastmod FAIL: ${INDEX} not found`);
  process.exit(1);
}

const gitDate = (p) => {
  try {
    const out = execFileSync('git', ['log', '-1', '--format=%cI', '--', p], {
      cwd: ROOT, encoding: 'utf8',
    }).trim();
    return out ? new Date(out).toISOString() : null;
  } catch {
    return null; // no git here: the existing date stands, which is the safe side
  }
};

const xml = readFileSync(INDEX, 'utf8');
const found = xml.match(/<lastmod>([^<]+)<\/lastmod>/);
if (!found) {
  console.error('sitemap index lastmod FAIL: the index carries no <lastmod> to correct');
  process.exit(1);
}
const current = found[1];

const shape = SHAPE_FILES.map((p) => ({ p, d: gitDate(p) })).filter((x) => x.d);
const candidates = [current, ...shape.map((x) => x.d)];
// Max, compared as time rather than as a string: the two formats differ (Astro
// writes 2026-08-06T18:46:29.000Z, git writes 2026-08-06T20:12:42+00:00) and a
// lexical sort would order them wrongly.
const winner = candidates.reduce((a, b) => (new Date(b) > new Date(a) ? b : a));
const iso = new Date(winner).toISOString();

if (iso === new Date(current).toISOString()) {
  console.log(
    `Sitemap index lastmod PASS (unchanged at ${current}; ` +
    `newest shape file is ${shape.map((x) => `${x.p} ${x.d}`).join(', ') || 'unknown'})`
  );
  process.exit(0);
}

// Only the FIRST lastmod is the one describing sitemap-0.xml. Replaced once, not
// globally, so a future index listing several child sitemaps does not get every
// entry stamped with one date.
writeFileSync(INDEX, xml.replace(/<lastmod>[^<]+<\/lastmod>/, `<lastmod>${iso}</lastmod>`));
const why = shape.find((x) => new Date(x.d).getTime() === new Date(iso).getTime());
console.log(
  `Sitemap index lastmod: ${current} -> ${iso}` +
  (why ? `  (${why.p} changed the sitemap's shape after the freshest page)` : '')
);
