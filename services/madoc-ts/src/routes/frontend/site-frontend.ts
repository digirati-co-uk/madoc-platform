import { sql } from 'slonik';
import { unindent } from '../../../test-utility/unindent';
import { getProject } from '../../database/queries/project-queries';
import { render as renderSite } from '../../frontend/site/server';
import { createBackend } from '../../middleware/i18n/i18next.server';
import { GetSlotsOptions } from '../../types/get-slots';
import { RouteMiddleware } from '../../types/route-middleware';
import { EditorialContext } from '../../types/schemas/site-page';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';

export const siteFrontend: RouteMiddleware = async (context, next) => {
  const lng = context.cookies.get('i18next');

  // ...
  const { cachedApi, site } = context.state;
  const systemConfig = context.siteManager.getSystemConfig();
  const user = context.siteManager.getUserFromJwt(site.id, context.state.jwt);
  const siteLocales = await cachedApi(`locales`, 3000, api => api.getSiteLocales());

  const collectionsEnabled = await context.connection.maybeOne(
    sql`select id from iiif_derived_resource where resource_type = 'collection' and flat = false and site_id = ${site.id} limit 1`
  );
  const projectsEnabled = await context.connection.maybeOne(
    sql`select id from iiif_project where status = 1 and site_id = ${site.id} limit 1`
  );

  const isAdmin = context.state.jwt && context.state.jwt.scope && context.state.jwt.scope.indexOf('site.admin') !== -1;
  const forceClearTheme = isAdmin && (context.query.__clear_theme_cache || false);
  const currentTheme = await context.themes.getResolveTheme(site.id, !!forceClearTheme);

  if (!site) {
    throw new NotFound();
  }

  context.staticPage = async token => {
    const [, i18nInstance] = await createBackend(lng, site.id);
    const result = await renderSite({
      url: context.req.url || '',
      jwt: token,
      basename: `/s/${site.slug}`,
      i18next: i18nInstance,
      siteSlug: site.slug,
      site: site,
      siteLocales,
      reactFormResponse: context.reactFormResponse,
      pluginManager: context.pluginManager,
      plugins: context.pluginManager.listPlugins(site.id),
      theme: currentTheme,
      getSlots: async (ctx: EditorialContext, options: GetSlotsOptions = {}) => {
        const slotIds = options.slotIds;
        const collector = options.collector;
        const parsedId = ctx.project ? parseProjectId(ctx.project) : undefined;
        const project = parsedId ? await context.connection.one(getProject(parsedId, site.id)) : undefined;

        return await context.pageBlocks.getSlotsByContext(
          {
            collection: ctx.collection,
            manifest: ctx.manifest,
            canvas: ctx.canvas,
            project: project ? project.id : undefined,
            slotIds,
          },
          site.id,
          collector
        );
      },
      user: await user,
      systemConfig: await systemConfig,
      navigationOptions: {
        enableCollections: !!collectionsEnabled,
        enableProjects: !!projectsEnabled,
      },
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
      return unindent(`
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
          <script type="module" src="http://${context.request.hostname}:3088/src/frontend/site/client.ts"></script>
          ${result.head}
        </head>
        <body ${result.bodyAttributes}>
          ${result.body}
        </body>
        </html>
      `);
    }

    return context.siteTemplate
      .replace('<!--ssr-outlet-->', result.body)
      .replace('<!--ssr-head-->', result.head)
      .replace('<html>', `<html ${result.htmlAttributes}>`)
      .replace('<body>', `<body ${result.bodyAttributes}>`);
  };

  await next();
};
