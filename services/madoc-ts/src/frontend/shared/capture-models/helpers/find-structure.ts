import { CaptureModel } from '../types/capture-model';
import { traverseStructure } from './traverse-structure';

export function findStructure(
  captureModel: CaptureModel | CaptureModel['structure'],
  id: string,
  path: string[] = []
): CaptureModel['structure'] | undefined {
  const rootStructure: CaptureModel['structure'] = (captureModel as CaptureModel).structure
    ? (captureModel as CaptureModel).structure
    : (captureModel as CaptureModel['structure']);

  let foundStructure;
  traverseStructure(
    rootStructure,
    structure => {
      if (structure.id === id) {
        foundStructure = structure;
        return true;
      }
      return;
    },
    path
  );

  return foundStructure;
}
