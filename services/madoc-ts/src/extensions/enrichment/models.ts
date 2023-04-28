import { EnrichmentEntity, EnrichmentEntityType } from './authority/types';
import { CaptureModelShorthand } from '../../frontend/shared/capture-models/types/capture-model-shorthand';

export const entityTypeModel: CaptureModelShorthand<EnrichmentEntityType> = {
  title: { type: 'international-field', label: 'Title' },
  label: { type: 'text-field', label: 'slug' },
  description: { type: 'international-field', label: 'Description' },
  image_url: { type: 'madoc-media-explorer', label: 'Image', valueAsString: true },
  __nested__: {
    featured_topics: {
      allowMultiple: true,
      label: 'Featured topic',
      pluralLabel: 'Featured topics',
      labelledBy: 'slug',
    },
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  'featured_topics.slug': { type: 'topic-explorer', label: 'featured topics' },
};

export const entityModel: CaptureModelShorthand<EnrichmentEntity> = {
  title: { type: 'international-field', label: 'Title' },
  // label: { type: 'text-field', label: 'Slug' },
  description: { type: 'international-field', label: 'Description' },
  type: {
    type: 'autocomplete-field',
    label: 'Topic type',
    dataSource: 'madoc-api://topic-types/autocomplete?q=%',
    requestInitial: true,
    outputIdAsString: false,
  },
  __nested__: {
    authorities: { allowMultiple: true, label: 'Authority', pluralLabel: 'Authorities', labelledBy: 'value' },
    featured_resources: {
      allowMultiple: true,
      label: 'featured resource',
      pluralLabel: 'featured resources',
      labelledBy: 'madoc_id',
      description: 'Note: only manifests can be featured resources',
    },
    other_data: {
      allowMultiple: false,
      label: 'Other data',
    },
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  'featured_resources.madoc_id': { type: 'topic-item-explorer', label: 'featured resources' },

  'authorities.url': { type: 'text-field', label: 'URI / URL' },
  'authorities.authority': { type: 'text-field', label: 'Authority label' },
  'authorities.identifier': { type: 'text-field', label: 'Authority identifier' },

  'other_data.topic_summary': { type: 'international-field', label: 'Summary' },
  'other_data.secondary_heading': { type: 'international-field', label: 'Secondary heading' },
  'other_data.main_image': { type: 'madoc-media-explorer', label: 'Hero image' },
  'other_data.thumbnail.alt': { type: 'international-field', label: 'alt text' },
};
