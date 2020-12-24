import { createDocument, generateId } from '@capture-models/helpers';
import { CaptureModel } from '@capture-models/types';
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
