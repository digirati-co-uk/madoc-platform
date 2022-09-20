import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../frontend/shared/capture-models/types/field-types';

export function getBefore(
  fieldOrEntity: CaptureModel['document'] | BaseField,
  term: string,
  parent: CaptureModel['document']
): [string | null, number] {
  const propertyList = parent.properties[term as any];
  let lastIdx = -1;
  if (propertyList && Array.isArray(propertyList)) {
    let last = null;
    for (let i = 0; i < propertyList.length; i++) {
      const item = propertyList[i];

      if (item.id === fieldOrEntity.id) {
        return [last, lastIdx];
      }
      last = item.id;
      lastIdx = i;
    }
  }
  return [null, lastIdx];
}
