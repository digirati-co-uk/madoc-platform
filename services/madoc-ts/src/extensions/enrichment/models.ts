import { EnrichmentEntity, EnrichmentEntityType } from './authority/types';
import { CaptureModelShorthand } from '../../frontend/shared/capture-models/types/capture-model-shorthand';

export const entityTypeModel: CaptureModelShorthand<EnrichmentEntityType> = {
  other_labels: { type: 'international-field', label: 'Display label' },
  label: { type: 'text-field', label: 'Canonical label' },
  description: { type: 'international-field', label: 'Description' },
  image_url: { type: 'madoc-media-explorer', label: 'Image', valueAsString: true },
  // other_data.
  'other_data.example_data': { type: 'text-field', label: 'Example data' },
};

export const entityModel: CaptureModelShorthand<EnrichmentEntity> = {
  other_labels: { type: 'international-field', label: 'Display label' },
  label: { type: 'text-field', label: 'Canonical label' },
  __nested__: {
    other_labels: { allowMultiple: true, label: 'Other label', pluralLabel: 'Other labels', labelledBy: 'value' },
  },
  type: {
    type: 'autocomplete-field',
    label: 'Topic type',
    dataSource: 'madoc-api://topic-types/autocomplete?q=%',
    requestInitial: true,
    outputIdAsString: true,
  },
};
