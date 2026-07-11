// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import sitemap from '@astrojs/sitemap';

// Update this to the production domain before deploy (used for canonical, OG, sitemap).
const SITE = 'https://ahmed-fouad.netlify.app';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  devToolbar: {
    // Avoid Astro dev-toolbar's accessibility audit import issue under pnpm on Windows.
    enabled: false,
  },
  integrations: [icon(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  image: {
    // Allow Sharp to emit modern formats.
    responsiveStyles: true,
  },
});
