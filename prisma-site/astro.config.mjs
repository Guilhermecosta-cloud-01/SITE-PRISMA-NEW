import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';

export default defineConfig({
  site: 'https://prismaequipamentos.com.br',
  integrations: [
    sitemap(),
    ...(process.env.NODE_ENV !== 'production' ? [react(), keystatic()] : []),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});