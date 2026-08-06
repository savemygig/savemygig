import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { LANGS } from './src/i18n/registry.js';
import { makeLastmod } from './scripts/git-lastmod.mjs';

// Pages that must never appear in the sitemap: the sealed rescue tunnel
// (noindex by design), outcome pages, and utility pages. Everything else is
// picked up automatically. The old hand-maintained public/sitemap.xml drifted
// twice (it was missing /emergency and /checklist), so it is now generated.
const BUILD_DATE = new Date().toISOString();
// PER-PAGE lastmod, DERIVED FROM GIT (2026-08-06). See scripts/git-lastmod.mjs
// for the reasoning and for what does and does not count as a change to a page.
// BUILD_DATE survives only as the fallback for a page with no history.
const lastmodFor = makeLastmod(BUILD_DATE);

const EXCLUDE = [
  '/protocol/',
  '/saved',
  '/files-lost',
  '/card-ready',
  '/feedback',
  '/legal/privacy',
  '/legal/terms',
  '/legal/cookies',
  '/partners',
  '/404',
  '/offline',
];

// Prefixes of languages that are NOT published yet. While `live` is false the
// registry already makes those pages noindex; the sitemap has to agree, or a
// build advertises an unpublished translation to Google. The previous filter
// only stripped the prefix before testing EXCLUDE, which was enough while the
// rescue tunnel was the only translated route (it is excluded in every
// language). The moment ordinary /pt pages existed, seven of them walked
// straight into sitemap-0.xml and check-i18n.mjs failed. Publishing a
// language is still one flag in the registry: flip `live` and its URLs appear
// here, together with the hreflang alternates and the indexable robots tag.
const DEAD_PREFIXES = LANGS.filter((l) => l.prefix && !l.live).map((l) => l.prefix);

export default defineConfig({
  site: 'https://www.savemygig.com',
  output: 'static',
  compressHTML: false,
  trailingSlash: 'never',
  build: {
    format: 'file',
    /*
     * INLINE EVERY STYLESHEET (perf pass, 2026-08-04).
     *
     * Astro's default is 'auto', which only inlines a stylesheet under 4 KB.
     * Ours are 11-24 KB, so nothing qualified and every page shipped two or
     * three <link rel="stylesheet"> tags. Those links are render-blocking AND
     * they cannot even be requested until the browser has parsed the head, so
     * on a high-latency link first paint costs one extra round trip on top of
     * the download. That round trip was the single biggest thing standing
     * between a DJ and the first pixel.
     *
     * Measured on the six reference pages, Chrome throttled to 1.6 Mbit /
     * 150 ms RTT / 4x CPU, median of 5 cold loads, First Contentful Paint:
     *
     *     /                     716 -> 532 ms   (-184)
     *     /emergency            660 -> 492 ms   (-168)
     *     /checklist            760 -> 500 ms   (-260)
     *     /faq                  680 -> 548 ms   (-132)
     *     /knowledge/.../cdj-3000
     *                           732 -> 556 ms   (-176), LCP 1068 -> 884
     *     /protocol/usb/start   672 -> 408 ms   (-264)
     *
     * THE COST, measured rather than hand-waved. Inlining means the CSS is
     * re-sent with every document instead of being read from cache once, so a
     * DJ walking the tunnel pays for it on every step. Walking
     * /emergency -> /protocol/usb/start -> /link -> /computer with a warm
     * cache, each step went from 8.2 KB to 12.8 KB on the wire, and the FCP
     * of those warm steps did not move at all (236/204/244 ms external vs
     * 228/208/232 ms inlined): 4.6 KB extra inside an HTTP response the
     * browser is already streaming costs no round trip and no measurable
     * time. Paying 4.6 KB a step to save 264 ms on the step that matters most
     * (the cold deep link, which is how an emergency actually starts) is the
     * right side of that trade.
     *
     * THE OTHER COST, also measured: the service worker precaches 70 routes,
     * and every one of them now carries its own copy of the CSS. Measured at
     * the origin on a comment-stripped (production) build, the install went
     * from roughly 0.8 MB to 1.16 MB. It is a background download that
     * happens once per device after the page has finished loading, and it is
     * now issued 6 at a time rather than 77 at once (see public/sw.js), so it
     * buys the first paint of every visit on every device with one slower
     * background fill on the devices that install the app.
     *
     * Side effect, and a welcome one: with no external stylesheets there is
     * no way for a page to be precached by the service worker while its CSS
     * is not. See public/sw.js for the version of that bug that shipped.
     */
    inlineStylesheets: 'always',
  },
  vite: {
    build: {
      /*
       * KEEP THE SHARED SITE SCRIPT EXTERNAL (perf batch 8, 2026-08-06).
       *
       * Astro inlines a bundled script chunk into every page that references it
       * when the chunk is under build.assetsInlineLimit, which defaults to 4 KB
       * (astro/dist/core/build/plugins/plugin-scripts.js). For a script that
       * belongs to ONE page that is the right call: an external file would cost
       * a round trip to save nothing, because nothing else will ever reuse it.
       * For src/scripts/site.ts, which all 143 Base-layout pages load, it is
       * exactly backwards: inlining means re-sending the same bytes with every
       * document and putting a copy inside each of the 70 routes the service
       * worker precaches.
       *
       * The chunk is comfortably over 4 KB today, so it would be external
       * anyway. That is not a thing to depend on. This states the decision for
       * that one chunk instead of letting it turn on a byte count a later
       * deletion could quietly cross, which would silently put 8 KB back into
       * every page with nothing failing. Returning null for everything else
       * means Vite's default applies unchanged, so per-page scripts stay
       * inlined and no asset changes how it is emitted.
       */
      assetsInlineLimit: (filePath) =>
        /Base\.astro_astro_type_script/.test(filePath) ? false : null,
    },
  },
  integrations: [
    sitemap({
      filter: (page) => {
        const raw = page.replace('https://www.savemygig.com', '');
        // An unpublished language is invisible, full stop.
        if (DEAD_PREFIXES.some((p) => raw === p || raw.startsWith(p + '/'))) return false;
        // Strip a language prefix before testing. EXCLUDE is written in
        // canonical English paths, so without this the rescue tunnel was
        // excluded in English and ADVERTISED in Portuguese and Spanish: 53
        // /pt/protocol/ URLs walked straight into the sitemap the moment the
        // translated routes existed. They are noindex either way, but a
        // sitemap entry for a noindex page is a crawl-budget waste and a
        // contradiction, and for an unpublished language it is a leak.
        const path = raw.replace(/^\/(pt|es)(?=\/|$)/, '') || '/';
        return !EXCLUDE.some((x) => path === x || path.startsWith(x));
      },
      // Freshness signal. Both classic search and AI answer engines weight
      // demonstrably-maintained content, and the old sitemap had no dates at all.
      //
      // IT WAS THE BUILD TIMESTAMP ON ALL 111 URLs UNTIL 2026-08-06, which is
      // worse than no dates: /legal and a fix article rewritten this morning
      // claimed the same lastmod, and every one of the 111 moved on a build that
      // touched a single file. Google's own guidance is that it stops reading a
      // lastmod it has learned to distrust, so the field was costing bytes and
      // teaching the crawler to ignore the one signal it was added to send.
      serialize: (item) => ({
        ...item,
        lastmod: lastmodFor(item.url.replace('https://www.savemygig.com', '') || '/'),
      }),
    }),
  ],
});
