import fs from 'fs';
import { render as renderAccount } from '../../frontend/account/server';
import { api } from '../../gateway/api.server';
import { createBackend } from '../../middleware/i18n/i18next.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { renderStaticDocument } from './render-static-document';

export const accountFrontend: RouteMiddleware<{ slug: string }> = async context => {
  const site = await context.siteManager.getSiteBySlug(context.params.slug);
  const accountSite = {
    ...site,
    config: {},
  };
  const systemConfig = context.siteManager.getSystemConfig();
  const user = context.state.jwt
    ? await context.siteManager.getUserFromJwt(site.id, context.state.jwt).catch(() => undefined)
    : undefined;
  const userId = context.state.jwt?.user?.id;
  const siteApi = api.asUser({ siteId: site.id, userId }, { siteSlug: context.params.slug }, true);
  let siteLocales: Awaited<ReturnType<typeof siteApi.getSiteLocales>>;
  try {
    siteLocales = await siteApi.getSiteLocales();
  } finally {
    siteApi.dispose();
  }

  const lng = context.cookies.get('i18next');
  const [, i18nInstance] = await createBackend(lng, site.id);

  context.staticPage = async token => {
    const result = await renderAccount({
      url: context.req.url || '',
      jwt: token,
      basename: `/account/${site.slug}`,
      i18next: i18nInstance,
      siteSlug: context.params.slug,
      site: accountSite,
      siteLocales,
      user,
      reactFormResponse: context.reactFormResponse,
      systemConfig: await systemConfig,
    });

    if (result.type === 'redirect') {
      if (result.to) {
        context.response.status = result.status || 307;
        context.response.redirect(result.to);
      } else {
        context.response.status = 404;
      }

      return;
    }

    if (process.env.NODE_ENV === 'development') {
      const viteProtocol =
        fs.existsSync('/home/node/app/openssl-certs/local-key.pem') &&
        fs.existsSync('/home/node/app/openssl-certs/local-cert.pem')
          ? 'https'
          : 'http';
      const hostname = context.request.hostname;

      const template = `
        <!doctype html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <!--ssr-head-->
          <script type="module">
            import RefreshRuntime from '${viteProtocol}://${hostname}:3088/@react-refresh'
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {}
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
            window.__HMR_PROTOCOL__ = '${viteProtocol === 'https' ? 'wss' : 'ws'}';
          </script>
          <script type="module" src="${viteProtocol}://${hostname}:3088/src/frontend/account/client.ts"></script>
          <link rel="stylesheet" href="${viteProtocol}://${hostname}:3088/src/frontend/site/index.css" />
        </head>
        <body>
          <!--ssr-outlet-->
        </body>
        </html>
      `;

      return renderStaticDocument(template, result);
    }

    return renderStaticDocument(context.accountTemplate, result);
  };
};
