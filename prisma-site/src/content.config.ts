import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

const produtos = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/produtos' }),
  schema: ({ image }) =>
    z.object({
      nome: z.string(),
      categoria: reference('categorias'),
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
    ativa: z.boolean().default(true),

    // Seção 1 — hero
    heroTexto: z.string(),
    provaRapida: z.array(z.string()).default([]),

    // Seção 4 — produtos em destaque específicos desta cidade (opcional; se
    // vazio, a página cai no conjunto global de produtos com destaque:true)
    produtosDestaque: z.array(reference('produtos')).default([]),

    // Seção 6 — objeções / FAQ
    faq: z
      .array(
        z.object({
          pergunta: z.string(),
          resposta: z.string(),
        }),
      )
      .default([]),

    // Seção 7 — prova social (opcional; a seção some se vazio)
    depoimentoTexto: z.string().optional(),
    depoimentoAutor: z.string().optional(),
    depoimentoEstabelecimento: z.string().optional(),

    // Corpo em Markdoc = Seção 2 (reconhecimento do problema)
  }),
});

const regioes = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/regioes' }),
  schema: z.object({
    nome: z.string(),
    metaTitle: z.string(),
    metaDescription: z.string(),
    cidades: z.array(reference('cidades')),
    ordem: z.number().default(99),
    ativa: z.boolean().default(true),
  }),
});

export const collections = { produtos, categorias, cidades, regioes };
