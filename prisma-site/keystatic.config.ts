import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    produtos: collection({
      label: 'Produtos',
      slugField: 'nome',
      path: 'src/content/produtos/*',
      format: { contentField: 'content' },
      schema: {
        nome: fields.slug({ name: { label: 'Nome' } }),
        categoria: fields.text({ label: 'Categoria' }),
        codigo: fields.text({ label: 'Código', description: 'Opcional' }),
        imagem: fields.image({
          label: 'Imagem',
          directory: 'src/assets',
          publicPath: '../../assets/',
        }),
        specs: fields.array(fields.text({ label: 'Especificação' }), {
          label: 'Especificações',
          itemLabel: (props) => props.value || 'Especificação',
        }),
        aplicacao: fields.text({ label: 'Aplicação', multiline: true }),
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
        descricao: fields.text({ label: 'Descrição', multiline: true }),
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
        metaTitle: fields.text({ label: 'Meta título' }),
        metaDescription: fields.text({ label: 'Meta descrição', multiline: true }),
        segmentosFortes: fields.array(fields.text({ label: 'Segmento' }), {
          label: 'Segmentos fortes',
          itemLabel: (props) => props.value || 'Segmento',
        }),
        prazoEntrega: fields.text({ label: 'Prazo de entrega' }),
        referenciaLocal: fields.text({ label: 'Referência local' }),
        ativa: fields.checkbox({ label: 'Ativa', defaultValue: true }),
        content: fields.markdoc({ label: 'Conteúdo' }),
      },
    }),
  },
});
