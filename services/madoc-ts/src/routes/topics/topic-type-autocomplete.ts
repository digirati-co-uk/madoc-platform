import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { userWithScope } from '../../utility/user-with-scope';

export const topicTypeAutocomplete: RouteMiddleware = async context => {
  const { siteId, id } = userWithScope(context, ['site.admin']);

  const items = await api.asUser({ userId: id, siteId }).authority.entity_type.list(1);

  context.response.body = {
    completions: items.results.map(item => ({
      uri: item.label,
      label: item.label,
    })) as { uri: string; label: string; resource_class?: string; score?: number }[],
  };
};
