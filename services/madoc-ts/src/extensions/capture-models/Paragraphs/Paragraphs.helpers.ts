import { generateId } from '../../../frontend/shared/capture-models/helpers/generate-id';
import { isEntity } from '../../../frontend/shared/capture-models/helpers/is-entity';
import { traverseDocument } from '../../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../../frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../../frontend/shared/capture-models/types/field-types';
import { BaseSelector } from '../../../frontend/shared/capture-models/types/selector-types';

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
      if (entity.properties.paragraphs) {
        entity.properties.paragraph = entity.properties.paragraphs;
        delete entity.properties.paragraphs;
      }
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

export function paragraphsToPlaintext(input: ParagraphEntity['properties']['paragraph']) {
  if (!input) {
    return '';
  }
  const paragraphs = [];
  for (const paragraph of input) {
    const lines = [];
    if (paragraph && paragraph.properties && paragraph.properties.lines) {
      for (const line of paragraph.properties.lines) {
        if (line && line.properties && line.properties.text) {
          const texts = [];
          for (const text of line.properties.text) {
            texts.push(text.value);
          }
          lines.push(texts.join(' '));
        }
      }
    }
    paragraphs.push(lines.join('\n'));
  }

  if (!paragraphs.length) {
    return '';
  }

  return paragraphs.join('\n\n');
}

export function isParagraphEntity(entity: BaseField | CaptureModel['document']): entity is ParagraphEntity {
  if (!isEntity(entity)) {
    return false;
  }

  return entity.profile === PARAGRAPHS_PROFILE;
}
