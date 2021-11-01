import { CaptureModel } from '@capture-models/types';

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
