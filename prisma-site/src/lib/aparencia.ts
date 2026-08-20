import dados from '../content/aparencia/aparencia.json';
import { paraBlocos, type Bloco, type BlocoBruto } from './blocos';

export type { CorFundo, Bloco } from './blocos';

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
  blocos: paraBlocos(dadosBrutos.blocos),
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

// Guia de cores: laranja (#D4703A) é só acento decorativo — texto branco em
// cima dele fica abaixo do mínimo de contraste AA (3,4:1). Todo preenchimento
// de botão usa a variante mais escura "laranja-cta" (4,6:1 com texto branco).
// Quando a cor de destaque está no valor padrão da marca, usa o hex exato do
// guia; se o usuário customizar `corDestaque` pelo Keystatic, deriva por
// escurecimento (não há como saber o par "-cta" certo pra uma cor arbitrária).
const LARANJA_CTA_PADRAO = '#B85A28';

export const corDestaqueCta =
  aparencia.corDestaque.toUpperCase() === '#D4703A' ? LARANJA_CTA_PADRAO : escurecer(aparencia.corDestaque, 0.18);

export const corDestaqueCtaHover = escurecer(corDestaqueCta, 0.12);
