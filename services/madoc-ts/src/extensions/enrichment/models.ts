import { EntityFull, EntityQuery, EntityTypeFull, EntityTypeQuery } from './types';
import { CaptureModelShorthand } from '../../frontend/shared/capture-models/types/capture-model-shorthand';

export const entityTypeModel: CaptureModelShorthand<EntityTypeQuery> = {
  title: { type: 'international-field', label: 'Title', required: true },
  label: { type: 'text-field', label: 'slug', required: true },
  description: { type: 'international-field', label: 'Description' },
  featured_topics: { type: 'topic-explorer', label: 'featured topics', allowMultiple: true },
  __nested__: {
    // featured_topics: {
    //   allowMultiple: true,
    //   label: 'Featured topic',
    //   pluralLabel: 'Featured topics',
    //   labelledBy: 'slug',
    // },
    other_data: {
      allowMultiple: false,
      label: 'Images',
      labelledBy: '',
    },
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  // 'featured_topics': { type: 'topic-explorer', label: 'featured topics' },
  'other_data.main_image': { type: 'madoc-media-explorer', label: 'Hero image' },
  'other_data.thumbnail': { type: 'madoc-media-explorer', label: 'Thumbnail' },
};

export const entityModel: CaptureModelShorthand<EntityQuery> = {
  title: { type: 'international-field', label: 'Title', required: true },
  label: { type: 'text-field', label: 'Slug', required: true },
  description: { type: 'international-field', label: 'Description' },
  type_slug: {
    type: 'autocomplete-field',
    label: 'Topic type',
    dataSource: 'madoc-api://topic-types/autocomplete?q=%',
    requestInitial: true,
    outputIdAsString: false,
    required: true,
  },
  __nested__: {
    featured_resources: {
      allowMultiple: true,
      label: 'featured resource',
      pluralLabel: 'featured resources',
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

  'other_data.topic_summary': { type: 'international-field', label: 'Summary' },
  'other_data.secondary_heading': { type: 'international-field', label: 'Secondary heading' },
  'other_data.aliases': { type: 'international-field', label: 'Aliases', allowMultiple: true },
  'other_data.main_image': { type: 'madoc-media-explorer', label: 'Hero image' },
  'other_data.thumbnail': { type: 'madoc-media-explorer', label: 'Thumbnail' },
};
