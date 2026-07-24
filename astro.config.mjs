import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://www.savemygig.com',
  output: 'static',
  compressHTML: false,
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});
