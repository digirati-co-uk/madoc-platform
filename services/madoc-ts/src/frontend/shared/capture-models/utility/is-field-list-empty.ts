import { BaseField } from '../types/field-types';

export const isEmptyFieldList = (fields: BaseField[]) => {
  if (!fields || fields.length === 0) {
    return true;
  }
  for (const field of fields) {
    if (field.value) {
      return false;
    }

    if (field.selector) {
      if (field.selector.revisedBy && field.selector.revisedBy.length) {
        return false;
      }
    }
  }
  return true;
};
