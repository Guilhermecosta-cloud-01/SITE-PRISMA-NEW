import { config, fields, collection, singleton } from '@keystatic/core';

// Em dev local (ex.: Codespaces), o Keystatic grava direto no disco e você
// mesmo dá commit/push. Em produção (site publicado em /keystatic), não há
// checkout de git gravável — o painel autentica com GitHub e grava via API,
// exigindo as variáveis de ambiente KEYSTATIC_GITHUB_CLIENT_ID,
// KEYSTATIC_GITHUB_CLIENT_SECRET e KEYSTATIC_SECRET (ver CLAUDE.md).
// O projeto Astro fica na subpasta prisma-site/ do repositório (não na raiz).
// Em modo local isso não importa (o painel roda com cwd em prisma-site/, e os
// paths das coleções abaixo já são relativos a isso). Em modo GitHub, porém,
// a API do GitHub grava relativo à RAIZ do repositório — sem pathPrefix, os
// arquivos vão parar em src/content/... na raiz, fora de prisma-site/, e o
// Astro nunca os vê.
const storage: import('@keystatic/core').Config['storage'] =
  process.env.NODE_ENV === 'production'
    ? {
        kind: 'github',
        repo: 'guilhermecosta-cloud-01/site-prisma-new',
        pathPrefix: 'prisma-site',
      }
    : { kind: 'local' };

// Fundo de bloco: só permite os tons já existentes na paleta da marca (nunca
// hex livre) para o editor de blocos não conseguir quebrar o contraste do
// texto, que já é fixo por tom (claro/branco = texto navy, escuro = texto creme).
const corFundoField = fields.select({
  label: 'Fundo',
  description:
    'Alterne entre seções — nunca duas seguidas em "Navy (escuro)". Papel é o padrão de leitura, Areia é o respiro de seção alternada.',
  options: [
    { label: 'Papel (claro, padrão)', value: 'papel' },
    { label: 'Areia (claro, alternado)', value: 'areia' },
    { label: 'Navy (escuro — no máx. 2 por página)', value: 'navy' },
  ],
  defaultValue: 'papel',
});

// Mecanismo de "blocos" reutilizado pelo singleton Aparência (home) e pela
// coleção Cidades (ver src/lib/blocos.ts para o tipo TS espelhando isso, e
// CLAUDE.md "Blocos da home / da cidade" para o porquê do formato bruto
// { discriminant, value } no JSON/frontmatter — é o jeito que o Keystatic
// grava fields.conditional, não é um objeto plano).
function blocosField(label: string) {
  return fields.array(
    fields.conditional(
      fields.select({
        label: 'Tipo de bloco',
        options: [
          { label: 'Segmentos atendidos (grid)', value: 'segmentos' },
          { label: 'Representadas (grid)', value: 'representadas' },
          { label: 'Cards de destaque', value: 'cards' },
          { label: 'Chamada para ação (CTA)', value: 'cta' },
        ],
        defaultValue: 'segmentos',
      }),
      {
        segmentos: fields.object({
          titulo: fields.text({ label: 'Título da seção', validation: { isRequired: true } }),
          subtitulo: fields.text({ label: 'Subtítulo (eyebrow, opcional)' }),
          corFundo: corFundoField,
        }),
        representadas: fields.object({
          titulo: fields.text({ label: 'Título da seção', validation: { isRequired: true } }),
          subtitulo: fields.text({ label: 'Subtítulo (eyebrow, opcional)' }),
          corFundo: corFundoField,
        }),
        cards: fields.object({
          titulo: fields.text({ label: 'Título da seção', validation: { isRequired: true } }),
          subtitulo: fields.text({ label: 'Subtítulo (eyebrow, opcional)' }),
          corFundo: corFundoField,
          itens: fields.array(
            fields.object({
              titulo: fields.text({ label: 'Título', validation: { isRequired: true } }),
              descricao: fields.text({
                label: 'Descrição',
                multiline: true,
                validation: { isRequired: true },
              }),
            }),
            {
              label: 'Itens',
              itemLabel: (props) => props.fields.titulo.value || 'Item',
            },
          ),
        }),
        cta: fields.object({
          titulo: fields.text({ label: 'Título', validation: { isRequired: true } }),
          texto: fields.text({ label: 'Texto', multiline: true, validation: { isRequired: true } }),
          corFundo: corFundoField,
          botaoTexto: fields.text({ label: 'Texto do botão', validation: { isRequired: true } }),
          botaoMensagemWhatsapp: fields.text({
            label: 'Mensagem do WhatsApp',
            description: 'Preencha se o botão deve abrir o WhatsApp com essa mensagem',
            multiline: true,
          }),
          botaoLink: fields.text({
            label: 'Link interno',
            description:
              'Preencha em vez da mensagem de WhatsApp se o botão deve levar a uma página do site (ex.: /area-de-atendimento)',
          }),
        }),
      },
    ),
    {
      label,
      description:
        'Arraste para reordenar, adicione ou remova blocos para montar a página. A seção de hero não é um bloco — fica sempre fixa no topo.',
      itemLabel: (props) => props.discriminant,
    },
  );
}

export default config({
  storage,
  singletons: {
    aparencia: singleton({
      label: 'Aparência do site',
      path: 'src/content/aparencia/aparencia',
      format: 'json',
      schema: {
        corDestaque: fields.text({
          label: 'Cor de destaque (botões e links)',
          description: 'Código hex, ex: #D4703A',
          defaultValue: '#D4703A',
          validation: { isRequired: true, length: { min: 4, max: 9 } },
        }),
        heroTitulo: fields.text({
          label: 'Título do hero (home)',
          validation: { isRequired: true },
        }),
        heroTexto: fields.text({
          label: 'Texto do hero (home)',
          multiline: true,
          validation: { isRequired: true },
        }),
        textoRodapeExtra: fields.text({
          label: 'Linha extra no rodapé',
          description: 'Opcional — ex. endereço, horário de atendimento',
        }),
        blocos: blocosField('Blocos da home'),
      },
    }),
  },
  collections: {
    produtos: collection({
      label: 'Produtos',
      slugField: 'nome',
      path: 'src/content/produtos/*',
      format: { contentField: 'content' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome' } }),
        categoria: fields.relationship({
          label: 'Categoria',
          collection: 'categorias',
          validation: { isRequired: true },
        }),
        codigo: fields.text({ label: 'Código', description: 'Opcional' }),
        imagem: fields.image({
          label: 'Imagem',
          directory: 'src/assets',
          publicPath: '../../assets/',
          validation: { isRequired: true },
        }),
        specs: fields.array(fields.text({ label: 'Especificação' }), {
          label: 'Especificações',
          itemLabel: (props) => props.value || 'Especificação',
        }),
        aplicacao: fields.text({
          label: 'Aplicação',
          multiline: true,
          validation: { isRequired: true },
        }),
        destaque: fields.checkbox({ label: 'Destaque', defaultValue: false }),
        ordem: fields.number({ label: 'Ordem', defaultValue: 99 }),
        content: fields.markdoc({ label: 'Conteúdo' }),
      },
    }),
    categorias: collection({
      label: 'Categorias',
      slugField: 'nome',
      path: 'src/content/categorias/*',
      format: { contentField: 'content' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome' } }),
        descricao: fields.text({
          label: 'Descrição',
          multiline: true,
          validation: { isRequired: true },
        }),
        imagem: fields.image({
          label: 'Imagem',
          directory: 'src/assets',
          publicPath: '../../assets/',
        }),
        ordem: fields.number({ label: 'Ordem', defaultValue: 1 }),
        content: fields.markdoc({ label: 'Conteúdo' }),
      },
    }),
    cidades: collection({
      label: 'Cidades',
      slugField: 'nome',
      path: 'src/content/cidades/*',
      format: { contentField: 'content' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome' } }),
        estado: fields.text({ label: 'Estado', defaultValue: 'SP' }),
        metaTitle: fields.text({ label: 'Meta título', validation: { isRequired: true } }),
        metaDescription: fields.text({
          label: 'Meta descrição',
          multiline: true,
          validation: { isRequired: true },
        }),
        segmentosFortes: fields.array(fields.text({ label: 'Segmento' }), {
          label: 'Segmentos fortes',
          itemLabel: (props) => props.value || 'Segmento',
        }),
        prazoEntrega: fields.text({
          label: 'Prazo de entrega',
          validation: { isRequired: true },
        }),
        ativa: fields.checkbox({
          label: 'Ativa',
          description: 'Só marque quando a página tiver conteúdo real e específico dessa cidade',
          defaultValue: true,
        }),

        heroTexto: fields.text({
          label: 'Texto do hero (seção 1)',
          description: 'Linhas de produto + garantia/visita/entrega. Varie de verdade por cidade.',
          multiline: true,
          validation: { isRequired: true },
        }),
        provaRapida: fields.array(fields.text({ label: 'Item' }), {
          label: 'Faixa de prova rápida (seção 1)',
          description: 'Ex.: "Entrega em 48h úteis" — só fatos verdadeiros, sem ícone decorativo',
          itemLabel: (props) => props.value || 'Item',
        }),

        imagemFundo: fields.image({
          label: 'Imagem de fundo (seção 2 — gatilho visual)',
          description:
            'Opcional. Foto real da cidade (fachada, região, evento local) usada como fundo atrás do texto de reconhecimento do problema. Não use banco de imagem genérico.',
          directory: 'src/assets',
          publicPath: '../../assets/',
        }),

        produtosDestaque: fields.multiRelationship({
          label: 'Produtos em destaque desta cidade (seção 4)',
          collection: 'produtos',
          description: 'Opcional — se vazio, usa os produtos com "Destaque" marcado globalmente',
        }),

        blocos: blocosField('Blocos da cidade'),

        faq: fields.array(
          fields.object({
            pergunta: fields.text({ label: 'Pergunta', validation: { isRequired: true } }),
            resposta: fields.text({
              label: 'Resposta',
              multiline: true,
              validation: { isRequired: true },
            }),
          }),
          {
            label: 'Perguntas frequentes / objeções (seção 6)',
            itemLabel: (props) => props.fields.pergunta.value || 'Pergunta',
          },
        ),

        depoimentoTexto: fields.text({
          label: 'Depoimento (seção 7, opcional)',
          description: 'Deixe vazio se ainda não tiver — não invente depoimento',
          multiline: true,
        }),
        depoimentoAutor: fields.text({ label: 'Nome de quem deu o depoimento' }),
        depoimentoEstabelecimento: fields.text({ label: 'Estabelecimento e cidade' }),

        content: fields.markdoc({
          label: 'Reconhecimento do problema (seção 2)',
          description: '2-3 parágrafos curtos sobre a dor real do comprador dessa cidade',
        }),
      },
    }),
    regioes: collection({
      label: 'Regiões',
      slugField: 'nome',
      path: 'src/content/regioes/*',
      format: { contentField: 'content' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome' } }),
        metaTitle: fields.text({ label: 'Meta título', validation: { isRequired: true } }),
        metaDescription: fields.text({
          label: 'Meta descrição',
          multiline: true,
          validation: { isRequired: true },
        }),
        cidades: fields.multiRelationship({
          label: 'Cidades desta região',
          collection: 'cidades',
          validation: { length: { min: 1 } },
        }),
        ordem: fields.number({ label: 'Ordem', defaultValue: 99 }),
        ativa: fields.checkbox({ label: 'Ativa', defaultValue: true }),
        content: fields.markdoc({ label: 'Conteúdo (introdução da região)' }),
      },
    }),
    representadas: collection({
      label: 'Representadas',
      slugField: 'nome',
      path: 'src/content/representadas/*',
      format: { contentField: 'content' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome' } }),
        segmento: fields.text({
          label: 'Segmento',
          description: 'Ex.: "Exaustão industrial", "Refrigeração comercial"',
          validation: { isRequired: true },
        }),
        descricaoCurta: fields.text({
          label: 'Descrição curta (tagline)',
          multiline: true,
          validation: { isRequired: true },
        }),
        logo: fields.image({
          label: 'Logo',
          description: 'Opcional — enquanto não tiver o arquivo, o site mostra o nome da marca em texto',
          directory: 'src/assets',
          publicPath: '../../assets/',
        }),
        nomeCatalogo: fields.text({
          label: 'Nome do catálogo',
          description: 'Usado na mensagem de WhatsApp do botão "Pedir catálogo". Ex.: "Catálogo Tuboar"',
          validation: { isRequired: true },
        }),
        temCatalogoOnline: fields.checkbox({
          label: 'Tem catálogo navegável no site',
          description:
            'Só marque se essa marca já tiver produtos/categorias cadastrados no site (hoje, só a Tramontina)',
          defaultValue: false,
        }),
        ordem: fields.number({ label: 'Ordem', defaultValue: 99 }),
        ativa: fields.checkbox({ label: 'Ativa', defaultValue: true }),
        content: fields.markdoc({ label: 'Apresentação da marca' }),
      },
    }),
    segmentos: collection({
      label: 'Segmentos atendidos',
      slugField: 'nome',
      path: 'src/content/segmentos/*',
      format: { contentField: 'content' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome' } }),
        descricao: fields.text({
          label: 'Descrição',
          multiline: true,
          validation: { isRequired: true },
        }),
        imagem: fields.image({
          label: 'Imagem',
          description: 'Opcional',
          directory: 'src/assets',
          publicPath: '../../assets/',
        }),
        ordem: fields.number({ label: 'Ordem', defaultValue: 99 }),
        ativa: fields.checkbox({ label: 'Ativa', defaultValue: true }),
        content: fields.markdoc({
          label: 'Observações (opcional)',
          description: 'Não usado no site — só um campo livre caso precise anotar algo sobre esse segmento',
        }),
      },
    }),
  },
});
