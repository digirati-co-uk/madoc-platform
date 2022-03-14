/**
 * @jest-environment jsdom
 */

import {
  documentFieldOptionsToStructure,
  getDocumentFields,
  mergeFlatKeys,
  structureToFlatStructureDefinition,
} from '../../../src/frontend/shared/capture-models/editor/core/structure-editor';
import { expandModelFields } from '../../../src/frontend/shared/capture-models/helpers/expand-model-fields';
import { registerField } from '../../../src/frontend/shared/capture-models/plugin-api/global-store';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';

registerField({
  label: 'Text field',
  type: 'text-field',
  description: 'Simple text field for plain text',
  Component: undefined as any,
  defaultValue: '',
  allowMultiple: true,
  defaultProps: {},
  Editor: undefined as any,
  // Editor: TextFieldEditor,
  TextPreview: undefined as any,
} as any);

describe('structure editor', () => {
  const DEFAULT_MODEL: CaptureModel = {
    structure: { id: '1', type: 'model', label: 'empty', fields: [] },
    document: { id: '1', type: 'entity', label: 'Untitled document', properties: {} },
  };

  describe('mergeFlatKeys', () => {
    test('simple fields', () => {
      expect(mergeFlatKeys([['field1'], ['field2'], ['field3']])).toEqual(['field1', 'field2', 'field3']);
    });

    test('simple fields nested', () => {
      expect(
        mergeFlatKeys([
          ['field1', 'field1.1'],
          ['field1', 'field1.2'],
          ['field1', 'field1.3'],
          ['field2', 'field2.1'],
          ['field3'],
        ])
      ).toEqual([['field1', ['field1.1', 'field1.2', 'field1.3']], ['field2', ['field2.1']], 'field3']);
    });

    test('complex fields nested', () => {
      expect(
        mergeFlatKeys([
          ['field1', 'field1.1'],
          ['field1', 'field1.2'],
          ['field2', 'field2.1'],
          ['field1', 'field1.3'],
          ['field2', 'field2.2'],
          ['field2', 'field2.3'],
          ['field3'],
        ])
      ).toEqual([
        ['field1', ['field1.1', 'field1.2', 'field1.3']],
        ['field2', ['field2.1', 'field2.2', 'field2.3']],
        'field3',
      ]);
    });

    test('duplicate fields nested', () => {
      expect(
        mergeFlatKeys([
          ['field1', 'field1.1'],
          ['field1', 'field1.2'],
          ['field3'],
          ['field1', 'field1.1'],
          ['field1', 'field1.2'],
          ['field1', 'entity2', 'entity2.2', 'entity.2'],
          ['field3'],
          ['field1', 'field1.1'],
          ['field1', 'entity2', 'entity2.3', 'entity.2'],
          ['field1', 'field1.2'],
          ['field3'],
          ['field1', 'entity2', 'entity2.2', 'entity.3'],
          ['field1', 'entity2', 'entity2.2', 'entity.3'],
        ])
      ).toEqual([
        [
          'field1',
          [
            'field1.1',
            'field1.2',
            [
              'entity2',
              [
                ['entity2.2', ['entity.2', 'entity.3']],
                ['entity2.3', ['entity.2']],
              ],
            ],
          ],
        ],
        'field3',
      ]);
    });
  });

  describe('getDocumentFields', () => {
    test('simple fields', () => {
      expect(
        getDocumentFields({
          id: '1',
          type: 'entity',
          label: 'Person',
          properties: {
            firstName: [
              {
                id: 'f1',
                type: 'text-field',
                label: 'First name',
                value: '',
              },
            ],
            lastName: [
              {
                id: 'f2',
                type: 'text-field',
                label: 'Last name',
                value: '',
              },
            ],
          },
        })
      ).toMatchInlineSnapshot(`
        Object {
          "fields": Array [
            Object {
              "key": Array [
                "firstName",
              ],
              "label": "First name",
              "type": "text-field",
            },
            Object {
              "key": Array [
                "lastName",
              ],
              "label": "Last name",
              "type": "text-field",
            },
          ],
          "key": Array [],
          "label": "Person",
          "type": "model",
        }
      `);
    });
  });

  describe('structureToFlatStructureDefinition', () => {
    test('simple', () => {
      const model: CaptureModel['document'] = {
        id: '1',
        type: 'entity',
        label: 'Untitled document',
        properties: {
          field1: [{ id: '1', type: 'text-field', label: 'field 1', value: '' }],
          field2: [{ id: '2', type: 'text-field', label: 'field 2', value: '' }],
          field3: [{ id: '3', type: 'text-field', label: 'field 3', value: '' }],
        },
      };

      const def = structureToFlatStructureDefinition(model, ['field1']);
      expect(def).toEqual([{ key: ['field1'], label: 'field 1', type: 'text-field' }]);

      const def2 = structureToFlatStructureDefinition(model, ['field2', 'field3']);
      expect(def2).toEqual([
        { key: ['field2'], label: 'field 2', type: 'text-field' },
        { key: ['field3'], label: 'field 3', type: 'text-field' },
      ]);
    });

    test('nested', () => {
      const model: CaptureModel['document'] = {
        id: '1',
        type: 'entity',
        label: 'Untitled document',
        properties: {
          field1: [{ id: 'f1', type: 'text-field', label: 'field 1', value: '' }],
          entity1: [
            {
              id: 'e1',
              type: 'entity',
              label: 'entity 1',
              properties: {
                field2: [{ id: 'f2', type: 'text-field', label: 'field 2', value: '' }],
                field3: [
                  {
                    id: 'f3',
                    type: 'text-field',
                    label: 'field 3',
                    value: '',
                  },
                ],
                field4: [
                  {
                    id: 'f1',
                    type: 'text-field',
                    label: 'field 4',
                    value: '',
                  },
                ],
              },
            },
          ],
        },
      };

      const def = structureToFlatStructureDefinition(model, [['entity1', ['field2', 'field4']]]);

      expect(def).toEqual([
        {
          key: ['entity1', 'field2'],
          fullLabel: 'entity 1 / field 2',
          label: 'field 2',
          type: 'text-field',
        },
        {
          key: ['entity1', 'field4'],
          fullLabel: 'entity 1 / field 4',
          label: 'field 4',
          type: 'text-field',
        },
      ]);

      expect(documentFieldOptionsToStructure(def)).toEqual([['entity1', ['field2', 'field4']]]);
    });
  });

  describe('expandModelFields', () => {
    test('expandModelFields', () => {
      expect(
        expandModelFields([
          ['field1', ['field1.1', 'field1.2', 'field1.3']],
          ['field2', ['field2.1', 'field2.2', 'field2.3']],
          'field3',
        ])
      ).toEqual([
        ['field1', 'field1.1'],
        ['field1', 'field1.2'],
        ['field1', 'field1.3'],
        ['field2', 'field2.1'],
        ['field2', 'field2.2'],
        ['field2', 'field2.3'],
        ['field3'],
      ]);
    });
  });
});
