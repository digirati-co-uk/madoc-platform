import { EnrichmentEntitySnippet } from '../../extensions/enrichment/authority/types';
import { DjangoPagination } from '../../extensions/enrichment/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { Pagination } from '../../types/schemas/_pagination';
import { TopicSnippet } from '../../types/schemas/topics';

export const siteTopics: RouteMiddleware<{ slug: string }> = async context => {
  const { siteApi } = context.state;

  const topicType = context.query.topicType || '';
  const page = Number(context.query.page || 1) || 1;

  // @todo be able to filter by `topicType`
  const response = await siteApi.authority.entity.list(page);

  context.response.body = compatTopic(response, page);
};

// @todo remove once changed in backend.
function compatTopicSnippet(snippet: EnrichmentEntitySnippet): TopicSnippet {
  return {
    ...snippet,
    // Other properties we might want or need.
    label: { none: [snippet.label] },
    slug: snippet.id,
    // @todo change to slug when supported.
    // slug: encodeURIComponent(snippet.label),
    topicType: snippet.type
      ? {
          id: snippet.type.id,
          slug: snippet.type.label,
          label: { none: [snippet.type.label] },
        }
      : undefined,
  };
}

// @todo remove once changed in backend.
function compatTopic(response: DjangoPagination<EnrichmentEntitySnippet>, page: number) {
  const { results, next, previous, count } = response;
  const totalPages = Math.min(Math.ceil(results.length / count), page);

  return {
    topic: results.map(compatTopicSnippet),
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
