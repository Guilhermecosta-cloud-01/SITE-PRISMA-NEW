import { defineConfig } from 'astro/config';

import sitemap from '@astrojs/sitemap';

import tailwindcss from '@tailwindcss/vite';

import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import markdoc from '@astrojs/markdoc';
import cloudflare from '@astrojs/cloudflare';

export default defineConfig({
  site: 'https://prismaequipamentos.com.br',
  integrations: [sitemap(), markdoc(), react(), keystatic()],

  // Necessário para as rotas do Keystatic (/keystatic, /api/keystatic), que a
  // integration registra como prerender:false. Todo o resto do site continua
  // 100% estático — o adapter só entra em ação nessas rotas.
  adapter: cloudflare(),

  vite: {
    plugins: [tailwindcss()],
  },
});