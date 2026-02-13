import { isEntity } from '../../helpers/is-entity';
import { CaptureModel } from '../../types/capture-model';

export function getMaxEntityDepth(document: CaptureModel['document'] | undefined): number {
  if (!document) {
    return 0;
  }

  let maxDepth = 1;

  for (const property of Object.keys(document.properties || {})) {
    const instances = document.properties[property];

    for (const instance of instances || []) {
      if (!isEntity(instance)) {
        continue;
      }
      maxDepth = Math.max(maxDepth, 1 + getMaxEntityDepth(instance));
    }
  }

  return maxDepth;
}

export function isTwoLevelInlineEntityModel(document: CaptureModel['document'] | undefined): boolean {
  return getMaxEntityDepth(document) === 2;
}
