import {
  EntitiesMadocResponse,
  EntitySnippetMadoc,
  EntityTypeMadocResponse,
} from '../../extensions/enrichment/authority/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { TopicSnippet, TopicType } from '../../types/schemas/topics';

export const siteTopicType: RouteMiddleware<{ type: string }> = async context => {
  const { siteApi } = context.state;

  const slug = context.params.type;
  const response = await siteApi.authority.getEntityType(slug);
  const topics = await siteApi.authority.getEntities(slug);

  context.response.body = compatTopicType(response, topics, slug);
};

function compatTopic(topic: EntitySnippetMadoc): TopicSnippet {
  return {
    ...topic,
    label: { none: [topic.label] },
  };
}

// @todo remove once in the backend.
function compatTopicType(topicType: EntityTypeMadocResponse, topics: EntitiesMadocResponse, slug: string): TopicType {
  const nuked: any = { results: undefined, url: undefined };

  return {
    ...topicType,
    label: { none: [slug] },
    otherLabels: [], // @todo no other labels given.
    pagination: topics.pagination,
    topics: topics.results.map(compatTopic),

    // Mocked editorial
    editorial: {
      summary: { en: ['Example summary'] },
      related: [],
      featured: [],
      heroImage: null,
    },
    // Nuke these.
    ...nuked,
  };
}
