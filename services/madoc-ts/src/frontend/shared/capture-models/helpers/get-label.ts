import { CaptureModel } from '../types/capture-model';
import { isEntity } from './is-entity';

export function getLabel(document: CaptureModel['document'], defaultLabel?: string) {
  if (
    document.labelledBy &&
    document.properties[document.labelledBy] &&
    document.properties[document.labelledBy].length > 0
  ) {
    const field = document.properties[document.labelledBy][0];
    if (!isEntity(field) && field.value) {
      return field.value;
    }
  }

  if (defaultLabel) {
    return defaultLabel;
  }

  return `${document.label} (type: ${document.type})`;
}
