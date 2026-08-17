import dados from '../content/aparencia/aparencia.json';

interface Aparencia {
  corDestaque: string;
  heroTitulo: string;
  heroTexto: string;
  mostrarPorQueAPrisma: boolean;
  mostrarCidades: boolean;
  textoRodapeExtra: string;
}

const padrao: Aparencia = {
  corDestaque: '#D4703A',
  heroTitulo: 'Sua cozinha equipada por quem entende de operação, não só de catálogo.',
  heroTexto:
    'Cutelaria, panelas, indução, buffet e utensílios profissionais para restaurantes, hotéis e resorts do interior paulista. Orçamento no WhatsApp, entrega na sua cozinha.',
  mostrarPorQueAPrisma: true,
  mostrarCidades: true,
  textoRodapeExtra: '',
};

export const aparencia: Aparencia = { ...padrao, ...dados };

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
