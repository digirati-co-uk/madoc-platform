import { generateId, traverseDocument } from '@capture-models/helpers';
import { CaptureModel } from '@capture-models/types';

export function preprocessCaptureModel(data: CaptureModel['document']['properties']) {
  const documentWrapper: CaptureModel['document'] = {
    id: '',
    type: 'entity',
    properties: data,
    label: 'Document wrapper',
  };
  traverseDocument(documentWrapper, {
    visitEntity(entity) {
      entity.id = generateId();
    },
    visitField(field) {
      field.id = generateId();
    },
    visitSelector(selector) {
      selector.id = generateId();
      if (selector.state) {
        if (typeof selector.state.x === 'string') {
          selector.state.x = Number(selector.state.x);
        }
        if (typeof selector.state.y === 'string') {
          selector.state.y = Number(selector.state.y);
        }
        if (typeof selector.state.width === 'string') {
          selector.state.width = Number(selector.state.width);
        }
        if (typeof selector.state.height === 'string') {
          selector.state.height = Number(selector.state.height);
        }
      }
    },
  });

  return documentWrapper.properties;
}
