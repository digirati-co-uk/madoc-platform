import { BaseField } from '../types/field-types';

export function isRequiredFieldIncomplete(field?: BaseField) {
  return !!(field && field.required && !field.value);
}

import { RevisionRequest } from '../types/revision-request';
export function isRequiredDocIncomplete(revisionDocument?: RevisionRequest['document']) {
  const fieldsToValidate: any[] = [];

  const properties =
    revisionDocument && revisionDocument.type === 'entity' ? Object.keys(revisionDocument.properties) : [];

  if (revisionDocument) {
    for (const property of properties) {
      const fieldOrEntity = revisionDocument.properties[property];
      if (fieldOrEntity && fieldOrEntity.length) {
        for (const singleFieldOrEntity of fieldOrEntity) {
          if (singleFieldOrEntity.required) {
            fieldsToValidate.push(singleFieldOrEntity);
          }
        }
      }
    }
  }

  console.log(fieldsToValidate)
  for (const field of fieldsToValidate) {
    if (!field.value || field.value === '') {
      return false;
    }
  }
  return true;
}

