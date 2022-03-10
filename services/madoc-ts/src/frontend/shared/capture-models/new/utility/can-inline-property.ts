import { isEntityList } from '../../helpers/is-entity';
import { CaptureModel } from '../../types/capture-model';
import { BaseField } from '../../types/field-types';

export function canInlineProperty(instances: BaseField[] | CaptureModel['document'][]) {
  if (isEntityList(instances)) {
    // We can't inline instances, not in this way.
    return false;
  }

  const revises = [];
  for (const instance of instances) {
    if (instance.revises) {
      revises.push(instance.revises);
    }
  }
  if (revises.length) {
    let count = 0;
    for (const instance of instances) {
      if (revises.indexOf(instance.id) === -1) {
        count++;
      }
    }
    return count === 1;
  }

  return instances.length === 1;
}
