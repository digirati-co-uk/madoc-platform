import { OcrParagraph, reconcileOcrText } from '../../../src/extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { updateRevisionInDocument } from '../../../src/capture-model-server/server-filters/update-revision-in-document';
import { filterRevises } from '../../../src/frontend/shared/capture-models/helpers/filter-revises';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../../src/frontend/shared/capture-models/types/field-types';
import { RevisionRequest } from '../../../src/frontend/shared/capture-models/types/revision-request';
import { processImportedRevision } from '../../../src/frontend/shared/capture-models/utility/process-imported-revision';

let mockId = 0;
jest.mock('../../../src/frontend/shared/capture-models/helpers/generate-id', () => ({
  generateId: () => `generated-${++mockId}`,
}));

function word(value: string, x: number, width: number): BaseField {
  return {
    id: value,
    type: 'text-field',
    value,
    allowMultiple: true,
    label: 'Text',
    selector: {
      id: `${value}-selector`,
      type: 'box-selector',
      state: { x, y: 10, width, height: 20 },
    },
  };
}

function paragraph(words: BaseField[]): OcrParagraph {
  return {
    id: 'paragraph',
    type: 'entity',
    label: 'Paragraph',
    properties: {
      lines: [
        {
          id: 'line',
          type: 'entity',
          label: 'Line',
          properties: { text: words },
          selector: { id: 'line-selector', type: 'box-selector', state: { x: 0, y: 10, width: 200, height: 20 } },
        },
      ],
    },
    selector: { id: 'paragraph-selector', type: 'box-selector', state: { x: 0, y: 10, width: 200, height: 20 } },
  };
}

function saveReconciledWords(original: OcrParagraph, value: string) {
  const result = reconcileOcrText([original], value, 'revision');
  const captureModel = {
    id: 'model',
    structure: { id: 'structure', type: 'model', label: 'OCR', fields: [] },
    document: { id: 'root', type: 'entity', label: 'OCR', properties: { paragraph: [original] } },
    revisions: [],
  } as CaptureModel;
  const request = {
    source: 'structure',
    document: {
      id: 'root',
      type: 'entity',
      label: 'OCR',
      immutable: true,
      properties: { paragraph: result.paragraphs },
    },
    revision: {
      id: 'revision',
      label: 'OCR',
      structureId: 'structure',
      fields: [['paragraph', [['lines', ['text']]]]],
      deletedFields: result.deletedFieldIds,
    },
  } as RevisionRequest;

  updateRevisionInDocument(captureModel, request, { allowAnonymous: true, allowCustomStructure: true });
  captureModel.revisions?.push(request.revision);
  const imported = processImportedRevision(request.revision, captureModel);
  expect(imported).not.toBeNull();
  const savedParagraph = imported!.document.properties.paragraph[0] as OcrParagraph;
  return filterRevises(savedParagraph.properties.lines[0].properties.text) as BaseField[];
}

describe('reconcileOcrText', () => {
  beforeEach(() => {
    mockId = 0;
  });

  test('corrects a word without changing its box', () => {
    const result = reconcileOcrText([paragraph([word('teh', 10, 30), word('cat', 50, 30)])], 'the cat', 'revision');
    const [corrected, unchanged] = result.paragraphs[0].properties.lines[0].properties.text;

    expect(corrected).toMatchObject({ value: 'the', revision: 'revision', revises: 'teh' });
    expect(corrected.selector?.state).toEqual({ x: 10, y: 10, width: 30, height: 20 });
    expect(unchanged.id).toBe('cat');
    expect(result.deletedFieldIds).toEqual([]);
  });

  test('splits one word box across newly separated words', () => {
    const result = reconcileOcrText([paragraph([word('NewYork', 10, 70)])], 'New York', 'revision');
    const [newWord, yorkWord] = result.paragraphs[0].properties.lines[0].properties.text;

    expect(newWord).toMatchObject({ value: 'New', revision: 'revision', revises: 'NewYork' });
    expect(yorkWord).toMatchObject({ value: 'York', revision: 'revision' });
    expect(newWord.selector?.state).toEqual({ x: 10, y: 10, width: 30, height: 20 });
    expect(yorkWord.selector?.state).toEqual({ x: 40, y: 10, width: 40, height: 20 });
  });

  test('merges boxes and records removed words', () => {
    const result = reconcileOcrText(
      [paragraph([word('ice', 10, 30), word('cream', 50, 50), word('today', 110, 50)])],
      'icecream today',
      'revision'
    );
    const [merged, unchanged] = result.paragraphs[0].properties.lines[0].properties.text;

    expect(merged).toMatchObject({ value: 'icecream', revision: 'revision', revises: 'ice' });
    expect(merged.selector?.state).toEqual({ x: 10, y: 10, width: 90, height: 20 });
    expect(unchanged.id).toBe('today');
    expect(result.deletedFieldIds).toEqual(['cream']);
  });

  test('places inserted words in the gap between neighbours', () => {
    const result = reconcileOcrText(
      [paragraph([word('hello', 0, 50), word('world', 100, 50)])],
      'hello brave world',
      'revision'
    );
    const inserted = result.paragraphs[0].properties.lines[0].properties.text[1];

    expect(inserted).toMatchObject({ value: 'brave', revision: 'revision' });
    expect(inserted.selector?.state).toEqual({ x: 50, y: 10, width: 50, height: 20 });
  });

  test('keeps reconciled words in order when the revision is saved', () => {
    const original = paragraph([word('ice', 10, 30), word('cream', 50, 50), word('today', 110, 50)]);
    expect(saveReconciledWords(original, 'icecream today').map(field => field.value)).toEqual(['icecream', 'today']);
  });

  test('saves a word inserted between unchanged neighbours', () => {
    const original = paragraph([word('hello', 10, 40), word('world', 100, 40)]);
    expect(saveReconciledWords(original, 'hello brave world').map(field => field.value)).toEqual([
      'hello',
      'brave',
      'world',
    ]);
  });
});
