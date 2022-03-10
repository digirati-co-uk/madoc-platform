import { CaptureModel } from '../frontend/shared/capture-models/types/capture-model';

export function traverseStructure(structure: CaptureModel['structure'], cb: (item: any) => void, maxDepth = 10) {
  if (!maxDepth) {
    cb(structure);
    return;
  }
  if (structure.type === 'choice') {
    for (const item of structure.items || []) {
      traverseStructure(item, cb, maxDepth - 1);
    }
    cb(structure);
  } else {
    cb(structure);
  }
}
