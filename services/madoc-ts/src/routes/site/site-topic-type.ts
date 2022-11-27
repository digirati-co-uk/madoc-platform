import { EntitySnippetMadoc, EntityTypeMadocResponse } from '../../extensions/enrichment/authority/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { TopicSnippet, TopicType } from '../../types/schemas/topics';

export const siteTopicType: RouteMiddleware<{ type: string }> = async context => {
  const { siteApi } = context.state;

  const slug = context.params.type;

  // @todo change this to be SLUG later.
  // const response = await siteApi.authority.entity_type.get(id);
  const response = await siteApi.authority.getEntityType(slug);

  context.response.body = compatTopicType(response, slug);
};

function compatTopic(topic: EntitySnippetMadoc): TopicSnippet {
  return {
    id: topic.id,
    label: { none: [topic.label] },
    slug: topic.id,
    // @todo change to slug when supported.
    // slug: encodeURIComponent(topic.label),
  };
}

// @todo remove once in the backend.
function compatTopicType(topicType: EntityTypeMadocResponse, slug: string): TopicType {
  const nuked: any = { results: undefined, url: undefined };

  return {
    // Missing properties
    id: 'null',
    slug: encodeURIComponent(slug),

    ...topicType,

    // Properties to change.
    label: { none: [slug] },
    otherLabels: [], // @todo no other labels given.
    topics: topicType.results.map(compatTopic),

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
