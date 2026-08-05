#!/usr/bin/env node
/**
 * INDEXNOW SUBMISSION.
 *
 * IndexNow is the push half of indexing. A sitemap says "here is everything,
 * come back when you feel like it". IndexNow says "this URL changed, now", to
 * Bing, Yandex, Seznam and Naver in one call, and Bing is what ChatGPT and
 * Copilot read. Google does not participate; Google keeps getting the sitemap.
 *
 * WHEN TO RUN IT. After pushing to main AND after Cloudflare Pages has
 * finished the deploy, so that every URL you are about to announce actually
 * returns 200 from the live site:
 *
 *     npm run gate                       # build + verify, as always
 *     git push                           # Cloudflare Pages starts building
 *     # wait for the deploy to go live (check the Pages dashboard)
 *     node scripts/indexnow.mjs          # announce it
 *
 * IT IS DELIBERATELY NOT IN `npm run build` OR `npm run gate`. Both of those
 * run against a local dist on a machine nobody can reach. Submitting from
 * there announces URLs whose new content is not published yet: the engine
 * fetches, sees the OLD page, and the ping is spent for nothing. Worse, the
 * gate runs on every iteration, and hammering the endpoint with unchanged URLs
 * is exactly the abuse the protocol asks you not to commit. This is a
 * post-deploy action, run by a human who knows the deploy landed.
 *
 * THE KEY. public/eae08d43a26b23b3bc3a021aa110b2dd.txt contains that same
 * string and nothing else. That file being fetchable at
 * https://www.savemygig.com/<key>.txt is the whole authentication scheme: it
 * proves whoever submits controls the host. It is a static file in public/, so
 * Cloudflare Pages publishes it with the rest of the site. Do not delete it,
 * and do not "tidy" it into a folder.
 *
 * Run: node scripts/indexnow.mjs [dist] [--dry-run]
 */
import fs from 'node:fs';
import path from 'node:path';

const KEY = 'eae08d43a26b23b3bc3a021aa110b2dd';
const HOST = 'www.savemygig.com';
const ENDPOINT = 'https://api.indexnow.org/indexnow';
// The protocol's own ceiling for one JSON POST. The site is nowhere near it
// (111 URLs today), but a build that ever crosses it would get the whole
// batch rejected rather than truncated, so truncate here and say so.
const MAX_URLS = 10000;

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const DIST = args.find((a) => !a.startsWith('--')) || 'dist';

// The sitemap, not a walk of dist. Walking would announce the noindex rescue
// tunnel and the utility pages, and asking an engine to index a page that
// tells it not to index is a waste of both crawls. The sitemap is already the
// site's own list of what is meant to be indexed, so it is the right source.
const sitemapPath = path.join(DIST, 'sitemap-0.xml');
if (!fs.existsSync(sitemapPath)) {
  console.error(`IndexNow: no ${sitemapPath}. Run the build first.`);
  process.exit(1);
}
const xml = fs.readFileSync(sitemapPath, 'utf8');
const all = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
const urlList = all.filter((u) => u.startsWith(`https://${HOST}`)).slice(0, MAX_URLS);

if (all.length !== urlList.length) {
  console.log(`IndexNow: ${all.length - urlList.length} URL(s) skipped (not on https://${HOST} or over the ${MAX_URLS} cap)`);
}
if (!urlList.length) {
  console.error('IndexNow: the sitemap held no submittable URLs. Nothing sent.');
  process.exit(1);
}

const payload = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList,
};

console.log(`IndexNow: ${urlList.length} URLs from ${sitemapPath}`);
console.log(`  host        ${payload.host}`);
console.log(`  keyLocation ${payload.keyLocation}`);
console.log(`  endpoint    ${ENDPOINT}`);
console.log(`  first       ${urlList[0]}`);
console.log(`  last        ${urlList[urlList.length - 1]}`);

if (dryRun) {
  console.log('\nIndexNow DRY RUN: nothing was submitted.');
  console.log('Remove --dry-run to send, but only after the Cloudflare deploy is live.');
  process.exit(0);
}

const res = await fetch(ENDPOINT, {
  method: 'POST',
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
});
const body = await res.text().catch(() => '');

// The documented meanings, spelled out, because a bare status code sends you
// back to the spec every time.
const MEANING = {
  200: 'accepted, the URLs are queued',
  202: 'accepted, but the key is still being validated',
  400: 'bad request: the JSON is malformed',
  403: 'forbidden: the key file was not found or does not match',
  422: 'unprocessable: a URL is not on this host, or the key does not belong to it',
  429: 'too many requests: back off, this is the abuse guard',
};
const note = MEANING[res.status] || 'unexpected status, see the IndexNow docs';

if (res.ok) {
  console.log(`\nIndexNow OK  ${res.status} (${note})`);
  if (body.trim()) console.log(`  response: ${body.trim().slice(0, 300)}`);
} else {
  console.error(`\nIndexNow FAIL  ${res.status} (${note})`);
  if (body.trim()) console.error(`  response: ${body.trim().slice(0, 300)}`);
  process.exit(1);
}
