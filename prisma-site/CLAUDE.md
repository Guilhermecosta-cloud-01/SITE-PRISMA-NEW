# Prisma Equipamentos — Catálogo B2B

Site de catálogo B2B da Prisma Equipamentos (representante autorizado Tramontina
Hospitality no interior de São Paulo). MVP estático, sem preço, sem carrinho — todo
caminho termina numa conversa no WhatsApp.

## Stack

- **Astro** (output estático) — TypeScript strict, coleções de conteúdo via **Content
  Layer** (`astro/loaders` `glob`)
- **Tailwind v4** via `@tailwindcss/vite` (estilo mínimo, visual propositalmente feio
  nesta entrega — sem identidade visual definida)
- **Markdoc** (`@astrojs/markdoc`) — formato do corpo das entradas de conteúdo (`.mdoc`),
  exigido pelo campo de conteúdo do Keystatic
- **Keystatic** em modo local (`storage: { kind: 'local' }`) como painel de edição —
  roda só em desenvolvimento, nunca no build de produção
- **Cloudflare Pages** (via Workers Builds/`wrangler.jsonc`) como destino do deploy

Não adicione dependências fora dessa stack (nada de UI kit, animação, ORM, state
manager) sem alinhar antes.

## Modelo de conteúdo

Definido em `src/content.config.ts` usando o **Content Layer** do Astro (loader `glob`
de `astro/loaders`), lendo os arquivos em `src/content/`. Três coleções:

- **produtos** (`src/content/produtos/*.mdoc`): `nome`, `categoria` (string — deve bater
  com o `id`/nome do arquivo de uma categoria), `codigo?`, `imagem`, `specs` (lista de
  strings), `aplicacao`, `destaque` (boolean, default `false`), `ordem` (number, default
  `99`). Corpo em Markdoc.
- **categorias** (`src/content/categorias/*.mdoc`): `nome`, `descricao`, `imagem?`,
  `ordem`.
- **cidades** (`src/content/cidades/*.mdoc`): `nome`, `estado` (default `'SP'`),
  `metaTitle`, `metaDescription`, `segmentosFortes` (lista), `prazoEntrega`,
  `referenciaLocal`, `ativa` (boolean, default `true`). Corpo em Markdoc.

Imagens usam o schema `image()` do Astro e devem ficar em `src/assets/` — nunca URLs
externas.

O slug de cada entrada (usado nas rotas) é o nome do arquivo. Ex.: `campinas.mdoc` →
`/campinas`; `faca-chef-tramontina.mdoc` → `/produto/faca-chef-tramontina`.

⚠️ **Por que `.mdoc` e não `.md`**: o campo de corpo do `keystatic.config.ts` usa
`fields.markdoc`, que sempre grava em `.mdoc` — é o único tipo de campo do Keystatic que
serve como "content field" de uma coleção. Por isso todo o conteúdo do projeto usa essa
extensão (via a integration `@astrojs/markdoc`, registrada em `astro.config.mjs`), tanto
os arquivos de exemplo quanto o que o Keystatic grava. Nunca crie arquivo `.md` dentro de
`src/content/*` — o Astro não vai enxergá-lo (o loader só busca `**/*.mdoc`), e o
Keystatic também não vai reconhecê-lo como a mesma entrada ao editar.

## Como rodar o Keystatic

```bash
cd prisma-site
npm install
npm run dev
```

Acesse `http://localhost:4321/keystatic`. O painel só existe em desenvolvimento — em
`astro.config.mjs`, as integrations `react()` e `keystatic()` só são registradas quando
`NODE_ENV !== 'production'`, então `npm run build` nunca gera a rota `/keystatic`.

## Como adicionar uma cidade

⚠️ Só crie página de cidade com conteúdo único e real. Página de cidade "vazia" ou
copiada é penalizada pelo Google como doorway page — não gere cidades sem propósito.

1. Pelo Keystatic (`/keystatic` → Cidades → Criar) ou direto em
   `src/content/cidades/<slug>.mdoc`.
2. Preencha `metaTitle`/`metaDescription` únicos, `segmentosFortes`, `prazoEntrega`,
   `referenciaLocal` reais para aquela cidade, e um corpo em markdown com conteúdo
   específico daquela praça (não copie o texto de outra cidade).
3. `ativa: true` faz a página aparecer no build; `ativa: false` a remove sem apagar o
   arquivo.

## Como adicionar um produto

1. Pelo Keystatic (`/keystatic` → Produtos → Criar) ou direto em
   `src/content/produtos/<slug>.mdoc`.
2. `categoria` deve ser exatamente o slug (nome do arquivo, sem `.mdoc`) de uma entrada
   existente em `src/content/categorias/`.
3. Adicione a imagem em `src/assets/` e referencie no campo `imagem`.
4. `destaque: true` faz o produto aparecer na home e nas páginas de cidade.

## Como mudar o layout sem mexer em código

Existe um singleton **"Aparência do site"** no Keystatic (`/keystatic` → Aparência),
gravado em `src/content/aparencia/aparencia.json` e lido por `src/lib/aparencia.ts`
(com valores padrão de fallback caso o arquivo não exista). Ele controla, sem precisar
editar nenhum componente:

- **Cor de destaque** (`corDestaque`, hex) — aplicada via variável CSS `--color-accent`,
  injetada uma vez no `<html>` do `Layout.astro`. Todo botão que deveria usar a cor de
  destaque usa a classe Tailwind `bg-[var(--color-accent)]` em vez de uma cor fixa (ex.:
  `BotaoWhatsApp.astro`, `WhatsAppFlutuante.astro`, `CardProduto.astro`) — assim a cor
  muda no site inteiro a partir de um único campo no painel.
- **Título e texto do hero** da home (`heroTitulo`, `heroTexto`).
- **Mostrar/ocultar** as seções "Como funciona" e "Cidades atendidas" da home
  (`mostrarComoFunciona`, `mostrarCidades`).
- **Linha extra do rodapé** (`textoRodapeExtra`), opcional.

Isso NÃO é um builder visual (arrastar/soltar, mudar espaçamento, reordenar seções
livremente) — foi um limite deliberado para não trazer nenhuma dependência nova fora da
stack combinada. Para mudanças de layout além desses campos (nova seção, reordenar,
tipografia, etc.), ainda é preciso editar o código.

## Regras invioláveis

- **Nenhum preço em lugar nenhum.** O botão de produto sempre diz "Consultar preço".
- **Todo CTA é um link `wa.me`** (`src/lib/whatsapp.ts`) com mensagem pré-preenchida e
  contextual — nunca um botão genérico sem contexto.
- **Site publicado é 100% estático.** Keystatic só roda em desenvolvimento local.
- **Mobile-first.**
- **Sem identidade visual definida nesta entrega** — não adicione paleta, tipografia
  elaborada ou hero complexo sem alinhar antes; o visual feio é proposital.
- **Sem busca, filtro avançado, área de cliente, blog ou newsletter.**
- **Sem cidades além das já cadastradas** sem pedido explícito.
- **Sem imagens ou fontes externas** — só assets locais.
- **Sem texto de marketing genérico** — onde faltar conteúdo real, use `TODO:`
  explícito no corpo/campos.
