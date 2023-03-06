import { EnrichmentEntity, EnrichmentEntityType } from './authority/types';
import { CaptureModelShorthand } from '../../frontend/shared/capture-models/types/capture-model-shorthand';

export const entityTypeModel: CaptureModelShorthand<EnrichmentEntityType> = {
  other_labels: { type: 'international-field', label: 'Display label' },
  label: { type: 'text-field', label: 'Canonical label', description: '(this will effect the slug)' },
  description: { type: 'international-field', label: 'Description' },
  image_url: { type: 'madoc-media-explorer', label: 'Image', valueAsString: true },
  // other_data.
  'other_data.example_data': { type: 'text-field', label: 'Example data' },
};

export const entityModel: CaptureModelShorthand<EnrichmentEntity> = {
  other_labels: { type: 'international-field', label: 'Display label' },
  label: { type: 'text-field', label: 'Canonical label', description: '(this will effect the slug)' },
  description: { type: 'international-field', label: 'Description' },
  image_url: { type: 'madoc-media-explorer', label: 'Image', valueAsString: true },
  __nested__: {
    other_labels: { allowMultiple: true, label: 'Other label', pluralLabel: 'Other labels', labelledBy: 'value' },
  },
  // other_data.
  'other_data.example_data': { type: 'text-field', label: 'Example data' },
  type: {
    type: 'autocomplete-field',
    label: 'Topic type',
    dataSource: 'madoc-api://topic-types/autocomplete?q=%',
    requestInitial: true,
    outputIdAsString: true,
  },
};
