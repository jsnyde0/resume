// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production domain — used for canonical URLs and sitemap generation.
  site: 'https://www.jonatansnyders.com',
  integrations: [sitemap()],
});
