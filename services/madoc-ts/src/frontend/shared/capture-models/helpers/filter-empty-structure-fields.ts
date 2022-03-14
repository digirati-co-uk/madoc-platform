import { CaptureModel, ModelFields } from '../types/capture-model';
import { isEntityList } from './is-entity';

export function filterEmptyStructureFields(fields: ModelFields, entity: CaptureModel['document']): ModelFields {
  const returnFields = [];

  for (const field of fields) {
    // This is a field.
    if (Array.isArray(field)) {
      const [modelProperty, innerFields] = field as [string, string[]];
      const innerEntity = entity.properties[modelProperty];
      if (!innerEntity || innerEntity.length === 0 || !isEntityList(innerEntity)) {
        continue;
      }
      const returnInnerFields = filterEmptyStructureFields(innerFields, innerEntity[0]);

      if (returnInnerFields.length) {
        returnFields.push([modelProperty, returnInnerFields]);
      }
    } else {
      // We have a single property.
      if (entity.properties[field] && entity.properties[field].length) {
        returnFields.push(field);
      }
    }
  }

  return returnFields as ModelFields;
}
