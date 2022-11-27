export const entityTypeModel = {
  __nested__: {
    other_labels: { allowMultiple: true, label: 'Other label', pluralLabel: 'Other labels', labelledBy: 'value' },
  },
  label: { type: 'text-field', label: 'Entity Label' },
  'other_labels.value': { type: 'text-field', label: 'Label' },
  'other_labels.language': { type: 'text-field', label: 'Language' },
};
