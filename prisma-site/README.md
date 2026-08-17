# Prisma Equipamentos — prisma-site

Catálogo B2B estático da Prisma Equipamentos. Ver `CLAUDE.md` para o modelo de
conteúdo completo e as regras do projeto.

## Comandos

```bash
npm install       # instala as dependências
npm run dev       # sobe o site em http://localhost:4321, com o painel Keystatic em /keystatic (grava local)
npm run build     # gera o build de produção em dist/client (estático) + dist/server (Worker do /keystatic)
npm run preview   # roda o build de produção localmente (via Miniflare), como no Cloudflare
```

## Estrutura

- `src/content/` — conteúdo editável (produtos, categorias, cidades)
- `src/content.config.ts` — schema das coleções
- `keystatic.config.ts` — configuração do painel de edição (local em dev, GitHub em
  produção — ver CLAUDE.md)
- `src/pages/` — rotas do site, incluindo as dinâmicas `[cidade].astro`,
  `produto/[produto].astro` e `categoria/[categoria].astro`
- `src/components/` — componentes reutilizáveis (cards, botões de WhatsApp, header,
  footer)
- `src/lib/whatsapp.ts` — geração dos links `wa.me`
