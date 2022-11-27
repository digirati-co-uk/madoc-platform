import { EnrichmentEntityTypeSnippet } from '../../extensions/enrichment/authority/types';
import { DjangoPagination } from '../../extensions/enrichment/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { Pagination } from '../../types/schemas/_pagination';
import { TopicTypeSnippet } from '../../types/schemas/topics';

export const siteTopicTypes: RouteMiddleware<{ slug: string }> = async context => {
  const { siteApi } = context.state;

  const page = Number(context.query.page || 1) || 1;
  const response = await siteApi.authority.entity_type.list(page);

  context.response.body = compatTopicTypes(response, page);
};

// @todo remove once changed in backend.
function compatTopicTypeSnippet(snippet: EnrichmentEntityTypeSnippet): TopicTypeSnippet {
  return {
    ...snippet,
    slug: snippet.label,
    label: { none: [snippet.label] },
  };
}

// @todo remove once changed in backend.
function compatTopicTypes(response: DjangoPagination<EnrichmentEntityTypeSnippet>, page: number) {
  const { results, next, previous, count } = response;
  const totalPages = Math.min(Math.ceil(results.length / count), page);

  return {
    topicTypes: results.map(compatTopicTypeSnippet),
    original_pagination: {
      next,
      previous,
      count,
    },
    pagination: {
      page,
      totalResults: results.length * totalPages,
      totalPages,
    } as Pagination,
  };
}
