import { generateId, isEntity, isEntityList, traverseDocument } from '@capture-models/helpers';
import { BaseField, BaseSelector, CaptureModel } from '@capture-models/types';

export const PARAGRAPHS_PROFILE = 'http://madoc.io/profiles/capture-model-fields/paragraphs';

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

export type ParagraphEntity = CaptureModel['document'] & {
  profile: typeof PARAGRAPHS_PROFILE;
  selector: BaseSelector;
  properties: {
    paragraph: Array<
      CaptureModel['document'] & {
        selector: BaseSelector;
        properties: {
          lines: Array<
            CaptureModel['document'] & {
              selector: BaseSelector;
              properties: {
                text: Array<BaseField>;
              };
            }
          >;
        };
      }
    >;
  };
};

export function isParagraphEntity(entity: BaseField | CaptureModel['document']): entity is ParagraphEntity {
  if (!isEntity(entity)) {
    return false;
  }

  return entity.profile === PARAGRAPHS_PROFILE;
}
