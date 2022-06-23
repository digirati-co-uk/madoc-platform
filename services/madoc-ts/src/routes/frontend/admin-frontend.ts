import { unindent } from '../../../test-utility/unindent';
import { render as renderAdmin } from '../../frontend/admin/server';
import { createBackend } from '../../middleware/i18n/i18next.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { userWithScope } from '../../utility/user-with-scope';

export const adminFrontend: RouteMiddleware = async context => {
  try {
    userWithScope(context, ['site.admin']);
  } catch (e) {
    if (e instanceof NotFound) {
      context.response.status = 307;
      context.response.redirect(`/s/${context.params.slug}`);
      return;
    }
  }

  const systemConfig = context.siteManager.getSystemConfig();
  const { cachedApi, site } = context.state;
  const user = context.siteManager.getUserFromJwt(site.id, context.state.jwt);
  const siteLocales = await cachedApi(`locales`, 3000, api => api.getSiteLocales());
  const lng = context.cookies.get('i18next');
  const [, i18nInstance] = await createBackend(lng, site.id);

  context.staticPage = async token => {
    const result = await renderAdmin({
      url: context.req.url || '',
      jwt: token,
      basename: `/s/${context.params.slug}/admin`,
      i18next: i18nInstance,
      site: site,
      siteLocales,
      siteSlug: context.params.slug,
      pluginManager: context.pluginManager,
      plugins: context.pluginManager.listPlugins(site.id),
      user: await user,
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
      return `
        <!doctype html>
        <html ${result.htmlAttributes}>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <script type="module">
            import RefreshRuntime from 'http://${context.request.hostname}:3088/@react-refresh'
            RefreshRuntime.injectIntoGlobalHook(window)
            window.$RefreshReg$ = () => {}
            window.$RefreshSig$ = () => (type) => type
            window.__vite_plugin_react_preamble_installed__ = true
          </script>
          <script type="module" src="http://${context.request.hostname}:3088/src/frontend/admin/client.tsx"></script>
          ${result.head}
        </head>
        <body ${result.bodyAttributes}>
          ${result.body}
        </body>
        </html>
      `;
    }

    return context.adminTemplate
      .replace('<!--ssr-outlet-->', result.body)
      .replace('<!--ssr-head-->', result.head)
      .replace('<html>', `<html ${result.htmlAttributes}>`)
      .replace('<body>', `<body ${result.bodyAttributes}>`);
  };
};
