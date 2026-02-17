import type { CompletionItem } from '../../../frontend/shared/capture-models/editor/input-types/AutocompleteField/AutocompleteField';
import type { DropdownOption } from '../../../frontend/shared/capture-models/editor/atoms/Dropdown';

export type HooksTableFieldType = 'text-field' | 'dropdown-field' | 'autocomplete-field' | 'checkbox-field';

type HooksTableBaseField = {
  key: string;
  label: string;
  description?: string;
  required?: boolean;
};

export type HooksTableTextField = HooksTableBaseField & {
  type: 'text-field';
  placeholder?: string;
  multiline?: boolean;
  minLines?: number;
};

export type HooksTableDropdownField = HooksTableBaseField & {
  type: 'dropdown-field';
  options: DropdownOption[];
  placeholder?: string;
  clearable?: boolean;
};

export type HooksTableAutocompleteField = HooksTableBaseField & {
  type: 'autocomplete-field';
  dataSource: string;
  staticOptions: CompletionItem[];
  placeholder?: string;
  clearable?: boolean;
  requestInitial?: boolean;
};

export type HooksTableCheckboxField = HooksTableBaseField & {
  type: 'checkbox-field';
  inlineLabel?: string;
  inlineDescription?: string;
};

export type HooksTableFieldDefinition =
  | HooksTableTextField
  | HooksTableDropdownField
  | HooksTableAutocompleteField
  | HooksTableCheckboxField;

export const hooksTableStaticAutocompleteOptions: CompletionItem[] = [
  {
    uri: 'urn:hooks-table:entity:alice-smith',
    label: 'Alice Smith',
    resource_class: 'Person',
  },
  {
    uri: 'urn:hooks-table:entity:bob-jones',
    label: 'Bob Jones',
    resource_class: 'Person',
  },
  {
    uri: 'urn:hooks-table:entity:regional-archives',
    label: 'Regional Archives',
    resource_class: 'Organisation',
  },
  {
    uri: 'urn:hooks-table:entity:manchester',
    label: 'Manchester',
    resource_class: 'Place',
  },
];

export const hooksTableStatusOptions: DropdownOption[] = [
  { value: 'not_started', text: 'Not started' },
  { value: 'in_progress', text: 'In progress' },
  { value: 'done', text: 'Done' },
];

export const hooksTableReviewPriorityOptions: DropdownOption[] = [
  { value: 'low', text: 'Low' },
  { value: 'medium', text: 'Medium' },
  { value: 'high', text: 'High' },
];

export const hooksTableTestingRowFields: HooksTableFieldDefinition[] = [
  {
    key: 'entry',
    type: 'text-field',
    label: 'Entry',
    placeholder: 'Enter table value',
  },
  {
    key: 'status',
    type: 'dropdown-field',
    label: 'Status',
    options: hooksTableStatusOptions,
    placeholder: 'Select status',
    clearable: true,
  },
  {
    key: 'entity',
    type: 'autocomplete-field',
    label: 'Entity',
    dataSource: 'hooks-table-testing://entities',
    staticOptions: hooksTableStaticAutocompleteOptions,
    placeholder: 'Search entities',
    clearable: true,
    requestInitial: true,
  },
  {
    key: 'verified',
    type: 'checkbox-field',
    label: 'Verified',
    inlineLabel: 'Mark this row as verified',
  },
  {
    key: 'comment',
    type: 'text-field',
    label: 'Comment',
    multiline: true,
    minLines: 2,
  },
];

export const hooksTableTestingTopLevelFields: HooksTableFieldDefinition[] = [
  {
    key: 'pageNotes',
    type: 'text-field',
    label: 'Page notes',
    multiline: true,
    minLines: 3,
  },
  {
    key: 'reviewPriority',
    type: 'dropdown-field',
    label: 'Review priority',
    options: hooksTableReviewPriorityOptions,
    placeholder: 'Select priority',
    clearable: true,
  },
  {
    key: 'referenceEntity',
    type: 'autocomplete-field',
    label: 'Reference entity',
    dataSource: 'hooks-table-testing://entities',
    staticOptions: hooksTableStaticAutocompleteOptions,
    placeholder: 'Select entity',
    clearable: true,
    requestInitial: true,
  },
  {
    key: 'requiresFollowUp',
    type: 'checkbox-field',
    label: 'Requires follow-up',
    inlineLabel: 'Requires follow-up',
  },
];

function toDefinitionMap(
  fields: HooksTableFieldDefinition[]
): Record<string, HooksTableFieldDefinition> {
  return fields.reduce<Record<string, HooksTableFieldDefinition>>((acc, field) => {
    acc[field.key] = field;
    return acc;
  }, {});
}

export const hooksTableTestingRowFieldMap = toDefinitionMap(hooksTableTestingRowFields);
export const hooksTableTestingTopLevelFieldMap = toDefinitionMap(hooksTableTestingTopLevelFields);

export function toCaptureModelFieldDefinition(field: HooksTableFieldDefinition): Record<string, unknown> {
  const { key: _key, staticOptions: _staticOptions, ...rest } = field as HooksTableFieldDefinition & {
    staticOptions?: CompletionItem[];
  };

  return rest;
}
