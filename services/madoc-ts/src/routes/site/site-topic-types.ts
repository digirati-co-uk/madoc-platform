import { EnrichmentEntityTypeSnippet, EntityTypesMadocResponse } from '../../extensions/enrichment/authority/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { TopicTypeSnippet } from '../../types/schemas/topics';

export const siteTopicTypes: RouteMiddleware<{ slug: string }> = async context => {
  const { siteApi } = context.state;

  const response = await siteApi.authority.getEntityTypes();
  context.response.body = compatTopicTypes(response);
};

// @todo remove once changed in backend.
function compatTopicTypeSnippet(snippet: EnrichmentEntityTypeSnippet): TopicTypeSnippet {
  return {
    ...snippet,
    label: { none: [snippet.label] },
  };
}

// @todo remove once changed in backend.
function compatTopicTypes(response: EntityTypesMadocResponse) {
  const { results } = response;
  return {
    topicTypes: results.map(compatTopicTypeSnippet),
    pagination: response.pagination,
  };
}
