import { CaptureModel } from '../types/capture-model';

export function isEntity(input: any): input is CaptureModel['document'] {
  return input.type === 'entity';
}

export function isEntityList(input: any[]): input is CaptureModel['document'][] {
  return input && input[0] && input[0].type === 'entity';
}
