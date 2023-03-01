import { getEmptyBorder } from '../editor/input-types/BorderField/BorderField';
import { BaseField } from '../types/field-types';

export const isEmptyFieldList = (fields: BaseField[]) => {
  if (!fields || fields.length === 0) {
    return true;
  }
  for (const field of fields) {
    if (field.value) {
      // Hack. We need an "isEmpty" on the field definitions I think.
      if (field.type === 'international-field') {
        const intValues = Object.values(field.value);
        return intValues.every((s: any) => s[0] === '');
      }

      if (field.type === 'border-field') {
        return field.value.size === 0;
      }
      if (field.type === 'checkbox-list-field') {
        return Object.keys(field.value).length < 1;
      }
      return false;
    }

    if (field.selector) {
      if ((field.selector.revisedBy && field.selector.revisedBy.length) || field.selector.state) {
        return false;
      }
    }
  }
  return true;
};
