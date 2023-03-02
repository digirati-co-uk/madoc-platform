import { generateModelFields } from '../../../utility/generate-model-fields';
import { generateId } from '../capture-models/helpers/generate-id';
import { CaptureModel } from '../capture-models/types/capture-model';

export function createDefaultStructure(document: CaptureModel['document']): CaptureModel['structure'] {
  return {
    label: 'Default',
    description: '',
    id: generateId(),
    type: 'model',
    fields: generateModelFields(document),
  };
}
