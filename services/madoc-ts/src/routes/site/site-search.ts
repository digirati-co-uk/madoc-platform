import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { SearchQuery } from '../../types/search';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const siteSearch: RouteMiddleware<{ slug: string }, SearchQuery> = async context => {
  const { page, madoc_id } = context.query;
  const { id, siteId } = optionalUserWithScope(context, []);

  const siteApi = api.asUser({ userId: id, siteId });

  const searchQuery = context.requestBody;

  searchQuery.contexts_all = searchQuery.contexts_all ? searchQuery.contexts_all : [];
  searchQuery.contexts_all.push(`urn:madoc:site:${siteId}`);

  context.response.body = await siteApi.searchQuery(searchQuery, page, madoc_id);
};
