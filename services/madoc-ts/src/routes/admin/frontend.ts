import { render } from '../../frontend/admin/server';
import { RouteMiddleware } from '../../types/route-middleware';

export const adminFrontend: RouteMiddleware = context => {
  const bundle = context.routes.url('assets-bundles', { slug: context.params.slug, bundleId: 'admin' });
  context.omekaMinimal = true;
  context.omekaPage = async token => {
    const result = await render({
      url: context.req.url || '',
      jwt: token,
      basename: `/s/${context.params.slug}/madoc/admin`,
      i18next: context.i18next.cloneInstance({ initImmediate: false }),
    });

    if (result.type === 'redirect') {
      if (result.to) {
        context.response.status = result.status || 301;
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
