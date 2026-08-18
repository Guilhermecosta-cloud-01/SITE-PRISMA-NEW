import dados from '../content/aparencia/aparencia.json';

export type CorFundo = 'claro' | 'escuro' | 'branco';

interface BlocoCampos {
  titulo: string;
  subtitulo?: string;
  corFundo: CorFundo;
  itens?: { titulo: string; descricao: string }[];
  texto?: string;
  botaoTexto?: string;
  botaoMensagemWhatsapp?: string;
  botaoLink?: string;
}

export type Bloco =
  | ({ tipo: 'segmentos' } & BlocoCampos)
  | ({ tipo: 'representadas' } & BlocoCampos)
  | ({ tipo: 'cards' } & BlocoCampos & { itens: { titulo: string; descricao: string }[] })
  | ({ tipo: 'cta' } & BlocoCampos & { texto: string; botaoTexto: string });

// Formato bruto gravado pelo Keystatic para um campo fields.conditional (ver
// node_modules/@keystatic/core .../form/api.d.ts — ConditionalField): cada
// item do array vira { discriminant, value }, nunca um objeto plano.
interface BlocoBruto {
  discriminant: Bloco['tipo'];
  value: Record<string, unknown>;
}

interface Aparencia {
  corDestaque: string;
  heroTitulo: string;
  heroTexto: string;
  textoRodapeExtra: string;
  blocos: Bloco[];
}

const padrao: Aparencia = {
  corDestaque: '#D4703A',
  heroTitulo: 'Sua cozinha equipada por quem entende de operação, não só de catálogo.',
  heroTexto:
    'Cutelaria, panelas, indução, buffet e utensílios profissionais para restaurantes, hotéis e resorts do interior paulista. Orçamento no WhatsApp, entrega na sua cozinha.',
  textoRodapeExtra: '',
  blocos: [],
};

interface AparenciaBruta {
  corDestaque?: string;
  heroTitulo?: string;
  heroTexto?: string;
  textoRodapeExtra?: string;
  blocos?: BlocoBruto[];
}

const dadosBrutos = dados as AparenciaBruta;

export const aparencia: Aparencia = {
  ...padrao,
  ...dadosBrutos,
  blocos: (dadosBrutos.blocos ?? []).map((bloco) => ({ tipo: bloco.discriminant, ...bloco.value }) as Bloco),
};

function escurecer(hex: string, fator = 0.15): string {
  const match = /^#?([0-9a-f]{6})$/i.exec(hex.trim());
  if (!match) return hex;
  const num = parseInt(match[1], 16);
  const canal = (shift: number) => {
    const valor = (num >> shift) & 0xff;
    return Math.max(0, Math.round(valor * (1 - fator)));
  };
  const r = canal(16).toString(16).padStart(2, '0');
  const g = canal(8).toString(16).padStart(2, '0');
  const b = canal(0).toString(16).padStart(2, '0');
  return `#${r}${g}${b}`;
}

export const corDestaqueHover = escurecer(aparencia.corDestaque);
