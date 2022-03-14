import { BaseField } from '../types/field-types';

type PostFilter = (fields: BaseField[]) => BaseField[];

export function filterEmptyFields(fields: BaseField[]): BaseField[] {
  if (fields.length === 1) {
    return fields;
  }

  const containsCanonical = fields.filter(f => !f.revision);

  if (fields.length === containsCanonical.length) {
    return fields;
  }

  const filtered = fields.filter(field => {
    return !!field.revision;
  });

  if (filtered.length === 0) {
    // When there is no other field, we return this.
    return fields;
  }

  return filtered;
}

export function filterRemovedFields(fieldsToRemove: string[]): PostFilter {
  return fields => {
    if (fields.length === 1) {
      return fields;
    }

    const filteredFields = fields.filter(f => fieldsToRemove.indexOf(f.id) === -1);

    if (filteredFields.length) {
      return filteredFields;
    }

    // Can't delete them all!
    return fields;
  };
}
