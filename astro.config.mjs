// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Production domain — used for canonical URLs and sitemap generation.
  site: 'https://www.jonatansnyders.com',
  integrations: [
    // /directions/ are noindex visual-identity prototypes (resume-soe.12); keep them out of the sitemap.
    sitemap({ filter: (page) => !page.includes('/directions/') }),
  ],
});
