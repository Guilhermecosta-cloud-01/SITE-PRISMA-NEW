# Prisma Equipamentos — Catálogo B2B

Site de catálogo B2B da Prisma Equipamentos (representante autorizado Tramontina
Hospitality no interior de São Paulo). MVP estático, sem preço, sem carrinho — todo
caminho termina numa conversa no WhatsApp.

## Stack

- **Astro** (output estático) — TypeScript strict
- **Tailwind v4** via `@tailwindcss/vite` (estilo mínimo, visual propositalmente feio
  nesta entrega — sem identidade visual definida)
- **Keystatic** em modo local (`storage: { kind: 'local' }`) como painel de edição —
  roda só em desenvolvimento, nunca no build de produção
- **Cloudflare Pages** como destino do deploy

Não adicione dependências fora dessa stack (nada de UI kit, animação, ORM, state
manager) sem alinhar antes.

## Modelo de conteúdo

Definido em `src/content.config.ts`, com os arquivos markdown em `src/content/`. Três
coleções:

- **produtos** (`src/content/produtos/*.md`): `nome`, `categoria` (string — deve bater
  com o `id`/nome do arquivo de uma categoria), `codigo?`, `imagem`, `specs` (lista de
  strings), `aplicacao`, `destaque` (boolean, default `false`), `ordem` (number, default
  `99`). Corpo em markdown.
- **categorias** (`src/content/categorias/*.md`): `nome`, `descricao`, `imagem?`,
  `ordem`.
- **cidades** (`src/content/cidades/*.md`): `nome`, `estado` (default `'SP'`),
  `metaTitle`, `metaDescription`, `segmentosFortes` (lista), `prazoEntrega`,
  `referenciaLocal`, `ativa` (boolean, default `true`). Corpo em markdown.

Imagens usam o schema `image()` do Astro e devem ficar em `src/assets/` — nunca URLs
externas.

O slug de cada entrada (usado nas rotas) é o nome do arquivo. Ex.: `campinas.md` →
`/campinas`; `faca-chef-tramontina.md` → `/produto/faca-chef-tramontina`.

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
   `src/content/cidades/<slug>.md`.
2. Preencha `metaTitle`/`metaDescription` únicos, `segmentosFortes`, `prazoEntrega`,
   `referenciaLocal` reais para aquela cidade, e um corpo em markdown com conteúdo
   específico daquela praça (não copie o texto de outra cidade).
3. `ativa: true` faz a página aparecer no build; `ativa: false` a remove sem apagar o
   arquivo.

## Como adicionar um produto

1. Pelo Keystatic (`/keystatic` → Produtos → Criar) ou direto em
   `src/content/produtos/<slug>.md`.
2. `categoria` deve ser exatamente o slug (nome do arquivo, sem `.md`) de uma entrada
   existente em `src/content/categorias/`.
3. Adicione a imagem em `src/assets/` e referencie no campo `imagem`.
4. `destaque: true` faz o produto aparecer na home e nas páginas de cidade.

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
