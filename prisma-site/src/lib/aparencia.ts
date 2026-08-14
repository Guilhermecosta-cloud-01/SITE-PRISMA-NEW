import dados from '../content/aparencia/aparencia.json';

interface Aparencia {
  corDestaque: string;
  heroTitulo: string;
  heroTexto: string;
  mostrarComoFunciona: boolean;
  mostrarCidades: boolean;
  textoRodapeExtra: string;
}

const padrao: Aparencia = {
  corDestaque: '#16a34a',
  heroTitulo: 'Prisma Equipamentos — Soluções Integradas para Gastronomia',
  heroTexto:
    'Representante autorizado Tramontina Hospitality no interior de São Paulo. Utensílios e equipamentos profissionais para restaurantes, bares, hotéis, resorts, padarias e cozinhas industriais.',
  mostrarComoFunciona: true,
  mostrarCidades: true,
  textoRodapeExtra: '',
};

export const aparencia: Aparencia = { ...padrao, ...dados };
