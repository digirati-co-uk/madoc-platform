import copy from 'fast-copy';
import { formPropertyValue } from '../../../frontend/shared/capture-models/helpers/fork-field';
import { generateId } from '../../../frontend/shared/capture-models/helpers/generate-id';
import { isEntity } from '../../../frontend/shared/capture-models/helpers/is-entity';
import { traverseDocument } from '../../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../../frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../../frontend/shared/capture-models/types/field-types';
import { BaseSelector } from '../../../frontend/shared/capture-models/types/selector-types';

export const PARAGRAPHS_PROFILE = 'http://madoc.io/profiles/capture-model-fields/paragraphs';

interface BoxState {
  x: number;
  y: number;
  width: number;
  height: number;
}

type OcrLine = CaptureModel['document'] & {
  properties: { text: BaseField[] };
};

export type OcrParagraph = CaptureModel['document'] & {
  properties: { lines: OcrLine[] };
};

interface LocatedWord {
  field: BaseField;
  paragraphIndex: number;
  lineIndex: number;
}

export interface ReconciledOcrText {
  paragraphs: OcrParagraph[];
  deletedFieldIds: string[];
}

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

export function paragraphsToPlaintext(input: OcrParagraph[]) {
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

function getBox(fieldOrEntity?: BaseField | CaptureModel['document']): BoxState | undefined {
  const state: unknown = fieldOrEntity?.selector?.state;
  if (!state || typeof state !== 'object') {
    return undefined;
  }

  const box = state as Partial<BoxState>;
  return typeof box.x === 'number' &&
    typeof box.y === 'number' &&
    typeof box.width === 'number' &&
    typeof box.height === 'number'
    ? (box as BoxState)
    : undefined;
}

function boxesEqual(left?: BoxState, right?: BoxState) {
  return (
    left === right ||
    (!!left &&
      !!right &&
      left.x === right.x &&
      left.y === right.y &&
      left.width === right.width &&
      left.height === right.height)
  );
}

function boundingBox(boxes: BoxState[]): BoxState | undefined {
  if (!boxes.length) {
    return undefined;
  }

  const x = Math.min(...boxes.map(box => box.x));
  const y = Math.min(...boxes.map(box => box.y));
  const right = Math.max(...boxes.map(box => box.x + box.width));
  const bottom = Math.max(...boxes.map(box => box.y + box.height));
  return { x, y, width: right - x, height: bottom - y };
}

function textLength(value: unknown) {
  return Math.max(1, Array.from(String(value || '')).length);
}

function splitBox(box: BoxState | undefined, words: string[], rightToLeft: boolean): Array<BoxState | undefined> {
  if (!box) {
    return words.map(() => undefined);
  }

  const totalLength = words.reduce((total, word) => total + textLength(word), 0);
  let cursor = rightToLeft ? box.x + box.width : box.x;

  return words.map((word, index) => {
    const width =
      index === words.length - 1
        ? rightToLeft
          ? cursor - box.x
          : box.x + box.width - cursor
        : (box.width * textLength(word)) / totalLength;
    const x = rightToLeft ? cursor - width : cursor;
    cursor += rightToLeft ? -width : width;
    return { x, y: box.y, width, height: box.height };
  });
}

function inferInsertionBox(before: LocatedWord | undefined, after: LocatedWord | undefined, words: string[]) {
  const beforeBox = getBox(before?.field);
  const afterBox = getBox(after?.field);

  if (
    beforeBox &&
    afterBox &&
    before?.lineIndex === after?.lineIndex &&
    before?.paragraphIndex === after?.paragraphIndex
  ) {
    const rightToLeft = beforeBox.x > afterBox.x;
    const x = rightToLeft ? afterBox.x + afterBox.width : beforeBox.x + beforeBox.width;
    const width = rightToLeft ? beforeBox.x - x : afterBox.x - x;
    if (width > 0) {
      return {
        box: { x, y: Math.min(beforeBox.y, afterBox.y), width, height: Math.max(beforeBox.height, afterBox.height) },
        rightToLeft,
      };
    }
  }

  const neighbour = before || after;
  const neighbourBox = getBox(neighbour?.field);
  if (!neighbour || !neighbourBox) {
    return { box: undefined, rightToLeft: false };
  }

  const width =
    (neighbourBox.width / textLength(neighbour.field.value)) *
    words.reduce((total, word) => total + textLength(word), 0);
  return {
    box: {
      x: before ? neighbourBox.x + neighbourBox.width : neighbourBox.x - width,
      y: neighbourBox.y,
      width,
      height: neighbourBox.height,
    },
    rightToLeft: false,
  };
}

function updateBox(field: BaseField, box: BoxState | undefined) {
  if (field.selector) {
    field.selector.state = box || null;
  } else if (box) {
    field.selector = { id: generateId(), type: 'box-selector', state: box };
  }
}

function createWord(template: BaseField, value: string, revisionId: string, box: BoxState | undefined): BaseField {
  const field = copy(template);
  field.id = generateId();
  field.value = value;
  field.revision = revisionId;
  delete field.revises;
  if (field.selector) {
    field.selector.id = generateId();
    field.selector.state = box || null;
    delete field.selector.revisedBy;
    delete field.selector.revises;
    delete field.selector.revisionId;
  } else {
    updateBox(field, box);
  }
  return field;
}

function deletionTarget(field: BaseField, revisionId: string) {
  return field.revision === revisionId ? field.revises : field.id;
}

/**
 * Reconciles plain text back into the imported OCR hierarchy without exposing selector editing.
 * Paragraph and line membership are retained; only word fields and their boxes change.
 */
export function reconcileOcrText(input: OcrParagraph[], value: string, revisionId: string): ReconciledOcrText {
  const paragraphs = copy(input);
  const currentWords: LocatedWord[] = [];

  paragraphs.forEach((paragraph, paragraphIndex) => {
    (paragraph.properties.lines || []).forEach((line, lineIndex) => {
      (line.properties.text || []).forEach(field => currentWords.push({ field, paragraphIndex, lineIndex }));
    });
  });

  if (!currentWords.length) {
    return { paragraphs, deletedFieldIds: [] };
  }

  const tokens = value.match(/\S+/gu) || [];
  const desiredWords = tokens.length ? tokens : [''];
  let prefixLength = 0;
  while (
    prefixLength < currentWords.length &&
    prefixLength < desiredWords.length &&
    String(currentWords[prefixLength].field.value || '') === desiredWords[prefixLength]
  ) {
    prefixLength++;
  }

  let suffixLength = 0;
  while (
    suffixLength < currentWords.length - prefixLength &&
    suffixLength < desiredWords.length - prefixLength &&
    String(currentWords[currentWords.length - suffixLength - 1].field.value || '') ===
      desiredWords[desiredWords.length - suffixLength - 1]
  ) {
    suffixLength++;
  }

  const oldMiddle = currentWords.slice(prefixLength, currentWords.length - suffixLength);
  const newMiddle = desiredWords.slice(prefixLength, desiredWords.length - suffixLength);
  const before = currentWords[prefixLength - 1];
  const after = suffixLength ? currentWords[currentWords.length - suffixLength] : undefined;
  const oldBoxes = oldMiddle.map(word => getBox(word.field)).filter((box): box is BoxState => !!box);
  const rightToLeft = oldBoxes.length > 1 && oldBoxes[0].x > oldBoxes[oldBoxes.length - 1].x;

  // ponytail: cross-line replacements use one bounding box; segment by line if that editing pattern becomes common.
  const inferred = oldBoxes.length
    ? { box: boundingBox(oldBoxes), rightToLeft }
    : inferInsertionBox(before, after, newMiddle);
  const replacementBoxes =
    oldMiddle.length === newMiddle.length
      ? oldMiddle.map(word => getBox(word.field))
      : splitBox(inferred.box, newMiddle, inferred.rightToLeft);
  const replacementWords: LocatedWord[] = [];

  newMiddle.forEach((word, index) => {
    const source = oldMiddle[index];
    const location = source || oldMiddle[oldMiddle.length - 1] || before || after || currentWords[0];
    const box = replacementBoxes[index];
    let field: BaseField;

    if (source) {
      field = source.field;
      if (String(field.value || '') !== word || !boxesEqual(getBox(field), box)) {
        if (field.revision !== revisionId) {
          formPropertyValue(field, {
            clone: false,
            generateNewId: true,
            revision: revisionId,
            forkValue: true,
            revisesFork: true,
          });
        }
        field.value = word;
        updateBox(field, box);
      }
    } else {
      const template = oldMiddle[oldMiddle.length - 1]?.field || before?.field || after?.field || currentWords[0].field;
      field = createWord(template, word, revisionId, box);
    }

    replacementWords.push({ field, paragraphIndex: location.paragraphIndex, lineIndex: location.lineIndex });
  });

  const nextWords = [
    ...currentWords.slice(0, prefixLength),
    ...replacementWords,
    ...(suffixLength ? currentWords.slice(currentWords.length - suffixLength) : []),
  ];

  paragraphs.forEach(paragraph => {
    paragraph.properties.lines.forEach(line => {
      line.properties.text = [];
    });
  });
  nextWords.forEach(word => {
    paragraphs[word.paragraphIndex].properties.lines[word.lineIndex].properties.text.push(word.field);
  });

  return {
    paragraphs,
    deletedFieldIds: oldMiddle
      .slice(newMiddle.length)
      .map(word => deletionTarget(word.field, revisionId))
      .filter((id): id is string => !!id),
  };
}

export function isParagraphEntity(entity: BaseField | CaptureModel['document']): entity is ParagraphEntity {
  if (!isEntity(entity)) {
    return false;
  }

  return entity.profile === PARAGRAPHS_PROFILE;
}
