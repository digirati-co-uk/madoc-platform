import { EnrichmentEntitySnippet, EntitiesMadocResponse } from '../../extensions/enrichment/authority/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { Pagination } from '../../types/schemas/_pagination';
import { TopicSnippet } from '../../types/schemas/topics';

export const siteTopics: RouteMiddleware<{ slug: string }> = async context => {
  const { siteApi } = context.state;

  const topicType = context.query.topicType || '';
  const page = Number(context.query.page || 1) || 1;

  const response = await siteApi.authority.getEntities(topicType);
  context.response.body = compatTopic(response);
};

// @todo remove once changed in backend.
function compatTopicSnippet(snippet: EnrichmentEntitySnippet): TopicSnippet {
  return {
    ...snippet,
    label: { none: [snippet.label] },
  };
}

// @todo remove once changed in backend.
function compatTopic(response: EntitiesMadocResponse) {
  const { results } = response;

  return {
    topic: results.map(compatTopicSnippet),
    pagination: response.pagination,
  };
}
