export type CorFundo = 'papel' | 'areia' | 'navy';

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
// item do array vira { discriminant, value }, nunca um objeto plano. Usado
// tanto pelo singleton Aparência (src/lib/aparencia.ts, JSON lido à mão)
// quanto pelo campo `blocos` da coleção `cidades` (src/content.config.ts).
export interface BlocoBruto {
  discriminant: Bloco['tipo'];
  value: Record<string, unknown>;
}

export function paraBlocos(brutos: BlocoBruto[] | undefined): Bloco[] {
  return (brutos ?? []).map((bloco) => ({ tipo: bloco.discriminant, ...bloco.value }) as Bloco);
}
