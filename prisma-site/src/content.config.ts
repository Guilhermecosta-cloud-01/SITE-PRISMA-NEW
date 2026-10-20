import { defineCollection, reference, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Espelha o formato bruto que o Keystatic grava para fields.conditional
// (ver src/lib/blocos.ts) com uma union discriminada de verdade, em vez de um
// z.record solto — assim um bloco malformado (CTA sem destino, cards vazio)
// falha o build em vez de virar uma seção quebrada em produção.
const corFundoSchema = z.enum(['papel', 'areia', 'navy']);

const blocoSchema = z.discriminatedUnion('discriminant', [
  z.object({
    discriminant: z.literal('segmentos'),
    value: z.object({
      titulo: z.string(),
      subtitulo: z.string().optional(),
      corFundo: corFundoSchema,
    }),
  }),
  z.object({
    discriminant: z.literal('representadas'),
    value: z.object({
      titulo: z.string(),
      subtitulo: z.string().optional(),
      corFundo: corFundoSchema,
    }),
  }),
  z.object({
    discriminant: z.literal('cards'),
    value: z.object({
      titulo: z.string(),
      subtitulo: z.string().optional(),
      corFundo: corFundoSchema,
      itens: z
        .array(z.object({ titulo: z.string(), descricao: z.string() }))
        .min(1, 'Bloco "Cards" precisa de pelo menos um item — remova o bloco em vez de deixar vazio.'),
    }),
  }),
  z.object({
    discriminant: z.literal('cta'),
    value: z
      .object({
        titulo: z.string(),
        texto: z.string(),
        corFundo: corFundoSchema,
        botaoTexto: z.string(),
        botaoMensagemWhatsapp: z.string().optional(),
        botaoLink: z.string().optional(),
      })
      .refine((v) => Boolean(v.botaoMensagemWhatsapp || v.botaoLink), {
        message: 'Bloco "CTA" precisa de mensagem de WhatsApp ou link — preencha um dos dois.',
      }),
  }),
]);

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
  schema: ({ image }) =>
    z.object({
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

      // Seção 2 — imagem de fundo atrás do reconhecimento do problema (gatilho visual, opcional)
      imagemFundo: image().optional(),

      // Seção 4 — produtos em destaque específicos desta cidade (opcional; se
      // vazio, a página cai no conjunto global de produtos com destaque:true)
      produtosDestaque: z.array(reference('produtos')).default([]),

      // Blocos extras (mesmo mecanismo do singleton Aparência — ver src/lib/blocos.ts),
      // renderizados entre "Produtos em destaque" e "Como funciona". Por padrão vem
      // com um bloco de Representadas (ver script de seed em src/content/cidades/*.mdoc).
      blocos: z.array(blocoSchema).default([]),

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

const representadas = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/representadas' }),
  schema: ({ image }) =>
    z.object({
      nome: z.string(),
      segmento: z.string(),
      descricaoCurta: z.string(),
      logo: image().optional(),
      nomeCatalogo: z.string(),
      temCatalogoOnline: z.boolean().default(false),
      ordem: z.number().default(99),
      ativa: z.boolean().default(true),

      // Seção 3 do manual de padronização — principais categorias de produtos/soluções
      // da marca (opcional; some da página se vazio, nunca invente categoria sem fonte)
      categoriasProdutos: z.array(z.string()).default([]),

      // Seção 4 — fotografias reais de produtos/aplicações (opcional; o campo fica
      // pronto para quando o usuário mandar material, mas a galeria não aparece vazia)
      imagens: z.array(image()).default([]),

      // Seção 5 — benefícios/diferenciais comprovados pelo material oficial da marca
      // (opcional; nunca invente specs/certificações sem confirmação)
      diferenciais: z.array(z.string()).default([]),

      // Seção 6 — segmentos/aplicações compatíveis (referências à coleção `segmentos`
      // já existente — não cria associação nova sem confirmação)
      segmentosAtendidos: z.array(reference('segmentos')).default([]),

      // Corpo em Markdoc = apresentação da marca (seção 2)
    }),
});

const segmentos = defineCollection({
  loader: glob({ pattern: '**/*.mdoc', base: './src/content/segmentos' }),
  schema: ({ image }) =>
    z.object({
      nome: z.string(),
      descricao: z.string(),
      imagem: image().optional(),
      ordem: z.number().default(99),
      ativa: z.boolean().default(true),
    }),
});

export const collections = { produtos, categorias, cidades, regioes, representadas, segmentos };
