import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';

export function deleteFrom(id: string, property: string, parent: CaptureModel['document']) {
  if ((parent as any).properties[property]) {
    (parent as any).properties[property] = (parent as any).properties[property].filter((e: any) => e.id !== id);
  }
}
