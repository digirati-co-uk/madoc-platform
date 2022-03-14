import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';

export function filterRevises(items: Array<BaseField | CaptureModel['document']>) {
  const toRemove: string[] = [];
  for (const field of items) {
    if (field.revises) {
      toRemove.push(field.revises);
    }
  }
  if (toRemove.length) {
    return items.filter(item => toRemove.indexOf(item.id) === -1);
  }

  return items;
}
