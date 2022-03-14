import { BaseField } from '../types/field-types';
import { generateId } from './generate-id';

export function createField(field: Partial<BaseField> = {}): BaseField {
  const finalField = {
    id: generateId(),
    label: field.label || 'Untitled field',
    ...field,
  } as any;

  if (finalField.selector && !finalField.selector.id) {
    finalField.selector.id = generateId();
  }

  return finalField as any;
}
