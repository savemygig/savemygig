import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Pages that must never appear in the sitemap: the sealed rescue tunnel
// (noindex by design), outcome pages, and utility pages. Everything else is
// picked up automatically. The old hand-maintained public/sitemap.xml drifted
// twice (it was missing /emergency and /checklist), so it is now generated.
const BUILD_DATE = new Date().toISOString();

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
  integrations: [
    sitemap({
      filter: (page) => {
        const path = page.replace('https://www.savemygig.com', '');
        return !EXCLUDE.some((x) => path === x || path.startsWith(x));
      },
      // Freshness signal. Both classic search and AI answer engines weight
      // demonstrably-maintained content, and the old sitemap had no dates at all.
      serialize: (item) => ({ ...item, lastmod: BUILD_DATE }),
    }),
  ],
});
