import { Paragraphs } from '../../src/extensions/capture-models/Paragraphs/Paragraphs.extension';
import { PARAGRAPHS_PROFILE } from '../../src/extensions/capture-models/Paragraphs/Paragraphs.helpers';
import { migrateOcrStructure } from '../../src/capture-model-server/migration/migrate-ocr-structure';
import { structureToFlatStructureDefinition } from '../../src/frontend/shared/capture-models/editor/core/structure-editor';
import { createRevisionRequestFromStructure } from '../../src/frontend/shared/capture-models/helpers/create-revision-request';
import { CaptureModel } from '../../src/frontend/shared/capture-models/types/capture-model';
import { ApiClient } from '../../src/gateway/api';

function template(): CaptureModel {
  return {
    id: 'model',
    target: [{ type: 'Canvas', id: 'urn:madoc:canvas:1' }],
    document: {
      id: 'document',
      type: 'entity',
      label: 'OCR',
      properties: {
        'ocr-correction': [{ id: 'placeholder', type: 'madoc-paragraphs', label: 'OCR Correction', value: '' }],
      },
    },
    structure: {
      id: 'shared-structure',
      type: 'choice',
      label: 'OCR',
      items: [{ id: 'form', type: 'model', label: 'Default', fields: ['ocr-correction'] }],
    },
  };
}

function line(): CaptureModel['document'] {
  return {
    id: 'line',
    type: 'entity',
    label: 'Line',
    properties: { text: [{ id: 'text', type: 'text-field', label: 'Text', value: 'OCR content' }] },
  };
}

test.each([false, true])(
  'OCR imports derive fields from the document (paragraphs: %s) and detach the shared structure',
  async nested => {
    const model = template();
    const data = { paragraph: [nested ? { ...line(), properties: { lines: [line()] } } : line()] };
    const updateCaptureModel = jest.fn(async (_id: string, saved: CaptureModel) => saved);
    const api = {
      getCanvasLinking: jest.fn(async () => ({
        linking: [
          {
            property: 'seeAlso',
            link: { type: 'CaptureModelDocument' },
            file: { bucket: 'ocr', path: 'ocr.json' },
          },
        ],
      })),
      getStorageJsonData: jest.fn(async () => data),
      updateCaptureModel,
    } as unknown as ApiClient;

    const result = await new Paragraphs(api).onCloneCaptureModel(model);
    expect(result.structure.id).not.toBe('shared-structure');
    expect(result.structure).toMatchObject({
      items: [
        {
          id: 'form',
          fields: [['ocr-correction', nested ? [['lines', ['text']]] : ['text']]],
        },
      ],
    });
    expect(updateCaptureModel).toHaveBeenCalledWith('model', result);
  }
);

test('legacy shared OCR structures are repaired for both the placeholder and imported lines', () => {
  const model = template();
  if (model.structure.type !== 'choice' || model.structure.items[0].type !== 'model') throw new Error('Expected form');
  model.structure.items[0].fields = [['ocr-correction', [['lines', ['text']]]]];
  const legacyStructure = structuredClone(model.structure);

  expect(() =>
    structureToFlatStructureDefinition(model.document, [['ocr-correction', [['lines', ['text']]]]])
  ).not.toThrow();
  expect(migrateOcrStructure(model.structure, model.document)).toMatchObject({
    items: [{ fields: ['ocr-correction'] }],
  });

  model.document.properties['ocr-correction'] = [{ ...line(), profile: PARAGRAPHS_PROFILE }];
  const repaired = migrateOcrStructure(legacyStructure, model.document);
  expect(repaired).toMatchObject({ items: [{ fields: [['ocr-correction', ['text']]] }] });
  if (repaired.type !== 'choice') throw new Error('Expected choice');
  expect(createRevisionRequestFromStructure(model, repaired.items[0]).document.properties['ocr-correction']).toEqual(
    model.document.properties['ocr-correction']
  );
  expect(
    repaired.type === 'choice' &&
      repaired.items[0].type === 'model' &&
      structureToFlatStructureDefinition(model.document, repaired.items[0].fields)
  ).toEqual([{ key: ['ocr-correction', 'text'], type: 'text-field', label: 'Text', fullLabel: 'Line / Text' }]);
});

test('valid paragraph structures and unrelated fields are preserved', () => {
  const model = template();
  model.document.properties['ocr-correction'] = [
    { ...line(), profile: PARAGRAPHS_PROFILE, properties: { lines: [line()] } },
  ];
  if (model.structure.type !== 'choice' || model.structure.items[0].type !== 'model') throw new Error('Expected form');
  model.structure.items[0].fields = [['ocr-correction', [['lines', ['text']]]], 'other-field'];
  const original = structuredClone(model.structure);
  expect(migrateOcrStructure(model.structure, model.document)).toEqual(original);
});
