import { BaseField } from '../../types/field-types';
import { Revisions } from '../../editor/stores/revisions';

export function useResolvedDependant(entityOrField: BaseField) {
  const currentRevision = Revisions.useStoreState(s => s.currentRevision);
  const revisionDocument = currentRevision?.document;
  const fieldsToValidate: any[] = [];

  if (entityOrField.dependant) {
    const dependantField = currentRevision?.document.properties[entityOrField.dependant];

    if (revisionDocument) {
      if (dependantField && dependantField.length) {
        for (const singleFieldOrEntity of dependantField) {
          if (singleFieldOrEntity.properties) {
            const properties = Object.keys(singleFieldOrEntity.properties);
            for (const property of properties) {
              const subFieldOrEntity = singleFieldOrEntity.properties[property];
              if (subFieldOrEntity && subFieldOrEntity.length) {
                for (const singleSubFieldOrEntity of subFieldOrEntity) {
                  fieldsToValidate.push(singleSubFieldOrEntity);
                }
              }
            }
          } else {
            fieldsToValidate.push(singleFieldOrEntity);
          }
        }
      }
    }

    if (fieldsToValidate.length) {
      for (const field of fieldsToValidate) {
        if (!field.value || field.value === '') {
          return false;
        }
      }
      return true;
    }
    return true;
  }
  return true;
}
