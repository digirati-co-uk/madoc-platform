import { EnrichmentEntity, EnrichmentEntityType } from './authority/types';
import { CaptureModelShorthand } from '../../frontend/shared/capture-models/types/capture-model-shorthand';

export const entityTypeModel: CaptureModelShorthand<EnrichmentEntityType> = {
  title: { type: 'international-field', label: 'Title' },
  description: { type: 'international-field', label: 'Description' },
  image_url: { type: 'madoc-media-explorer', label: 'Image', valueAsString: true },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  __nested__: {
    featured_topics: { allowMultiple: true, label: 'Featured topic', pluralLabel: 'Featured topics', labelledBy: 'label' },
  },
  // featured_topics: { type: 'topic-explorer', label: 'featured topic' },
  'featured_topics.slug': { type: 'topic-explorer', label: 'featured topics' },
};

export const entityModel: CaptureModelShorthand<EnrichmentEntity> = {
  label: { type: 'text-field', label: 'Slug' },
  title: { type: 'international-field', label: 'Title' },
  description: { type: 'international-field', label: 'Description' },
  // featured_resources: { type: 'topic-item-explorer', label: 'featured resources' },
  __nested__: {
    authorities: { allowMultiple: true, label: 'Authority', pluralLabel: 'Authorities', labelledBy: 'value' },
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  'featured_resources.madoc_id': { type: 'topic-item-explorer', label: 'featured resources' },

  'authorities.uri': { type: 'text-field', label: 'URI / URL' },
  'authorities.authority': { type: 'text-field', label: 'Authority label' },
  'authorities.identifier': { type: 'text-field', label: 'Authority identifier' },

  'other_data.topic_summary': { type: 'international-field', label: 'Summary' },
  'other_data.secondary_heading': { type: 'international-field', label: 'Secondary heading' },
  'other_data.main_image': { type: 'madoc-media-explorer', label: 'Hero image' },
  'other_data.thumbnail.alt': { type: 'international-field', label: 'alt text' },

  type: {
    type: 'autocomplete-field',
    label: 'Topic type',
    dataSource: 'madoc-api://topic-types/autocomplete?q=%',
    requestInitial: true,
    outputIdAsString: false,
  },
};
