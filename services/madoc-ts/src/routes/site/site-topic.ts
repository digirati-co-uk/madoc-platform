import { EnrichmentEntity } from '../../extensions/enrichment/authority/types';
import { RouteMiddleware } from '../../types/route-middleware';
import { Topic } from '../../types/schemas/topics';
import { NotFound } from '../../utility/errors/not-found';

export const siteTopic: RouteMiddleware<{ slug: string; type: string; id: string }> = async context => {
  const { siteApi } = context.state;

  const slug = context.params.id;
  const topicTypeSlug = context.params.type;

  // const response = await siteApi.authority.entity_type.get(id);
  const response = await siteApi.authority.entity.get(slug);

  if (response.type) {
    if (topicTypeSlug !== response.type.label && topicTypeSlug !== response.type.id) {
      throw new NotFound('Topic not found');
    }
  }

  // @todo validate topic-type matches.

  context.response.body = compatTopic(response);
};

function compatTopic(topic: EnrichmentEntity): Topic {
  const nuked: any = { other_labels: undefined, url: undefined };

  return {
    ...topic,
    // @todo change to slug.
    slug: topic.id,
    label: { none: [topic.label] },
    topicType: topic.type
      ? {
          id: topic.type.id,
          slug: topic.type.label,
          label: { none: [topic.type.label] },
        }
      : undefined,
    otherLabels: topic.other_labels.map(label => ({ [label.language.slice(0, 2)]: [label.value] })),
    authorities: topic.authorities.map(auth => ({ id: auth.name, label: { none: [auth.name] } })),

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
