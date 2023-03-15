import { EnrichmentEntity, EnrichmentEntityType } from './authority/types';
import { CaptureModelShorthand } from '../../frontend/shared/capture-models/types/capture-model-shorthand';

export const entityTypeModel: CaptureModelShorthand<EnrichmentEntityType> = {
  // Todo - this will change to title
  other_labels: { type: 'international-field', label: 'Title' },
  description: { type: 'international-field', label: 'Description' },
  image_url: { type: 'madoc-media-explorer', label: 'Image', valueAsString: true },
  featured_topics: { type: 'topic-explorer', label: 'featured topics' },

  __nested__: {
    featured_topics: {
      allowMultiple: false,
      label: 'Featured Topics',
      pluralLabel: 'Featured Topics',
      labelledBy: 'value',
    },
  },
};

export const entityModel: CaptureModelShorthand<EnrichmentEntity> = {
  // other_labels: { type: 'international-field', label: 'Display label' },
  label: { type: 'text-field', label: 'Canonical label', description: '(this will effect the slug)' },
  description: { type: 'international-field', label: 'Description' },
  image_url: { type: 'madoc-media-explorer', label: 'Image', valueAsString: true },
  featured_resources: { type: 'topic-item-explorer', label: 'featured resources' },

  __nested__: {
    authorities: { allowMultiple: true, label: 'Authority', pluralLabel: 'Authorities', labelledBy: 'value' },
    // featured_resources: {
    //   allowMultiple: true,
    //   label: 'Featured Resource',
    //   pluralLabel: 'Featured Resources',
    //   labelledBy: 'value',
    // },
  },
  //links
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  'authorities.uri': { type: 'text-field', label: 'URI / URL' },
  'authorities.authority': { type: 'text-field', label: 'Authority label' },
  'authorities.identifier': { type: 'text-field', label: 'Authority identifier' },
  // 'featured_resources.type': { type: 'topic-item-explorer', label: 'featured resources' },

  'other_data.example_data': { type: 'text-field', label: 'Example data' },

  type: {
    type: 'autocomplete-field',
    label: 'Topic type',
    dataSource: 'madoc-api://topic-types/autocomplete?q=%',
    requestInitial: true,
    outputIdAsString: false,
  },
};
