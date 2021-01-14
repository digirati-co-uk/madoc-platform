import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { SearchQuery } from '../../types/search';
import { NotFound } from '../../utility/errors/not-found';

export const siteSearch: RouteMiddleware<{ slug: string }, SearchQuery> = async context => {
  const { page, madoc_id } = context.query;

  const id = context.state.jwt?.user.id;
  const site = await context.omeka.getSiteIdBySlug(context.params.slug);

  if (!site) {
    throw new NotFound('not found');
  }

  const siteApi = api.asUser({ userId: id, siteId: site.id });

  const searchQuery = context.requestBody;

  searchQuery.contexts_all = searchQuery.contexts_all ? searchQuery.contexts_all : [];
  searchQuery.contexts_all.push(`urn:madoc:site:${site.id}`);

  context.response.body = await siteApi.searchQuery(searchQuery, page, madoc_id);
};
