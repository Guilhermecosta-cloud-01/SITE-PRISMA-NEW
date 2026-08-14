import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const produtos = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/produtos' }),
  schema: ({ image }) =>
    z.object({
      nome: z.string(),
      categoria: z.string(),
      codigo: z.string().optional(),
      imagem: image(),
      specs: z.array(z.string()),
      aplicacao: z.string(),
      destaque: z.boolean().default(false),
      ordem: z.number().default(99),
    }),
});

const categorias = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/categorias' }),
  schema: ({ image }) =>
    z.object({
      nome: z.string(),
      descricao: z.string(),
      imagem: image().optional(),
      ordem: z.number(),
    }),
});

const cidades = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/cidades' }),
  schema: z.object({
    nome: z.string(),
    estado: z.string().default('SP'),
    metaTitle: z.string(),
    metaDescription: z.string(),
    segmentosFortes: z.array(z.string()),
    prazoEntrega: z.string(),
    referenciaLocal: z.string(),
    ativa: z.boolean().default(true),
  }),
});

export const collections = { produtos, categorias, cidades };
