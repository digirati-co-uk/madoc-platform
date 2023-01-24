import { EntityMadocResponse, EntityTypeMadocResponse } from '../../extensions/enrichment/authority/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { Topic } from '../../types/schemas/topics';
import { NotFound } from '../../utility/errors/not-found';

export const siteTopic: RouteMiddleware<{ type: string; topic: string }> = async context => {
  const { siteApi } = context.state;

  const slug = context.params.topic;
  const topicTypeSlug = context.params.type;

  const response = await siteApi.authority.getEntity(topicTypeSlug, slug);
  const topicType = await siteApi.authority.getEntityType(topicTypeSlug);

  context.response.body = compatTopic(response, topicType);

  if (response.type) {
    if (topicTypeSlug !== response.type) {
      throw new NotFound('Topic not found');
    }
  }

  // @todo validate topic-type matches.
};

function compatTopic(topic: EntityMadocResponse, topicType: EntityTypeMadocResponse): Topic {
  const nuked: any = { other_labels: undefined, url: undefined, type: undefined };
  return {
    ...topic,
    label: { none: [topic.label] },
    topicType: topic.type
      ? {
          id: topicType.id,
          slug: topicType.slug,
          label: { none: [topicType.label] },
        }
      : undefined,
    // otherLabels: topic.other_labels.map(label => ({ [label.language.slice(0, 2)]: [label.value] })),
    // authorities: topic.authorities.map(auth => ({ id: auth.name, label: { none: [auth.name] } })),

    // Mocked values.
    editorial: {
      related: [],
      featured: [],
      contributors: [],
      description: { en: ['Example description'] },
      heroImage: null,
      summary: { en: ['Example summary'] },
    },

    // Nuke these properties
    ...nuked,
  };
}
