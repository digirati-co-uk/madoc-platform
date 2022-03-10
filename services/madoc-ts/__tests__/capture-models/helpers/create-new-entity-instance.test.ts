jest.mock('.../../../src/frontend/shared/capture-models/helpers/generate-id', () => {
  return {
    __esModule: true,
    generateId() {
      return '[auto-generated]';
    },
  };
});

import { createNewEntityInstance } from '../../../src/frontend/shared/capture-models/helpers/create-new-entity-instance';
import { registerField } from '../../../src/frontend/shared/capture-models/plugin-api/global-store';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../../src/frontend/shared/capture-models/types/field-types';

registerField({
  type: 'JEST_CUSTOM_FIELD',
  defaultValue: '',
} as any);

describe('create-new-entity-instance', () => {
  test('Simple nuke value', () => {
    expect(
      createNewEntityInstance(
        {
          id: '1',
          type: 'entity',
          label: 'Some entity',
          properties: {
            test: [
              {
                id: 'entity-1',
                label: 'Some nested entity',
                type: 'entity',
                allowMultiple: true,
                properties: {
                  label: [
                    {
                      type: 'JEST_CUSTOM_FIELD',
                      label: 'Test field A',
                      value: 'Testing a value',
                      id: 'field-1',
                    } as BaseField,
                  ],
                },
              } as CaptureModel['document'],
            ],
          },
        },
        'test'
      )
    ).toMatchInlineSnapshot(`
      Object {
        "allowMultiple": true,
        "id": "[auto-generated]",
        "immutable": false,
        "label": "Some nested entity",
        "properties": Object {
          "label": Array [
            Object {
              "id": "[auto-generated]",
              "label": "Test field A",
              "type": "JEST_CUSTOM_FIELD",
              "value": "",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });
  test('2x2 entity', () => {
    expect(
      createNewEntityInstance(
        {
          id: '1',
          type: 'entity',
          label: 'Some entity',
          properties: {
            test: [
              {
                id: 'entity-1',
                label: 'Some nested entity',
                allowMultiple: true,
                type: 'entity',
                properties: {
                  label: [
                    {
                      type: 'JEST_CUSTOM_FIELD',
                      allowMultiple: true,
                      label: 'Test field A',
                      value: 'Testing a value',
                      id: 'field-1',
                    } as BaseField,
                    {
                      type: 'JEST_CUSTOM_FIELD',
                      allowMultiple: true,
                      label: 'NOT THIS ONE',
                      value: 'NOT THIS ONE',
                      id: 'field-2',
                    } as BaseField,
                  ],
                },
              } as CaptureModel['document'],
              {
                id: 'entity-2',
                label: 'NOT THIS ONE',
                type: 'entity',
                properties: {
                  label: [
                    {
                      type: 'JEST_CUSTOM_FIELD',
                      label: 'NOT THIS ONE',
                      value: 'NOT THIS ONE',
                      id: 'field-3',
                    } as BaseField,
                    {
                      type: 'JEST_CUSTOM_FIELD',
                      label: 'NOT THIS ONE',
                      value: 'NOT THIS ONE',
                      id: 'field-4',
                    } as BaseField,
                  ],
                },
              } as CaptureModel['document'],
            ],
          },
        },
        'test'
      )
    ).toMatchInlineSnapshot(`
      Object {
        "allowMultiple": true,
        "id": "[auto-generated]",
        "immutable": false,
        "label": "Some nested entity",
        "properties": Object {
          "label": Array [
            Object {
              "allowMultiple": true,
              "id": "[auto-generated]",
              "label": "Test field A",
              "type": "JEST_CUSTOM_FIELD",
              "value": "",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });
});
