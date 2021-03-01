import { BaseField, CaptureModel } from '@capture-models/types';

export function resolveRevisesKey(fieldOrEntity: BaseField | CaptureModel['document']) {
  if (fieldOrEntity.immutable) {
    return fieldOrEntity.id;
  }

  return fieldOrEntity.revises || fieldOrEntity.id;
}
