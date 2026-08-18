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
        mostrarPorQueAPrisma: fields.checkbox({
          label: 'Mostrar seção "Por que a Prisma" na home',
          defaultValue: true,
        }),
        mostrarCidades: fields.checkbox({
          label: 'Mostrar seção "Cidades atendidas" na home',
          defaultValue: true,
        }),
        textoRodapeExtra: fields.text({
          label: 'Linha extra no rodapé',
          description: 'Opcional — ex. endereço, horário de atendimento',
        }),
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

        produtosDestaque: fields.multiRelationship({
          label: 'Produtos em destaque desta cidade (seção 4)',
          collection: 'produtos',
          description: 'Opcional — se vazio, usa os produtos com "Destaque" marcado globalmente',
        }),

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
  },
});
