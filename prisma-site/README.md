# Prisma Equipamentos — prisma-site

Catálogo B2B estático da Prisma Equipamentos. Ver `CLAUDE.md` para o modelo de
conteúdo completo e as regras do projeto.

## Comandos

```bash
npm install       # instala as dependências
npm run dev       # sobe o site em http://localhost:4321, com o painel Keystatic em /keystatic
npm run build     # gera o build estático de produção em dist/ (sem Keystatic)
npm run preview   # serve o conteúdo de dist/ localmente, como em produção
```

## Estrutura

- `src/content/` — conteúdo editável (produtos, categorias, cidades)
- `src/content.config.ts` — schema das coleções
- `keystatic.config.ts` — configuração do painel de edição (local, só em dev)
- `src/pages/` — rotas do site, incluindo as dinâmicas `[cidade].astro`,
  `produto/[produto].astro` e `categoria/[categoria].astro`
- `src/components/` — componentes reutilizáveis (cards, botões de WhatsApp, header,
  footer)
- `src/lib/whatsapp.ts` — geração dos links `wa.me`
