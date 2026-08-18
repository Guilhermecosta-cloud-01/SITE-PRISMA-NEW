export const NUMERO = '5519992616207';

export function linkWhatsApp(mensagem: string): string {
  return `https://wa.me/${NUMERO}?text=${encodeURIComponent(mensagem)}`;
}
