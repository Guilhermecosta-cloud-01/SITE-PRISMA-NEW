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
de `astro/loaders`), lendo os arquivos em `src/content/`. Seis coleções:

- **produtos** (`src/content/produtos/*.mdoc`): `nome`, `categoria` (**referência** —
  `reference('categorias')`, ver "Referências entre coleções" abaixo), `codigo?`,
  `imagem`, `specs` (lista de strings), `aplicacao`, `destaque` (boolean, default
  `false`), `ordem` (number, default `99`). Corpo em Markdoc.
- **categorias** (`src/content/categorias/*.mdoc`): `nome`, `descricao`, `imagem?`,
  `ordem`.
- **cidades** (`src/content/cidades/*.mdoc`): schema expandido para alimentar a
  landing page de 9 seções (ver "Página de cidade — estrutura" abaixo): `nome`,
  `estado` (default `'SP'`), `metaTitle`, `metaDescription`, `segmentosFortes` (lista),
  `prazoEntrega`, `ativa` (boolean, default `true`), `heroTexto`, `provaRapida` (lista
  de strings curtas, seção 1), `produtosDestaque` (lista de referências a `produtos`,
  seção 4 — opcional, cai no fallback global de `destaque: true` se vazio), `faq`
  (lista de `{ pergunta, resposta }`, seção 6), `depoimentoTexto?` / `depoimentoAutor?`
  / `depoimentoEstabelecimento?` (seção 7 — a seção some do build se `depoimentoTexto`
  estiver vazio). Corpo em Markdoc = seção 2 (reconhecimento do problema).
- **regioes** (`src/content/regioes/*.mdoc`): `nome`, `metaTitle`, `metaDescription`,
  `cidades` (lista de **referências** a `cidades` — ver abaixo), `ordem` (default `99`),
  `ativa` (boolean, default `true`). Corpo em Markdoc = introdução da região. Uma região
  **não é** uma cidade — é uma página de hub simples (`/regiao/[regiao]`) que agrupa e
  linka para as páginas de cidade que a compõem, para reforço de SEO/linkagem interna.
- **representadas** (`src/content/representadas/*.mdoc`): as marcas parceiras que a
  Prisma representa — desde agosto/2026, o item principal do site, não os produtos. `nome`,
  `segmento` (ex.: "Exaustão Industrial"), `descricaoCurta`, `logo?`, `nomeCatalogo` (ex.:
  "Catálogo Tuboar" — usado na mensagem de WhatsApp do botão de pedir catálogo),
  `temCatalogoOnline` (boolean, default `false` — só `true` para a Tramontina hoje, ver
  "Rotas da Tramontina vs. outras representadas" abaixo), `ordem`, `ativa`. Desde
  outubro/2026, mais quatro campos opcionais para o formato de 8 seções do manual de
  padronização (default vazio — a seção correspondente some da página se não
  preenchido, nunca aparece quebrada): `categoriasProdutos` (lista de strings, seção 3),
  `imagens` (lista de `image()`, seção 4 — nunca banco de imagem genérico), `diferenciais`
  (lista de strings, seção 5 — só o que vier confirmado pelo material oficial da marca),
  `segmentosAtendidos` (lista de **referências** a `segmentos`, seção 6 — reaproveita a
  coleção existente, não inventa associação). Corpo em Markdoc = apresentação da marca
  (seção 2).
- **segmentos** (`src/content/segmentos/*.mdoc`): a antiga seção "Segmentos atendidos" da
  home, que era uma lista fixa em `index.astro` e virou coleção editável: `nome`,
  `descricao`, `imagem?`, `ordem`, `ativa`. Sem corpo Markdoc (não precisa).

Imagens usam o schema `image()` do Astro e devem ficar em `src/assets/` — nunca URLs
externas.

O slug de cada entrada (usado nas rotas) é o nome do arquivo. Ex.: `campinas.mdoc` →
`/campinas`; `regiao-de-campinas.mdoc` → `/regiao/regiao-de-campinas`; produtos da
Tramontina ficam aninhados sob a categoria — ver seção de rotas abaixo.

### Referências entre coleções (relationship / multiRelationship)

`produto.categoria` e `regiao.cidades` usam `reference()` do Astro (não `z.string()`) —
no Keystatic isso é `fields.relationship()` (uma referência, ex. categoria de um
produto) ou `fields.multiRelationship()` (várias, ex. cidades de uma região). Na UI do
painel isso já aparece como uma lista suspensa/busca das entradas existentes da
coleção referenciada — não precisou de nenhum campo extra além do tipo certo.

⚠️ **Pegadinha ao ler esses campos no código**: o valor em `data.categoria` não é mais
uma string, é um objeto `{ collection, id }`. Para resolver a entrada:
- `getEntry(refObject)` (um argumento só) para uma referência única.
- `getEntries(refArray)` para uma lista de referências (ex. `cidade.data.produtosDestaque`,
  `regiao.data.cidades`).
- Comparar com o `id` de outra entrada é `produto.data.categoria.id === categoria.id`,
  nunca `produto.data.categoria === categoria.id`.

## Rotas das representadas (Tramontina vs. as outras 6 marcas)

Desde agosto/2026, "Representadas" é o item principal do site (não "Catálogo" — essa
rota não existe mais). As 7 marcas (Tramontina, Tuboar, Ártico, Miaki, Netter, Solidus,
Freecook) aparecem em `/representadas` (hub) e no grid da home, mas cada uma resolve
para uma rota diferente dependendo de `temCatalogoOnline`:

- **Tramontina** (`temCatalogoOnline: true`, hoje a única com produtos cadastrados) vive
  em rotas próprias e aninhadas, fora do prefixo `/representada/`:
  - `/tramontina` — hero da marca (lida da entrada `representadas/tramontina.mdoc`) +
    listagem completa por categoria + botão "Pedir catálogo completo" no WhatsApp
    (mensagem usa `nomeCatalogo`). Substitui a antiga `/catalogo`.
  - `/tramontina/[categoria]` — produtos daquela categoria (era `/categoria/[categoria]`)
    + CTA de "pedir catálogo completo".
  - `/tramontina/[categoria]/[produto]` — ficha do produto (era `/produto/[produto]`).
  - Motivo de ficar fora de `/representada/`: pedido explícito do usuário
    ("Tramontina/CatalogoX/ProdutoY"), já que é a única marca com catálogo navegável de
    verdade hoje.
- **As outras 6 marcas** (`temCatalogoOnline: false`) vivem em
  `/representada/[representada]` — uma página única (hero + apresentação em Markdoc +
  botão "Solicitar catálogo no WhatsApp"), sem produtos individuais, porque a Prisma
  ainda não tem esses catálogos digitalizados no site.

`CardRepresentada.astro` decide o href automaticamente: `/${id}` se
`temCatalogoOnline`, senão `/representada/${id}`. Se outra marca ganhar produtos
cadastrados no futuro, o padrão é replicar a árvore de rotas da Tramontina para ela
(não dá pra ter duas marcas em `/[representada]` bare-root ao mesmo tempo — teria dois
arquivos disputando a mesma rota dinâmica de um segmento só).

⚠️ **Logos das marcas**: nenhuma das 7 tem arquivo de logo no repositório ainda — o
campo `logo` é opcional e, sem ele, `CardRepresentada.astro` mostra o nome da marca em
texto (`font-display`) no lugar da imagem. Não faça scraping de logo oficial da internet
(risco de marca registrada e de pegar versão desatualizada/errada) — peça o arquivo
para o usuário e suba em `src/assets/`.

⚠️ **Conteúdo das representadas veio de uma apresentação de 12 slides** (uma por marca),
sem specs técnicas, modelos nomeados, certificações ou garantias — só ano de fundação,
sede e frases de posicionamento genéricas para a maioria. Cada `.mdoc` tem `TODO:` onde
o material fonte não tinha fato concreto. Não invente specs para preencher — peça a
informação real antes de tirar o `TODO`.

## Página de cidade — estrutura (`src/pages/[cidade].astro`)

A página de cada cidade segue uma landing page de 9 seções (não é mais um resumo
genérico) — cada seção lê um campo específico do schema de `cidades` acima:

1. **Hero** — eyebrow + h1 + `heroTexto` + 2 CTAs (orçamento / catálogo) + faixa de
   `provaRapida`.
2. **Reconhecimento do problema** — corpo Markdoc da entrada. Se `imagemFundo` estiver
   preenchida (opcional), a foto vira fundo da seção com um overlay escuro por trás do
   texto — use foto real da cidade/região, nunca banco de imagem genérico.
3. **Categorias** — grid das categorias globais, cada uma com `descricao` real + CTA de
   WhatsApp contextual por categoria. Cada card já linka para `/tramontina/[categoria]`
   (ver "Rotas das representadas" acima) — essa seção continua sendo sobre linhas de
   produto Tramontina, não sobre as outras representadas.
4. **Produtos em destaque** — `produtosDestaque` da cidade, ou fallback para os produtos
   globais com `destaque: true`.

   *(entre a seção 4 e a 5 entram os **blocos** editáveis da cidade — por padrão um
   grid de Representadas; ver "Blocos da home e da cidade" abaixo)*
5. **Como funciona** — 3 passos fixos (WhatsApp → orçamento → entrega/pós-venda), iguais
   para todas as cidades — é uma sequência real, por isso mantém numeração (diferente
   das seções "Segmentos atendidos" e "Por que a Prisma" da home, que são conjuntos, não
   sequência, e por isso não numeram mais).
6. **Objeções / FAQ** — `faq` em acordeão (`<details>`), só aparece se a lista não
   estiver vazia.
7. **Prova social** — depoimento condicional a `depoimentoTexto` não vazio. **Nunca
   invente depoimento** — a seção some sozinha do build se o campo ficar vazio.
8. **CTA final** — bloco de alto contraste.
9. **Outras cidades** — links para as demais cidades `ativa: true`, para linkagem
   interna (evita sinal de doorway page / página órfã).

⚠️ **Mapeamento cidade → região é um chute do desenvolvimento, não confirmado pelo
usuário.** As 8 regiões criadas (`src/content/regioes/`) agrupam as 18 novas cidades por
proximidade geográfica aproximada. Casos incertos: Franco da Rocha ficou em "Região de
Jundiaí / Itupeva" mas geograficamente está mais perto da Grande São Paulo; "Região de
São João / Circuito das Águas" ficou sem nenhuma cidade (nenhuma das cidades pedidas se
encaixa claramente nela — `cidades: []`, com corpo marcado `TODO`). **Revise esse
agrupamento antes de marcar qualquer região como `ativa: true`.**

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

- **Cores** — desde agosto/2026 segue o **guia de cores Prisma** à risca (documento
  fornecido pelo usuário; qualquer decisão de cor nova volta a ele, não a gosto pessoal).
  Tokens Tailwind via `@theme` em `global.css`:
  - `navy` `#1B3556` — estrutura, títulos, no máximo **duas** seções de fundo por
    página (normalmente hero + CTA final), **nunca** duas seções navy coladas.
  - `aco` `#4A6E92` — texto de apoio (corpo em fundo claro), bordas, hover.
  - `areia` `#E4DCCF` — fundo de seção alternada (o "respiro" entre navys).
  - `papel` `#FBFAF8` — fundo de leitura padrão (header, footer e a maioria das
    seções claras).
  - `verde` `#5C7A62` (hover `#516B56`, token estático) — só confirmação/garantia/selo
    (ex.: "nota fiscal e garantia de fábrica"). **Nunca** fundo de botão (ver correção
    de outubro/2026 abaixo — a regra anterior, "todo botão de WhatsApp em verde", foi
    revertida e dividida em duas cores).
  - `azul` `#0A7BCE` (hover `#096CB5`, token estático, amostrado da referência visual
    do usuário) — cor do CTA institucional padrão (`BotaoWhatsApp` variante `azul`,
    a default do componente). Usado mesmo quando o botão abre o WhatsApp por trás,
    desde que não esteja explicitamente rotulado "WhatsApp" (ex. "Solicitar Orçamento"
    no hero da home). Ícone: seta (→), nunca o ícone do WhatsApp.
  - `whatsapp` `#25D366` (hover `#21BA5A`, token estático, verde oficial da marca
    WhatsApp) — só para os pontos de contato **explicitamente rotulados/iconografados
    como WhatsApp**: botão compacto do header/menu mobile ("Fale conosco"), bolha
    flutuante (`WhatsAppFlutuante.astro`) e o botão de envio de
    `/area-de-atendimento` ("Continuar no WhatsApp"). Ícone: logo do WhatsApp. Não
    confundir com `verde` acima — são tokens e usos diferentes.
  - `cinza` `#8E8E8E` — só legenda/metadado/divisor (eyebrow em caixa alta, rodapé,
    código de produto). **Nunca** texto de corpo.
  - `marinho` `#001B34` (token estático, sem hover — não é botão) — **só fundo do
    `Header.astro` e do `Footer.astro`** (referência visual enviada pelo usuário em
    outubro/2026). Mais escuro que o `navy` acima; não confundir nem substituir um
    pelo outro fora desses dois componentes (navy continua a âncora do corpo das
    páginas — hero, CTA final). Texto sobre `marinho` é sempre `papel`/`areia` em
    variações de opacidade (`text-areia/75`, `/50` etc.), nunca `navy`/`cinza`.
  - A cor de destaque (laranja) **não** é um token Tailwind fixo — continua vindo do
    singleton "Aparência" via CSS vars dinâmicas injetadas em `Layout.astro`:
    `--color-accent` (decorativo — ícone, borda, sublinhado de link ativo;
    **nunca** fundo de botão) e `--color-accent-cta` (preenchimento de botão —
    default `#B85A28`, a única combinação com texto branco que passa AA; branco
    sobre o laranja decorativo `#D4703A` reprova em 3,4:1). Usado em todo CTA que
    **não** abre WhatsApp (ex.: botão de link interno no bloco `cta`). Ver
    `src/lib/aparencia.ts` (`corDestaqueCta`/`corDestaqueCtaHover`) — se o usuário
    customizar `corDestaque` no Keystatic para uma cor fora do padrão, a variante de
    botão é derivada por escurecimento, não fica idêntica ao guia.
  - **Ritmo de seções**: alterne `papel`/`areia` entre as âncoras `navy` — nunca
    duas seções escuras seguidas. Ver `src/components/BlocoRenderer.astro` (mapa
    `corFundo`) e a estrutura de `[cidade].astro` (hero e CTA final são as duas
    âncoras navy da página; "Como funciona" e "Prova social" usam `areia`).
  - Antes de mudar cor de qualquer coisa, faça a auditoria do guia: no máx. 2 navy
    por página, nunca coladas; laranja só em elemento clicável, nunca fundo de botão
    (máx. 3 por tela); verde só em selo/confirmação ou botão de WhatsApp; texto de
    corpo nunca em cinza.
- **Tipografia**: `League Gothic` (títulos grandes / wordmark, classe `font-display`),
  `Public Sans` (texto e UI, classe `font-sans`, padrão do `body`), `IBM Plex Mono`
  (rótulos "eyebrow" em caixa alta, classe `font-mono`). Os três `.woff2` estão
  auto-hospedados em `public/fonts/` (baixados uma vez do Google Fonts, subset `latin` —
  cobre a acentuação do português) e declarados via `@font-face` em `global.css`. Isso é
  uma exceção deliberada à regra de "sem fonte externa": os arquivos vivem no repo, o
  site publicado não faz nenhuma requisição a serviço externo de fonte em runtime.
- **Logo**: ⚠️ **nunca use `astro:assets`/`<Image>` para o ícone da Prisma.** Em
  outubro/2026 a renderização em produção (Cloudflare Workers) mostrou o ícone com um
  **fundo preto sólido e cortado** — confirmado como bug do pipeline de otimização de
  imagem do Cloudflare (ele achata a transparência do PNG contra preto em alguns
  tamanhos), não um problema do arquivo fonte (`hasAlpha: true` confirmado via `sharp`
  nos dois arquivos). A correção foi parar de processar esse asset pelo Astro: o ícone
  vive em `public/img/logo-icon.png` (fora de `src/assets/`, nunca passa pelo pipeline
  de imagem) e `Logo.astro` o referencia com um `<img>` comum (`src="/img/logo-icon.png"`),
  nunca com `<Image>`/`getImage()`. Qualquer asset que mostrar o mesmo sintoma (fundo
  preto/corte em produção mas não em dev) deve receber o mesmo tratamento: mover para
  `public/` e usar `<img>` puro.

  `Logo.astro` (usado só em `Header.astro`/`Footer.astro`, ambos em fundo `marinho`
  escuro — ver guia de cores) tipografa "PRISMA"/"Equipamentos" ao lado do ícone em
  `font-display`/`font-sans`, em cor clara (`text-papel`/`text-areia`) — não usa o
  lockup rasterizado com texto (`src/assets/logo-header.png`/`logo-completo.png`)
  porque esses arquivos têm o texto em navy/cinza escuro, ilegível sobre fundo escuro.
  Esses dois PNGs continuam no repo (não referenciados em nenhum componente hoje) só
  pra uso futuro fora do header/footer, caso surja um contexto de fundo claro pro
  lockup completo.

⚠️ **Manual de padronização (outubro/2026)**: o usuário enviou um "Manual de
Desenvolvimento e Padronização do Site" completo (menu, página inicial, páginas de
marca, página de cidade, SEO, WhatsApp, responsividade, regras de conteúdo). As
diretrizes já incorporadas ao código: botão de WhatsApp em `verde` (ver guia de cores
acima), logo oficial (ver acima), menu principal reordenado (`Header.astro`/
`Footer.astro`: Início/Marcas/Soluções/Segmentos/Atendimento regional/Contato — "Marcas"
é a antiga label "Representadas", "Atendimento regional" é a antiga "Área de
atendimento"), páginas novas `/solucoes` (representadas agrupadas por `segmento`,
reaproveitando o dado que já existia — não é uma coleção nova) e `/contato` (mesmas
informações já confirmadas no rodapé, nada inventado) e `/segmentos` (lista a coleção
`segmentos`). "Sobre" não está no menu prescrito pelo manual, mas continua linkada no
rodapé — não foi removida.

As páginas de marca (`/representada/[representada].astro` e `/tramontina/index.astro`)
seguem as 8 seções do manual (banner, apresentação, categorias, fotos, diferenciais,
segmentos atendidos, CTA, outras soluções relacionadas) — seções 3 a 6 são os campos
opcionais novos de `representadas` (ver "Modelo de conteúdo" acima) e só aparecem
quando preenchidos; nenhuma seção vazia ou com placeholder vai ao ar. `Layout.astro`
ganhou um prop `image?: ImageMetadata` opcional que gera `og:image`/`twitter:image`
(via `getImage()`) quando a página passa uma imagem — hoje só as páginas de marca
passam `logo` nesse prop, quando a marca tiver logo cadastrado.

Fotografia real de fundo: **este ambiente de execução não tem acesso de rede para
baixar imagens de banco de imagens** (proxy de saída bloqueia hosts fora de uma
allowlist fixa — testado com Unsplash, recusado pelo proxy) — só é possível usar
arquivo enviado pelo próprio usuário. Em outubro/2026 o usuário enviou uma foto real de
cozinha profissional (`src/assets/hero/cozinha-profissional.webp`), usada como fundo
full-bleed do **hero da home** (`index.astro`, com overlay em gradiente navy para
legibilidade do texto — substituiu o antigo painel animado com a lista de
representadas, que o usuário marcou como incorreto). **Ainda pendentes** pelo mesmo
motivo (sem arquivo do usuário ainda): hero de cidade, seção "Atendimento regional" e
CTA final continuam em cor chapada (`navy`/`areia`/`papel`). Quando o usuário mandar
fotos reais de produto/aplicação por marca, entram em `representadas.imagens` (seção 4)
e em `categoriasProdutos`/`diferenciais` conforme o material confirmar.

⚠️ **Logos das representadas**: nenhuma das 7 marcas tinha o arquivo oficial de logo —
em outubro/2026, a pedido do usuário ("coloque uma imagem que represente a logo da
empresa que eu mudo futuramente para a correta"), foram geradas **imagens-placeholder
locais** (via `sharp`, sem rede — círculo navy com a inicial da marca + nome +
"LOGO PROVISÓRIO", nunca um logo real inventado) em `src/assets/representadas/
<slug>-logo.png`, referenciadas no campo `logo` de cada `.mdoc`. **Troque pelo arquivo
oficial assim que o usuário enviar** — basta substituir o PNG e, se o nome do arquivo
mudar, atualizar o campo `logo` da entrada correspondente (ou pelo próprio Keystatic).

`CardRepresentada.astro` foi simplificado em duas rodadas de outubro/2026: primeiro
removeu `nome`/`descricaoCurta` do card (só logo + segmento ficaram), depois removeu
a caixa inteira (borda/sombra/fundo `areia`) a pedido do usuário ("tirar o quadrado em
volta de cada representada e deixa apenas o logo e area de atuação") — hoje é só
`<a>` + logo centralizada + legenda do segmento embaixo, sem nenhum fundo, pensado pra
ficar lado a lado em fileira ("logo wall"), não em grid de cards. Por isso todo
container que usa esse componente mudou de `grid grid-cols-N` pra
`flex flex-wrap items-start gap-x-N gap-y-N` — ver `BlocoRenderer.astro` (blocos
`representadas` e `solucoes`) e `src/pages/representadas.astro`. `nome`/
`descricaoCurta` continuam no schema e aparecem na página própria de cada marca, só
não mais em nenhum card de listagem.

## Estrutura da home (`src/pages/index.astro`)

Desde outubro/2026 a home segue uma referência visual específica do usuário (não é
mais um page-builder genérico do topo ao rodapé) — nessa ordem:

1. **Hero** — foto real full-bleed (`src/assets/hero/cozinha-profissional.webp`) com
   overlay em gradiente navy, fixo em código (não editável por bloco).
2. **Faixa de confiança** — 4 ícones fixos em código (não é bloco).
3. **"Nossas representadas"** — ainda é o bloco `representadas` do Keystatic
   (`aparencia.blocos`, filtrado por `tipo === 'representadas'`), agora em layout de
   logo wall (ver acima). Título/subtítulo/cor de fundo continuam editáveis no painel.
4. **"Soluções por categoria"** — **fixo em código**, não é mais o bloco `solucoes`.
   Reaproveita a mesma coleção `representadas` (dedup por `segmento`, mesma lógica que
   já existia), renderizada com o novo componente `CardCategoria.astro` (ícone genérico
   por palavra-chave do segmento + `descricaoCurta` real da marca + "Ver solução →").
5. **"Soluções para todos os segmentos"** — **fixo em código**, não é mais o bloco
   `segmentos`. Ícones da coleção `segmentos` real (Restaurantes, Hotéis e Pousadas,
   Resorts, Buffets e Eventos — **não** os rótulos genéricos da referência visual do
   usuário, tipo "Hospitais"/"Indústrias Alimentícias", que não existem na coleção e
   não foram confirmados) + painel com foto real de Campinas
   (`src/assets/campinas/imagemFundo.jpg`, já usada no hero da cidade) e selo
   "Campinas · SP", replicando o padrão da referência.
6. **CTA final** — ainda é o bloco `cta` do Keystatic (filtrado igual ao passo 3),
   mantido por decisão própria (não pedido explicitamente nessa rodada) porque toda
   página do site termina em CTA de conversão — remover deixaria a home sem nenhuma
   chamada após a seção de segmentos.

Os blocos `solucoes`, `segmentos`, `cards` e `cidades` foram **removidos de
`aparencia.json`** (a home não os renderiza mais) mas os *tipos* de bloco continuam
existindo no schema/Keystatic/`BlocoRenderer.astro` — podem voltar a ser usados em
página de cidade ou reativados na home se o usuário pedir. Página de cidade ganhou uma
linha de localização no hero (`{nome} - {estado} · Interior de São Paulo`, dado já
confirmado, sem geografia inventada tipo "Região Metropolitana").

## Header e Footer — tema escuro (`marinho`)

Desde outubro/2026, `Header.astro` e `Footer.astro` têm fundo `marinho` (`#001B34`,
ver guia de cores) em vez de `papel`, por pedido explícito do usuário com referência
visual. Mudanças relacionadas:
- Todo texto/ícone sobre esses dois componentes usa `papel`/`areia` em opacidade
  variável — nunca `navy`/`cinza` (ficam ilegíveis em fundo escuro).
- `Header.astro` ganhou indicador de link ativo (sublinhado + cor de destaque,
  comparando `Astro.url.pathname` com o `href` de cada item) — só existia o hover antes.
- Botão do WhatsApp (`bg-whatsapp`) não mudou, já tinha contraste bom em qualquer fundo.

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
2. Preencha `metaTitle`/`metaDescription`, `segmentosFortes`, `prazoEntrega`,
   `heroTexto`, `provaRapida` e `faq` com informação real e específica daquela cidade —
   e um corpo em Markdoc com o reconhecimento do problema (seção 2), também específico
   dessa praça (não copie o texto de outra cidade). `produtosDestaque` e o depoimento
   (`depoimentoTexto`/`depoimentoAutor`/`depoimentoEstabelecimento`) são opcionais.
3. **Só marque `ativa: true` quando a cidade tiver pelo menos três informações
   verdadeiras e específicas sobre o atendimento ali** (ex.: prazo de entrega real,
   frequência de visita real, um produto ou depoimento específico) — esse é o critério
   do blueprint de landing page de cidade para evitar o risco de "doorway page". Os 18
   arquivos criados na expansão de agosto/2026 estão todos como `ativa: false` e com
   `TODO:` nos campos que ainda faltam preencher, exatamente por não atenderem esse
   critério ainda.
4. `ativa: false` remove a página do build sem apagar o arquivo — o conteúdo continua
   editável no Keystatic até estar pronto para publicar.
5. Toda cidade nova recebe (ou deveria receber, se criada fora do Keystatic) um bloco
   `representadas` em `blocos` — ver "Blocos da home e da cidade" abaixo. Editável por
   cidade, não precisa ser igual em todas.

## Como adicionar uma região

1. Pelo Keystatic (`/keystatic` → Regiões → Criar) ou direto em
   `src/content/regioes/<slug>.mdoc`.
2. `cidades` é uma lista de referências a entradas de `cidades` já existentes — escolha
   pela lista suspensa do painel.
3. Mesma regra de `ativa`: só publique quando o agrupamento de cidades estiver
   confirmado e o corpo (introdução da região) tiver conteúdo real, não um `TODO`.

## Como adicionar um produto

Produto é sempre da Tramontina (é a única representada com catálogo navegável — ver
"Rotas das representadas" acima).

1. Pelo Keystatic (`/keystatic` → Produtos → Criar) ou direto em
   `src/content/produtos/<slug>.mdoc`.
2. `categoria` é uma referência (`reference('categorias')`/`fields.relationship`) — no
   painel é uma lista suspensa das categorias existentes; editando o arquivo à mão, use
   o slug (nome do arquivo, sem `.mdoc`) de uma entrada de `src/content/categorias/`.
3. Adicione a imagem em `src/assets/` e referencie no campo `imagem`.
4. `destaque: true` faz o produto aparecer na home e nas páginas de cidade.
5. A URL final é `/tramontina/<categoria>/<slug-do-produto>` — gerada automaticamente
   por `src/pages/tramontina/[categoria]/[produto].astro`, nada a configurar.

## Como adicionar uma representada

1. Pelo Keystatic (`/keystatic` → Representadas → Criar) ou direto em
   `src/content/representadas/<slug>.mdoc`.
2. Preencha `segmento`, `descricaoCurta` e `nomeCatalogo` com informação real — nunca
   invente specs, certificações ou modelos que não vieram de fonte confirmada (ver aviso
   em "Rotas das representadas" sobre a apresentação de 12 slides que originou o
   conteúdo atual).
3. Deixe `temCatalogoOnline` desmarcado a menos que você também vá cadastrar produtos
   dessa marca em `src/content/produtos/` e replicar a árvore de rotas da Tramontina —
   sem isso, a página fica só com apresentação + botão de WhatsApp.
4. `categoriasProdutos`, `imagens`, `diferenciais` e `segmentosAtendidos` são opcionais
   (seções 3-6 do manual de padronização) — preencha só quando tiver material/dado
   confirmado; a seção correspondente simplesmente não aparece se ficar vazio.

## Como mudar o layout sem mexer em código

Existe um singleton **"Aparência do site"** no Keystatic (`/keystatic` → Aparência),
gravado em `src/content/aparencia/aparencia.json` e lido por `src/lib/aparencia.ts`
(com valores padrão de fallback caso o arquivo não exista). Ele controla, sem precisar
editar nenhum componente:

- **Cor de destaque** (`corDestaque`, hex) — aplicada via três variáveis CSS injetadas
  uma vez no `<html>` do `Layout.astro`: `--color-accent` (decorativo), `--color-accent-cta`
  e `--color-accent-cta-hover` (preenchimento de botão — ver guia de cores acima). Todo
  botão de ação usa `bg-[var(--color-accent-cta)]` (ex.: `BotaoWhatsApp.astro`,
  `WhatsAppFlutuante.astro`, `Header.astro`) — nunca `--color-accent` puro como fundo de
  botão. Muda a cor do site inteiro a partir de um único campo no painel.
- **Título e texto do hero** da home (`heroTitulo`, `heroTexto`).
- **Linha extra do rodapé** (`textoRodapeExtra`), opcional.
- **Blocos da home** (`blocos`) — ver seção seguinte.

### Blocos da home e da cidade (page builder via Keystatic)

O corpo da home (tudo abaixo do hero, que continua fixo/codificado em `index.astro`) e
um trecho da página de cidade (entre "Produtos em destaque" e "Como funciona", ver
`[cidade].astro`) são uma lista de blocos editável pelo Keystatic — em Aparência →
"Blocos da home", ou por cidade em Cidades → `<cidade>` → "Blocos da cidade":
**arrastar para reordenar, adicionar, remover e escolher a cor de fundo de cada bloco**,
sem tocar em código. É construído com o mecanismo nativo do Keystatic para isso —
`fields.array(fields.conditional(...))`, fatorado em `blocosField()` no
`keystatic.config.ts` e reutilizado nos dois lugares — não trouxe nenhuma dependência
nova.

Tipos/campos e leitura são compartilhados entre home e cidade via `src/lib/blocos.ts`
(`Bloco`, `CorFundo`, `paraBlocos()`); `src/lib/aparencia.ts` usa isso para o singleton,
`[cidade].astro` chama `paraBlocos(cidade.data.blocos)` direto. Tipos de bloco
disponíveis (o discriminante fica em `bloco.tipo` depois de `paraBlocos()`):
- `segmentos` — grid da coleção `segmentos` (título/subtítulo + cor de fundo).
- `representadas` — grid da coleção `representadas` (título/subtítulo + cor de fundo).
  **Todas as 20 páginas de cidade já vêm com um bloco desse por padrão** (seed feito em
  agosto/2026, editável/removível por cidade no Keystatic).
- `solucoes` — mesma coleção `representadas`, mas deduplicada por `segmento` (um card
  por categoria/necessidade, não por marca) + link "Ver todas as soluções →" para
  `/solucoes`. Cobre a seção "Soluções por categoria" do manual de padronização.
- `cidades` — lista as cidades `ativa: true` + link "Ver área de atendimento completa →"
  para `/area-de-atendimento`. Cobre a seção "Atendimento regional" do manual.
- `cards` — lista de cards manuais (`itens: {titulo, descricao}[]`) — usado hoje para
  "Por que a Prisma" na home.
- `cta` — chamada para ação: texto + botão que abre WhatsApp (`botaoMensagemWhatsapp`)
  **ou** navega para uma página interna (`botaoLink`, ex. `/area-de-atendimento`) —
  preencha só um dos dois.

`corFundo` é sempre um select fechado (`papel` / `areia` / `navy`, ver guia de cores),
nunca hex livre — de propósito, pra não dar pra quebrar o contraste do texto (fixo por
tom em `BlocoRenderer.astro`) nem o limite de "no máx. 2 navy por página, nunca
coladas".

⚠️ **Formato bruto no JSON/frontmatter**: um campo `fields.conditional` do Keystatic
grava cada item como `{ discriminant: "tipo", value: { ...campos } }`, não um objeto
plano — ver o comentário em `src/lib/blocos.ts` (`BlocoBruto`) antes de mexer nesses
arquivos à mão. Em `cidades`, o campo correspondente no Zod (`content.config.ts`) é
tipado igual (`{ discriminant, value: Record<string, unknown> }`), sem achatar — quem
achata pra `{tipo, ...}` é sempre `paraBlocos()`.

⚠️ **Escopo atual**: home e cidade usam blocos; representada e demais páginas continuam
com estrutura fixa em componente (o usuário pediu "page builder completo"; a versão
viável dentro da stack combinada — sem trazer um editor visual externo — é esse
mecanismo de blocos do Keystatic). Estender a outras páginas é só repetir o padrão:
campo `blocos` no schema da coleção + `blocosField(label)` no Keystatic + `paraBlocos()`
+ `<BlocoRenderer>` na página.

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
- **Sem filtro avançado, área de cliente, blog ou newsletter.** A única exceção pedida
  pelo usuário é a busca por nome de cidade em `/area-de-atendimento` (filtro de texto
  client-side em cima da lista de cidades ativas, sem backend) — não estenda busca para
  outras páginas sem pedido explícito.
- **Formulário de `/area-de-atendimento`** (nome, CNPJ, cidade) não envia dado a
  nenhum backend/planilha — só monta a mensagem e abre `wa.me` no client (`<script
  define:vars>`). Não adicione armazenamento server-side sem que o usuário peça.
- **Sem cidades além das já cadastradas** sem pedido explícito.
- **Sem imagens ou fontes de serviço externo em runtime** — assets ficam no repo
  (`src/assets/`, `public/fonts/`); fontes do Google foram baixadas uma vez e são
  auto-hospedadas, nunca carregadas de `fonts.googleapis.com` em produção.
- **Sem texto de marketing genérico** — onde faltar conteúdo real, use `TODO:`
  explícito no corpo/campos.
