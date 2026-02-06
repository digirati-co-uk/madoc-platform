import { queryTypesenseSearch } from '../../search/typesense/search-query-adapter';
import { isTypesenseSearchEnabled } from '../../search/typesense/typesense-client';
import { RouteMiddleware } from '../../types/route-middleware';
import { SearchQuery } from '../../types/search';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const typesenseQuery: RouteMiddleware<{}, SearchQuery> = async context => {
  const { siteId } = optionalUserWithScope(context, []);
  const { page, madoc_id } = context.query;

  if (!isTypesenseSearchEnabled()) {
    context.response.status = 503;
    context.response.body = {
      error: 'Typesense search is not enabled',
    };
    return;
  }

  const requestBody = context.requestBody as SearchQuery | undefined;
  const fallbackQuery: SearchQuery = {
    fulltext: typeof context.query.fulltext === 'string' ? context.query.fulltext : '',
  };

  context.response.body = await queryTypesenseSearch({
    siteId,
    query: requestBody && Object.keys(requestBody).length ? requestBody : fallbackQuery,
    page: Number(page) || 1,
    madocId: madoc_id,
  });
};
