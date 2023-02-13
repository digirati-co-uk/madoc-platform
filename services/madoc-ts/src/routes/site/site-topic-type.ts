import {
  EntitiesMadocResponse,
  EntitySnippetMadoc,
  EntityTypeMadocResponse,
} from '../../extensions/enrichment/authority/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { TopicSnippet, TopicType } from '../../types/schemas/topics';
import { InternationalString } from '@iiif/presentation-3';

export const siteTopicType: RouteMiddleware<{ type: string }> = async context => {
  const { siteApi } = context.state;

  const slug = context.params.type;
  const response = await siteApi.authority.getEntityType(slug);
  const topics = await siteApi.authority.getEntities(slug);

  context.response.body = compatTopicType(response, topics);
};

function compatTopic(topic: EntitySnippetMadoc): TopicSnippet {
  const nuked: any = { url: undefined };
  return {
    ...topic,
    label: topic.title,
    topicType: {
      slug: topic.type_slug,
      label: topic.type_other_labels,
    },
    thumbnail: { url: topic.image_url, alt: 'todo' },
    totalObjects: 0,
    ...nuked,
  };
}

// @todo remove once in the backend.
function compatTopicType(topicType: EntityTypeMadocResponse, topics: EntitiesMadocResponse): TopicType {
  const nuked: any = { url: undefined };
  return {
    ...topicType,
    label: { none: [topicType.label] },
    pagination: topics.pagination,
    topics: topics.results.map(compatTopic),

    // Mocked editorial
    editorial: {
      summary: { en: ['Example summary'] },
      description: topicType.description,
      related: [],
      featured: [],
      heroImage: { url: topicType.image_url, alt: null, overlayColor: null, transparent: null },
    },
    // Nuke these.
    ...nuked,
  };
}
