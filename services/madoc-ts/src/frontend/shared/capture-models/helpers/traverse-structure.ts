import { CaptureModel } from '../types/capture-model';

/**
 * @deprecated
 */
export function traverseStructure(
  structure: CaptureModel['structure'],
  onStructure: (s: CaptureModel['structure'], p: string[]) => boolean | void,
  path: string[] = [structure.id]
) {
  if (structure.type === 'choice') {
    for (const item of structure.items) {
      if (traverseStructure(item, onStructure, [...path, structure.id, item.id]) === true) {
        return;
      }
    }
  }
  return onStructure(structure, path);
}
