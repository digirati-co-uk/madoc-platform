import { BaseField } from '../types/field-types';

export function isRequiredFieldIncomplete(field?: BaseField) {
  return !!(field && field.required && !field.value);
}
