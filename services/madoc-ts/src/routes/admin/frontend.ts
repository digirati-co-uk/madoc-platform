import { render as renderAdmin } from '../../frontend/admin/server';
import { render as renderSite } from '../../frontend/site/server';
import { createBackend } from '../../middleware/i18n/i18next.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { LanguageCache } from '../../utility/language-cache';
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
      ${result.html}
      <script type="application/javascript" src="${bundle}"></script>
    `;
  };
};
