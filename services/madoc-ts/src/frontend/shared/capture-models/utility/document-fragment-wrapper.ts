import { createDocument } from '../helpers/create-document';
import { generateId } from '../helpers/generate-id';
import { CaptureModel } from '../types/capture-model';
import { documentToDefaultStructure } from './document-to-default-structure';

export function documentFragmentWrapper(fragment: CaptureModel['document']['properties']): CaptureModel {
  const document = createDocument({
    properties: fragment,
  });

  return {
    id: generateId(),
    structure: {
      id: generateId(),
      label: 'Wrapper',
      type: 'model',
      fields: documentToDefaultStructure(document),
    },
    document,
  };
}
