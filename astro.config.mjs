// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://korbinian-schmidtner.com',
  output: 'server',
  adapter: vercel({
    imageService: true,
    imagesConfig: {
      sizes: [125, 150, 400, 600, 800, 1200, 1920],
    },
  }),
  integrations: [
    react(),
    sitemap(),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
});
