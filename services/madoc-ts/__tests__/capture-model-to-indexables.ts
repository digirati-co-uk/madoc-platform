import { generateId, hydrateCompressedModel } from '@capture-models/helpers';
import { CaptureModel } from '@capture-models/types';
import { captureModelToIndexables } from '../src/utility/capture-model-to-indexables';

describe('Capture model to indexables', () => {
  // Single field
  test('from single field', () => {
    const document = hydrateCompressedModel({
      __meta__: {
        label: 'text-field',
      },
      label: 'Some label',
    });

    const indexables = captureModelToIndexables('urn:madoc:canvas:1', document);

    expect(indexables[0]).toMatchInlineSnapshot(
      {
        content_id: expect.any(String),
      },
      `
      Object {
        "content_id": Any<String>,
        "indexable": "Some label",
        "indexable_date": null,
        "indexable_float": null,
        "indexable_int": null,
        "indexable_json": null,
        "language_display": "english",
        "language_iso639_1": "en",
        "language_iso639_2": "eng",
        "language_pg": "english",
        "original_content": "Some label",
        "resource_id": "urn:madoc:canvas:1",
        "selector": null,
        "subtype": "label",
        "type": "capture-model",
      }
    `
    );
  });

  // Multiple fields
  test('from multiple fields', () => {
    const document = hydrateCompressedModel({
      __meta__: {
        label: 'text-field',
        description: 'text-field',
      },
      label: 'Some label',
      description: ['some description', 'multiple values'],
    });

    const indexables = captureModelToIndexables('urn:madoc:canvas:1', document);

    expect(indexables[0]).toMatchInlineSnapshot(
      { content_id: expect.any(String) },
      `
      Object {
        "content_id": Any<String>,
        "indexable": "Some label",
        "indexable_date": null,
        "indexable_float": null,
        "indexable_int": null,
        "indexable_json": null,
        "language_display": "english",
        "language_iso639_1": "en",
        "language_iso639_2": "eng",
        "language_pg": "english",
        "original_content": "Some label",
        "resource_id": "urn:madoc:canvas:1",
        "selector": null,
        "subtype": "label",
        "type": "capture-model",
      }
    `
    );
    expect(indexables[1]).toMatchInlineSnapshot(
      { content_id: expect.any(String) },
      `
      Object {
        "content_id": Any<String>,
        "indexable": "some description",
        "indexable_date": null,
        "indexable_float": null,
        "indexable_int": null,
        "indexable_json": null,
        "language_display": "english",
        "language_iso639_1": "en",
        "language_iso639_2": "eng",
        "language_pg": "english",
        "original_content": "some description",
        "resource_id": "urn:madoc:canvas:1",
        "selector": null,
        "subtype": "description",
        "type": "capture-model",
      }
    `
    );
  });

  // Revised field
  test('from field that revised another', () => {
    const originalId = generateId();
    const newId = generateId();
    const document: CaptureModel['document'] = {
      id: generateId(),
      type: 'entity',
      label: 'Root',
      properties: {
        label: [
          {
            id: originalId,
            label: 'Label',
            type: 'text-field',
            value: 'ORIGINAL VALUE',
          },
          {
            id: newId,
            label: 'Label',
            type: 'text-field',
            value: 'NEW VALUE',
            revises: originalId,
          },
        ],

        // This one flips the order to make sure it's not dependent on that.
        description: [
          {
            id: newId,
            label: 'Description',
            type: 'text-field',
            value: 'NEW VALUE 2',
            revises: originalId,
          },
          {
            id: originalId,
            label: 'Description',
            type: 'text-field',
            value: 'ORIGINAL VALUE 2',
          },
        ],
      },
    };

    const indexables = captureModelToIndexables('urn:madoc:canvas:1', document);

    expect(indexables).toHaveLength(2);

    expect(indexables[0].indexable).toEqual('NEW VALUE');
    expect(indexables[1].indexable).toEqual('NEW VALUE 2');
  });

  test('from nested entity', () => {
    const document = hydrateCompressedModel({
      __meta__: {
        'person.label': 'text-field',
        'person.description': 'text-field',
        'people.label': 'text-field',
        'people.description': 'text-field',
      },
      person: {
        label: 'Person label 1',
        description: 'Person description 1',
      },
      people: [
        {
          label: 'People label 1',
          description: 'People description 1',
        },
        {
          label: 'People label 2',
          description: 'People description 2',
        },
      ],
    });

    const indexables = captureModelToIndexables('urn:madoc:canvas:1', document);

    expect(indexables).toHaveLength(6);

    expect(indexables[0].indexable).toEqual('Person label 1');
    expect(indexables[0].type).toEqual('person');
    expect(indexables[0].subtype).toEqual('label');

    expect(indexables[1].indexable).toEqual('Person description 1');
    expect(indexables[1].type).toEqual('person');
    expect(indexables[1].subtype).toEqual('description');

    expect(indexables[2].indexable).toEqual('People label 1');
    expect(indexables[2].type).toEqual('people');
    expect(indexables[2].subtype).toEqual('label');

    expect(indexables[3].indexable).toEqual('People description 1');
    expect(indexables[3].type).toEqual('people');
    expect(indexables[3].subtype).toEqual('description');

    expect(indexables[4].indexable).toEqual('People label 2');
    expect(indexables[4].type).toEqual('people');
    expect(indexables[4].subtype).toEqual('label');

    expect(indexables[5].indexable).toEqual('People description 2');
    expect(indexables[5].type).toEqual('people');
    expect(indexables[5].subtype).toEqual('description');
  });

  test('from a deeply nested item', () => {
    const document = hydrateCompressedModel({
      __meta__: {
        'level-1.level-2.level-3.label': 'text-field',
        'level-1.level-2.level-3.description': 'text-field',
      },
      'level-1': {
        'level-2': {
          'level-3': {
            label: 'Label A',
            description: 'Description A',
          },
        },
      },
    });

    const indexables = captureModelToIndexables('urn:madoc:canvas:1', document);

    expect(indexables).toHaveLength(2);

    expect(indexables[0].indexable).toEqual('Label A');
    expect(indexables[0].type).toEqual('level-3');
    expect(indexables[0].subtype).toEqual('label');

    expect(indexables[1].indexable).toEqual('Description A');
    expect(indexables[1].type).toEqual('level-3');
    expect(indexables[1].subtype).toEqual('description');
  });

  test('from field with selector', () => {
    // @todo update to shorthand when it supports shorthand selectors.
    const document: CaptureModel['document'] = {
      id: generateId(),
      type: 'entity',
      label: 'Root',
      properties: {
        label: [
          {
            id: generateId(),
            label: 'Label',
            selector: {
              id: generateId(),
              type: 'box-selector',
              state: {
                x: 1,
                y: 2,
                width: 100,
                height: 200,
              },
            },
            type: 'text-field',
            value: 'ORIGINAL VALUE',
          },
        ],
      },
    };

    const indexables = captureModelToIndexables('urn:madoc:canvas:1', document);
    expect(indexables[0]).toMatchInlineSnapshot(
      { content_id: expect.any(String) },
      `
      Object {
        "content_id": Any<String>,
        "indexable": "ORIGINAL VALUE",
        "indexable_date": null,
        "indexable_float": null,
        "indexable_int": null,
        "indexable_json": null,
        "language_display": "english",
        "language_iso639_1": "en",
        "language_iso639_2": "eng",
        "language_pg": "english",
        "original_content": "ORIGINAL VALUE",
        "resource_id": "urn:madoc:canvas:1",
        "selector": Object {
          "box-selector": Array [
            Array [
              1,
              2,
              100,
              200,
            ],
          ],
        },
        "subtype": "label",
        "type": "capture-model",
      }
    `
    );
  });
});
