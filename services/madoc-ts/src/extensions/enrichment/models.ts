import { EnrichmentEntity, EnrichmentEntityType } from './authority/types';
import { CaptureModelShorthand } from '../../frontend/shared/capture-models/types/capture-model-shorthand';

export const entityTypeModel: CaptureModelShorthand<EnrichmentEntityType> = {
  title: { type: 'international-field', label: 'Title' },
  description: { type: 'international-field', label: 'Description' },
  image_url: { type: 'madoc-media-explorer', label: 'Image', valueAsString: true },
  // featured_topics: { type: 'topic-explorer', label: 'featured topics' },
  };

export const entityModel: CaptureModelShorthand<EnrichmentEntity> = {
  title: { type: 'international-field', label: 'Title' },
  description: { type: 'international-field', label: 'Description' },
  // featured_resources: { type: 'topic-item-explorer', label: 'featured resources' },
  __nested__: {
    authorities: { allowMultiple: true, label: 'Authority', pluralLabel: 'Authorities', labelledBy: 'value' },
  },
  //links
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  'authorities.uri': { type: 'text-field', label: 'URI / URL' },
  'authorities.authority': { type: 'text-field', label: 'Authority label' },
  'authorities.identifier': { type: 'text-field', label: 'Authority identifier' },

  'other_data.main_image': { type: 'madoc-media-explorer', label: 'Image', valueAsString: true },
  'other_data.thumbnail': { type: 'madoc-media-explorer', label: 'Thumbnail', valueAsString: true },
  'other_data.topic_summary': { type: 'international-field', label: 'Summary', allowMultiple: false },
  'other_data.secondary_heading': { type: 'international-field', label: 'Secondary Heading', allowMultiple: false },

  type: {
    type: 'autocomplete-field',
    label: 'Topic type',
    dataSource: 'madoc-api://topic-types/autocomplete?q=%',
    requestInitial: true,
    outputIdAsString: false,
  },
};
