jest.mock('.../../../src/frontend/shared/capture-models/helpers/generate-id', () => {
  return {
    __esModule: true,
    generateId() {
      return '[auto-generated]';
    },
  };
});

import { createNewFieldInstance } from '../../../src/frontend/shared/capture-models/helpers/create-new-field-instance';
import { registerField } from '../../../src/frontend/shared/capture-models/plugin-api/global-store';
import { BaseField } from '../../../src/frontend/shared/capture-models/types/field-types';

registerField({
  type: 'JEST_CUSTOM_FIELD',
  defaultValue: '',
} as any);

describe('create-new-field-instance', () => {
  test('Simple nuke value', () => {
    expect(
      createNewFieldInstance(
        {
          id: '1',
          type: 'entity',
          label: 'Some entity',
          properties: {
            test: [
              {
                type: 'JEST_CUSTOM_FIELD',
                label: 'Test field A',
                allowMultiple: true,
                value: 'Testing a value',
                id: '1',
              } as BaseField,
            ],
          },
        },
        'test'
      )
    ).toMatchInlineSnapshot(`
      Object {
        "allowMultiple": true,
        "id": "[auto-generated]",
        "label": "Test field A",
        "type": "JEST_CUSTOM_FIELD",
        "value": "",
      }
    `);
  });
  test('Should only fork first value', () => {
    expect(
      createNewFieldInstance(
        {
          id: '1',
          type: 'entity',
          label: 'Some entity',
          properties: {
            test: [
              {
                type: 'JEST_CUSTOM_FIELD',
                label: 'Test field A',
                allowMultiple: true,
                value: 'Testing a value',
                id: '1',
              } as BaseField,
              { type: 'INVALID', label: 'IGNORED', allowMultiple: true, value: 'IGNORED', id: '2' } as BaseField,
            ],
          },
        },
        'test'
      )
    ).toMatchInlineSnapshot(`
      Object {
        "allowMultiple": true,
        "id": "[auto-generated]",
        "label": "Test field A",
        "type": "JEST_CUSTOM_FIELD",
        "value": "",
      }
    `);
  });

  test('Should change ID of selector', () => {
    expect(
      createNewFieldInstance(
        {
          id: '1',
          type: 'entity',
          label: 'Some entity',
          properties: {
            test: [
              {
                type: 'JEST_CUSTOM_FIELD',
                label: 'Test field A',
                value: 'Testing a value',
                allowMultiple: true,
                id: '1',
                selector: { id: 'selector-1', type: 'box-selector', state: null },
              } as BaseField,
            ],
          },
        },
        'test'
      )
    ).toMatchInlineSnapshot(`
      Object {
        "allowMultiple": true,
        "id": "[auto-generated]",
        "label": "Test field A",
        "selector": Object {
          "id": "[auto-generated]",
          "state": null,
          "type": "box-selector",
        },
        "type": "JEST_CUSTOM_FIELD",
        "value": "",
      }
    `);
  });

  test('Should reset value of selector', () => {
    expect(
      createNewFieldInstance(
        {
          id: '1',
          type: 'entity',
          label: 'Some entity',
          properties: {
            test: [
              {
                type: 'JEST_CUSTOM_FIELD',
                label: 'Test field A',
                value: 'Testing a value',
                allowMultiple: true,
                id: '1',
                selector: { id: 'selector-1', type: 'box-selector', state: { x: 0, y: 0, width: 100, height: 100 } },
              } as BaseField,
            ],
          },
        },
        'test'
      )
    ).toMatchInlineSnapshot(`
      Object {
        "allowMultiple": true,
        "id": "[auto-generated]",
        "label": "Test field A",
        "selector": Object {
          "id": "[auto-generated]",
          "state": null,
          "type": "box-selector",
        },
        "type": "JEST_CUSTOM_FIELD",
        "value": "",
      }
    `);
  });
});
