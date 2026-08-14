import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import markdoc from '@astrojs/markdoc';

export default defineConfig({
  site: 'https://prismaequipamentos.com.br',
  integrations: [
    sitemap(),
    markdoc(),
    ...(process.env.NODE_ENV !== 'production' ? [react(), keystatic()] : []),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});