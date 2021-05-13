import { sql } from 'slonik';
import { getProject } from '../../database/queries/project-queries';
import { render as renderAdmin } from '../../frontend/admin/server';
import { render as renderSite } from '../../frontend/site/server';
import { createBackend } from '../../middleware/i18n/i18next.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { EditorialContext } from '../../types/schemas/site-page';
import { NotFound } from '../../utility/errors/not-found';
import { parseProjectId } from '../../utility/parse-project-id';
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
  const bundle = context.routes.url('assets-bundles', { slug: context.params.slug, bundleId: 'admin' });

  const { cachedApi, site } = context.state;
  const siteLocales = await cachedApi(`locales`, 3000, api => api.getSiteLocales());
  const lng = context.cookies.get('i18next');
  const [, i18nInstance] = await createBackend(lng, site.id);

  context.omekaMinimal = true;
  context.omekaPage = async token => {
    const result = await renderAdmin({
      url: context.req.url || '',
      jwt: token,
      basename: `/s/${context.params.slug}/madoc/admin`,
      i18next: i18nInstance,
      site: site,
      siteLocales,
      user:
        context.state.jwt && context.state.jwt.user && context.state.jwt.user.id
          ? {
              name: context.state.jwt.user.name,
              id: context.state.jwt.user.id,
              scope: context.state.jwt.scope,
            }
          : undefined,
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

    return `
      <!doctype html>
      ${result.html}
      <script type="application/javascript" src="${bundle}"></script>
    `;
  };
};

export const siteFrontend: RouteMiddleware = async context => {
  // This is a fallback route, filter out dev routes.
  if (context.request.url.indexOf('__webpack_hmr') !== -1) {
    return;
  }

  const bundle = context.routes.url('assets-bundles', { slug: context.params.slug, bundleId: 'site' });
  context.omekaMinimal = true;
  const lng = context.cookies.get('i18next');

  // ...
  const { cachedApi, site } = context.state;
  const siteLocales = await cachedApi(`locales`, 3000, api => api.getSiteLocales());

  const collectionsEnabled = await context.connection.maybeOne(
    sql`select id from iiif_derived_resource where resource_type = 'collection' and flat = false and site_id = ${site.id} limit 1`
  );
  const projectsEnabled = await context.connection.maybeOne(
    sql`select id from iiif_project where status = 1 and site_id = ${site.id} limit 1`
  );

  if (!site) {
    throw new NotFound();
  }

  context.omekaPage = async token => {
    const [, i18nInstance] = await createBackend(lng, site.id);
    const result = await renderSite({
      url: context.req.url || '',
      jwt: token,
      basename: `/s/${site.slug}/madoc`,
      i18next: i18nInstance,
      siteSlug: site.slug,
      site: site,
      siteLocales,
      pluginManager: context.pluginManager,
      plugins: await context.plugins.listPlugins(site.id),
      getSlots: async (ctx: EditorialContext) => {
        const parsedId = ctx.project ? parseProjectId(ctx.project) : undefined;
        const project = parsedId ? await context.connection.one(getProject(parsedId, site.id)) : undefined;

        return await context.pageBlocks.getSlotsByContext(
          {
            collection: ctx.collection,
            manifest: ctx.manifest,
            canvas: ctx.canvas,
            project: project ? project.id : undefined,
          },
          site.id
        );
      },
      user:
        context.state.jwt && context.state.jwt.user && context.state.jwt.user.id
          ? {
              name: context.state.jwt.user.name,
              id: context.state.jwt.user.id,
              scope: context.state.jwt.scope,
            }
          : undefined,
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

    return `
      <!doctype html>
      ${result.html}
      <script type="application/javascript" src="${bundle}"></script>
    `;
  };
};
