import { defineMiddleware } from 'astro:middleware';

// @keystatic/astro (5.2.0, a versão mais recente disponível) ainda lê
// `Astro.locals.runtime.env` para pegar os bindings do Worker. O
// @astrojs/cloudflare 14.x removeu esse acesso de propósito — `.env` agora
// lança erro, orientando a usar `import { env } from 'cloudflare:workers'`.
// Isso quebra o login do GitHub no Keystatic (rota /api/keystatic/github/*)
// até o Keystatic ser atualizado rio acima. Como workaround: nas rotas do
// Keystatic, redefinimos só o getter `env` (os outros — cf/caches/ctx — o
// Keystatic não usa) apontando pro valor real, lido do jeito atual.
export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url;
  if (pathname.startsWith('/keystatic') || pathname.startsWith('/api/keystatic')) {
    try {
      const { env } = await import('cloudflare:workers');
      Object.defineProperty(context.locals.runtime, 'env', {
        configurable: true,
        enumerable: true,
        get: () => env,
      });
    } catch {
      // Fora do runtime do Cloudflare (ex.: `astro dev` sem simulação de
      // Workers) — segue sem o shim, o que é inofensivo fora de produção.
    }
  }
  return next();
});
