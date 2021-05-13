import { SitePlugin } from '../../types/schemas/plugins';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const listPlugins: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  context.response.status = 200;
  context.response.body = {
    plugins: await context.plugins.listPlugins(siteId),
  };
};

export const getPlugin: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const id = context.params.id;

  context.response.status = 200;
  context.response.body = await context.plugins.getSitePlugin(id, siteId);
};

export const installPlugin: RouteMiddleware<{}, SitePlugin> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const plugin = context.requestBody;

  context.response.status = 201;
  context.response.body = await context.plugins.installPlugin(plugin, siteId);
};
