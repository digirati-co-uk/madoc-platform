import {
  EntitiesMadocResponse,
  EntityTypeMadocResponse,
  EntityTypesMadocResponse,
} from '../../extensions/enrichment/authority/types';
import { TopicType, TopicTypeListResponse } from '../../types/schemas/topics';
import { InternationalString } from '@iiif/presentation-3';

export function getLabel(snippet: {
  other_labels?: InternationalString;
  title?: InternationalString;
  label: string;
}): InternationalString {
  if (snippet.other_labels && Object.keys(snippet.other_labels).length) {
    return snippet.other_labels;
  }
  if (snippet.title && Object.keys(snippet.title).length) {
    return snippet.title;
  }
  return { none: [snippet.label] };
}

// @todo remove once in the backend.
export function compatTopicType(topicType: EntityTypeMadocResponse, topics: EntitiesMadocResponse): TopicType {
  return {
    ...topicType,
    pagination: topics.pagination,
    topics: topics.results,
  };
}
