import { defineMiddleware } from 'astro:middleware';

// @keystatic/astro (5.2.0, a versão mais recente disponível) ainda lê
// `Astro.locals.runtime.env` para pegar os bindings do Worker. O
// @astrojs/cloudflare 14.x removeu esse acesso de propósito — `.env` agora
// lança erro, orientando a usar `import { env } from 'cloudflare:workers'`.
// Isso quebra o login do GitHub no Keystatic (rota /api/keystatic/github/*)
// até o Keystatic ser atualizado upstream. Como workaround: nas rotas do
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

  // Segundo bug do mesmo pacote: o handler de login do Keystatic
  // (githubLogin, em @keystatic/core) monta a URL de autorização do GitHub
  // sem parâmetro `scope` nenhum — o token resultante não tem nenhuma
  // permissão, nem de leitura em repo público. Isso quebra qualquer
  // gravação (createCommitOnBranch exige, no mínimo, o escopo
  // 'public_repo'). Workaround: intercepta o redirect dessa rota
  // específica e injeta o scope antes de mandar pro navegador.
  if (pathname === '/api/keystatic/github/login') {
    const response = await next();
    const location = response.headers.get('Location');
    if (
      response.status >= 300 &&
      response.status < 400 &&
      location?.startsWith('https://github.com/login/oauth/authorize') &&
      !new URL(location).searchParams.has('scope')
    ) {
      const novaLocation = new URL(location);
      novaLocation.searchParams.set('scope', 'public_repo');
      const headers = new Headers(response.headers);
      headers.set('Location', novaLocation.toString());
      return new Response(response.body, { status: response.status, headers });
    }
    return response;
  }

  return next();
});
