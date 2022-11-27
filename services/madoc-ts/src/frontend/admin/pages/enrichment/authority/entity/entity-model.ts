export const entityModel = {
  __nested__: {
    other_labels: { allowMultiple: true, label: 'Other label', pluralLabel: 'Other labels', labelledBy: 'value' },
  },
  label: { type: 'text-field', label: 'Topic label' },
  'other_labels.value': { type: 'text-field', label: 'Label' },
  'other_labels.language': { type: 'text-field', label: 'Language' },
  type: {
    type: 'autocomplete-field',
    label: 'Topic type',
    dataSource: 'madoc-api://topic-types/autocomplete?q=%',
    requestInitial: true,
    outputIdAsString: true,
  },
  // type: {
  //   type: 'text-field',
  //   label: 'Entity type (uuid)',
  // },
};
