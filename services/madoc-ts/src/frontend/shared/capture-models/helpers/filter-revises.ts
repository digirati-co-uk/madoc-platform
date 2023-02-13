import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';

export function filterRevises<T extends Array<BaseField | CaptureModel['document']>>(items: T, destructive = false) {
  const toRemove: string[] = [];
  for (const field of items) {
    if (field.revises) {
      toRemove.push(field.revises);
    }
  }
  if (toRemove.length) {
    const rolled = items.filter(item => toRemove.indexOf(item.id) === -1);

    if (destructive) {
      for (const item of rolled) {
        item.revises = undefined;
      }
    }

    return rolled;
  }

  return items;
}
