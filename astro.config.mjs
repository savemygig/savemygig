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
