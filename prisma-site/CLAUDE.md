# Prisma Equipamentos — Catálogo B2B

Site de catálogo B2B da Prisma Equipamentos (representante autorizado Tramontina
Hospitality no interior de São Paulo). MVP estático, sem preço, sem carrinho — todo
caminho termina numa conversa no WhatsApp.

## Stack

- **Astro** (output estático) — TypeScript strict, coleções de conteúdo via **Content
  Layer** (`astro/loaders` `glob`)
- **Tailwind v4** via `@tailwindcss/vite`, com a identidade visual da Prisma
  (paleta/tipografia/logo — ver seção "Identidade visual" abaixo)
- **Markdoc** (`@astrojs/markdoc`) — formato do corpo das entradas de conteúdo (`.mdoc`),
  exigido pelo campo de conteúdo do Keystatic
- **Keystatic** como painel de edição, em `/keystatic` — em dev local grava direto no
  disco (`storage: local`); no site publicado autentica com GitHub e grava via API
  (`storage: github`). Ver seção "Painel /keystatic no site publicado".
- **@astrojs/cloudflare** — adapter necessário só por causa das rotas do Keystatic
  (`/keystatic`, `/api/keystatic`), que a integration registra como `prerender: false`.
  Todas as páginas de conteúdo continuam 100% estáticas (prerenderizadas) — o adapter
  não muda isso, só habilita essas duas rotas específicas.
- **Cloudflare Workers** (via Workers Builds/`wrangler.jsonc`) como destino do deploy

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

## Identidade visual

Design importado do Claude Design (mockup `Prisma Equipamentos.dc.html`) e implementado
em `src/styles/global.css`, `src/components/Logo.astro` e `src/components/Card*.astro`.

- **Cores** (tokens Tailwind via `@theme` em `global.css`):
  `navy-900` `#132840` (rodapé), `navy-800` `#1b3556` (header/hero/seções escuras),
  `navy-700` `#21406b` (painel do hero), `navy-600` `#4a6e92` (bordas em fundo escuro),
  `cream` `#f7f5f2` (fundo claro / texto sobre fundo escuro), `cream-border` `#e6e0d4`
  (borda de card em fundo claro). A cor de destaque (laranja `#D4703A` por padrão) **não**
  é um token fixo — continua vindo do singleton "Aparência" via `--color-accent` (ver
  seção abaixo), só que agora com o laranja da marca como valor padrão em vez do verde
  genérico do MVP.
- **Tipografia**: `League Gothic` (títulos grandes / wordmark, classe `font-display`),
  `Public Sans` (texto e UI, classe `font-sans`, padrão do `body`), `IBM Plex Mono`
  (rótulos "eyebrow" em caixa alta, classe `font-mono`). Os três `.woff2` estão
  auto-hospedados em `public/fonts/` (baixados uma vez do Google Fonts, subset `latin` —
  cobre a acentuação do português) e declarados via `@font-face` em `global.css`. Isso é
  uma exceção deliberada à regra de "sem fonte externa": os arquivos vivem no repo, o
  site publicado não faz nenhuma requisição a serviço externo de fonte em runtime.
- **Logo**: `src/assets/logo-icon.png` é o ícone (o prisma hexagonal) recortado e com
  fundo removido a partir do logo original enviado pelo usuário — usado sozinho, ao lado
  do wordmark "PRISMA / Equipamentos" tipografado (não é imagem). Componente:
  `src/components/Logo.astro` (props `iconSize`, `textSize`, `showTagline`).

## Como rodar o Keystatic localmente

```bash
cd prisma-site
npm install
npm run dev
```

Acesse `http://localhost:4321/keystatic`. Em dev, `keystatic.config.ts` usa
`storage: { kind: 'local' }` — o painel grava direto nos arquivos do checkout; você
mesmo dá `git add`/`commit`/`push` depois (pelo Codespaces ou pela sua máquina).

## Painel /keystatic no site publicado

O mesmo painel também fica disponível em produção, em
`https://site-prisma-new.representante-guilhermecosta.workers.dev/keystatic` (ou no
domínio próprio, quando estiver apontado). Como não há checkout de git gravável num
Worker do Cloudflare, `keystatic.config.ts` troca automaticamente para
`storage: { kind: 'github', repo: 'guilhermecosta-cloud-01/site-prisma-new' }` quando
`NODE_ENV === 'production'` — o painel autentica com uma conta GitHub e grava direto no
repositório via API (cada alteração vira um commit na branch configurada).

**Configuração única (só precisa ser feita uma vez, fora do código):**

1. No GitHub, vá em **Settings → Developer settings → OAuth Apps → New OAuth App**
   (https://github.com/settings/developers).
2. Preencha:
   - **Application name**: `Prisma Equipamentos — Keystatic`
   - **Homepage URL**: `https://site-prisma-new.representante-guilhermecosta.workers.dev`
   - **Authorization callback URL**:
     `https://site-prisma-new.representante-guilhermecosta.workers.dev/api/keystatic/github/oauth/callback`
     (se depois configurar o domínio próprio, crie um segundo OAuth App com a mesma
     callback no domínio novo, ou atualize este — a callback URL precisa bater
     exatamente com o domínio que o visitante usa).
3. Clique em **Register application**. Copie o **Client ID** mostrado na tela.
4. Clique em **Generate a new client secret** e copie o valor (só aparece uma vez).
5. Defina os três segredos no Worker publicado — o jeito mais confiável é pelo terminal
   (o painel do Cloudflare já se mostrou instável pra isso neste projeto: variáveis
   adicionadas pela aba Settings não sobreviveram a um deploy seguinte). No Codespace,
   dentro de `prisma-site`:
   ```bash
   npx wrangler secret put KEYSTATIC_GITHUB_CLIENT_ID
   npx wrangler secret put KEYSTATIC_GITHUB_CLIENT_SECRET
   npx wrangler secret put KEYSTATIC_SECRET
   ```
   Cada comando pede pra colar o valor correspondente. `KEYSTATIC_SECRET` não vem do
   GitHub — é uma string aleatória só pra essa finalidade (o Keystatic usa pra assinar a
   sessão de quem loga); gere a sua, ex. `openssl rand -base64 32`, e **nunca** deixe o
   valor real escrito num arquivo do repositório (isso já aconteceu uma vez neste
   projeto — o valor vazado foi rotacionado, mas fica de lição).
6. `wrangler secret put` já aplica o segredo no Worker publicado, sem precisar de outro
   deploy.

⚠️ **Repositório precisa ser público.** No modo `storage: { kind: 'github' }` com OAuth
App simples (o que está configurado), o Keystatic não pede nenhum escopo de permissão
no login — então só enxerga repositórios **públicos**. Foi a escolha deliberada aqui
(mais simples que configurar um GitHub App com instalação por repositório, que seria a
alternativa pra manter o repo privado). Nada no repositório é sensível — segredos reais
(Client Secret do GitHub, tokens) nunca ficam em arquivo, só como variável no Cloudflare.

⚠️ Só quem tem acesso de **escrita** no repositório GitHub consegue de fato salvar uma
alteração pelo painel publicado — qualquer pessoa pode tentar logar com sua própria
conta GitHub, mas a gravação (chamada à API do GitHub) falha para quem não é
colaborador do repo. Ainda assim, a existência da rota `/keystatic` é pública; não é
uma área "escondida".

⚠️ **`src/middleware.ts` existe por causa de um bug de desatualização do
`@keystatic/astro`** (a versão mais recente disponível, 5.2.0, ainda lê
`Astro.locals.runtime.env` — API removida de propósito pelo `@astrojs/cloudflare` 14.x,
a única faixa compatível com Astro 7). Sem esse middleware, o login do GitHub no
Keystatic dá 500. Não remova esse arquivo sem checar se uma versão nova do
`@keystatic/astro` já corrigiu isso upstream (aí o middleware vira desnecessário, mas
inofensivo de manter).

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
- **Mostrar/ocultar** as seções "Por que a Prisma" e "Cidades atendidas" da home
  (`mostrarPorQueAPrisma`, `mostrarCidades`).
- **Linha extra do rodapé** (`textoRodapeExtra`), opcional.

Isso NÃO é um builder visual (arrastar/soltar, mudar espaçamento, reordenar seções
livremente) — foi um limite deliberado para não trazer nenhuma dependência nova fora da
stack combinada. Para mudanças de layout além desses campos (nova seção, reordenar,
tipografia, etc.), ainda é preciso editar o código.

## Regras invioláveis

- **Nenhum preço em lugar nenhum.** O botão de produto sempre diz "Consultar preço".
- **Todo CTA é um link `wa.me`** (`src/lib/whatsapp.ts`) com mensagem pré-preenchida e
  contextual — nunca um botão genérico sem contexto.
- **Todo o conteúdo do site é estático/prerenderizado.** A única exceção é o painel
  `/keystatic` em si (e sua API em `/api/keystatic`), que precisa ser uma rota sob
  demanda para autenticar e gravar no GitHub — nenhuma página de produto, categoria,
  cidade etc. deixa de ser estática por causa disso.
- **Mobile-first.**
- **A identidade visual é a do design importado** (ver seção "Identidade visual") — não
  troque paleta, tipografia ou logo por conta própria; para uma mudança de layout maior
  (nova seção, reordenar, novo componente), alinhe antes de implementar.
- **Sem busca, filtro avançado, área de cliente, blog ou newsletter.**
- **Sem cidades além das já cadastradas** sem pedido explícito.
- **Sem imagens ou fontes de serviço externo em runtime** — assets ficam no repo
  (`src/assets/`, `public/fonts/`); fontes do Google foram baixadas uma vez e são
  auto-hospedadas, nunca carregadas de `fonts.googleapis.com` em produção.
- **Sem texto de marketing genérico** — onde faltar conteúdo real, use `TODO:`
  explícito no corpo/campos.
