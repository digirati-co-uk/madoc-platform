import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';

export const siteUserAutocomplete: RouteMiddleware = async context => {
  const id = context.state.jwt?.user.id;
  const name = context.state.jwt?.user.name;
  const scope = context.state.jwt?.scope;
  const site = await context.siteManager.getSiteBySlug(context.params.slug);

  if (!site) {
    throw new NotFound('not found');
  }

  if (!scope || !id || (scope.indexOf('task.create') === -1 && scope.indexOf('site.admin') === -1)) {
    // no users.
    context.response.body = [];
    return;
  }

  const siteApi = api.asUser({ userId: id, siteId: site.id, userName: name });

  const autocomplete = await siteApi.userAutocomplete(
    context.query.q,
    context.query.role ? context.query.role.split(',') : undefined
  );

  context.response.body = {
    completions: autocomplete.users.map(user => {
      return {
        uri: `urn:madoc:user:${user.id}`,
        label: user.name,
        resource_class: user.role,
      };
    }),
  } as {
    completions: Array<{
      uri: string;
      label: string;
      resource_class?: string;
    }>;
  };
};
