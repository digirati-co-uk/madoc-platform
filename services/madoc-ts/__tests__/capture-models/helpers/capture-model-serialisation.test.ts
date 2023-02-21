import { serialiseCaptureModel } from '../../../src/frontend/shared/capture-models/helpers/serialise-capture-model';
import { v4 } from 'uuid';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';

describe('capture model serialisation', () => {
  test('it can serialise simple models', () => {
    expect(
      serialiseCaptureModel({
        id: v4(),
        type: 'entity',
        label: 'My form',
        properties: {
          label: [
            {
              id: v4(),
              label: 'The label',
              type: 'text-field',
              value: 'Test label',
            },
          ],

          name: [
            {
              id: v4(),
              label: 'Name of person',
              type: 'text-field',
              value: 'Test name',
            },
          ],
        },
      })
    ).toMatchInlineSnapshot(`
      {
        "label": "Test label",
        "name": "Test name",
      }
    `);
  });

  test('it can serialise simple models with metadata', () => {
    expect(
      serialiseCaptureModel(
        {
          id: v4(),
          type: 'entity',
          label: 'My form',
          properties: {
            label: [
              {
                id: v4(),
                label: 'The label',
                type: 'text-field',
                value: 'Test label',
              },
            ],

            name: [
              {
                id: v4(),
                label: 'Name of person',
                type: 'text-field',
                value: 'Test name',
              },
            ],
          },
        },
        { addMetadata: true }
      )
    ).toMatchInlineSnapshot(`
      {
        "__meta__": {
          "label": "text-field",
          "name": "text-field",
        },
        "label": "Test label",
        "name": "Test name",
      }
    `);
  });

  test('it can serialise model with entity', () => {
    const complexModelWithEntity: CaptureModel['document'] = {
      id: v4(),
      type: 'entity',
      label: 'My form',
      properties: {
        label: [
          {
            id: v4(),
            label: 'The label',
            type: 'text-field',
            value: '',
          },
        ],
        people: [
          {
            id: v4(),
            label: 'Name of person',
            type: 'entity',
            properties: {
              name: [
                {
                  id: v4(),
                  label: 'First name',
                  type: 'text-field',
                  value: 'First persons name',
                },
              ],
              city: [
                {
                  id: v4(),
                  label: 'City',
                  type: 'text-field',
                  value: 'Aberdeen',
                },
              ],
            },
          },
          {
            id: v4(),
            label: 'Name of person',
            type: 'entity',
            properties: {
              name: [
                {
                  id: v4(),
                  label: 'First name',
                  type: 'text-field',
                  value: 'Second persons name',
                },
              ],
              city: [
                {
                  id: v4(),
                  label: 'City',
                  type: 'text-field',
                  value: 'Glasgow',
                },
              ],
            },
          },
        ],
      },
    };

    expect(serialiseCaptureModel(complexModelWithEntity, { addMetadata: true })).toMatchInlineSnapshot(`
      {
        "__meta__": {
          "label": "text-field",
          "people.city": "text-field",
          "people.name": "text-field",
        },
        "label": "",
        "people": [
          {
            "city": "Aberdeen",
            "name": "First persons name",
          },
          {
            "city": "Glasgow",
            "name": "Second persons name",
          },
        ],
      }
    `);
  });

  test('simple model with selector', () => {
    const complexModelWithEntity: CaptureModel['document'] = {
      id: v4(),
      type: 'entity',
      label: 'My form',
      properties: {
        label: [
          {
            id: v4(),
            label: 'The label',
            type: 'text-field',
            selector: {
              id: v4(),
              type: 'box-selector',
              state: {
                x: 10,
                y: 20,
                width: 130,
                height: 140,
              },
            },
            value: 'Some value of the label',
          },
        ],
      },
    };

    expect(serialiseCaptureModel(complexModelWithEntity, { addSelectors: false })).toMatchInlineSnapshot(`
      {
        "label": "Some value of the label",
      }
    `);

    expect(serialiseCaptureModel(complexModelWithEntity, { addSelectors: true })).toMatchInlineSnapshot(`
      {
        "label": {
          "selector": {
            "height": 140,
            "width": 130,
            "x": 10,
            "y": 20,
          },
          "value": "Some value of the label",
        },
      }
    `);

    expect(serialiseCaptureModel(complexModelWithEntity, { addSelectors: true, rdfValue: true }))
      .toMatchInlineSnapshot(`
      {
        "label": {
          "@value": "Some value of the label",
          "selector": {
            "height": 140,
            "width": 130,
            "x": 10,
            "y": 20,
          },
        },
      }
    `);
  });
  test('simple model with multiple selectors', () => {
    const complexModelWithEntity: CaptureModel['document'] = {
      id: v4(),
      type: 'entity',
      label: 'My form',
      properties: {
        label: [
          {
            id: v4(),
            label: 'The label',
            type: 'text-field',
            selector: {
              id: v4(),
              type: 'box-selector',
              state: {
                x: 10,
                y: 20,
                width: 130,
                height: 140,
              },
            },
            value: 'Some value of the label',
          },
          {
            id: v4(),
            label: 'The label',
            type: 'text-field',
            selector: {
              id: v4(),
              type: 'box-selector',
              state: {
                x: 20,
                y: 40,
                width: 160,
                height: 180,
              },
            },
            value: 'Second value',
          },
          {
            id: v4(),
            label: 'The label',
            type: 'text-field',
            selector: {
              id: v4(),
              type: 'box-selector',
              state: null,
            },
            value: 'Some value of the label',
          },
        ],
      },
    };

    expect(serialiseCaptureModel(complexModelWithEntity, { addSelectors: false })).toMatchInlineSnapshot(`
      {
        "label": [
          "Some value of the label",
          "Second value",
          "Some value of the label",
        ],
      }
    `);

    expect(serialiseCaptureModel(complexModelWithEntity, { addSelectors: true })).toMatchInlineSnapshot(`
      {
        "label": [
          {
            "selector": {
              "height": 140,
              "width": 130,
              "x": 10,
              "y": 20,
            },
            "value": "Some value of the label",
          },
          {
            "selector": {
              "height": 180,
              "width": 160,
              "x": 20,
              "y": 40,
            },
            "value": "Second value",
          },
          "Some value of the label",
        ],
      }
    `);

    expect(serialiseCaptureModel(complexModelWithEntity, { addSelectors: true, rdfValue: true }))
      .toMatchInlineSnapshot(`
      {
        "label": [
          {
            "@value": "Some value of the label",
            "selector": {
              "height": 140,
              "width": 130,
              "x": 10,
              "y": 20,
            },
          },
          {
            "@value": "Second value",
            "selector": {
              "height": 180,
              "width": 160,
              "x": 20,
              "y": 40,
            },
          },
          "Some value of the label",
        ],
      }
    `);
    expect(
      serialiseCaptureModel(complexModelWithEntity, { addSelectors: true, rdfValue: true, normalisedValueLists: true })
    ).toMatchInlineSnapshot(`
      {
        "label": [
          {
            "@value": "Some value of the label",
            "selector": {
              "height": 140,
              "width": 130,
              "x": 10,
              "y": 20,
            },
          },
          {
            "@value": "Second value",
            "selector": {
              "height": 180,
              "width": 160,
              "x": 20,
              "y": 40,
            },
          },
          {
            "@value": "Some value of the label",
          },
        ],
      }
    `);
  });

  test('simple model with entity selector', () => {
    const complexModelWithEntity: CaptureModel['document'] = {
      id: v4(),
      type: 'entity',
      label: 'My form',
      properties: {
        people: [
          {
            id: v4(),
            type: 'entity',
            label: 'Person',
            allowMultiple: true,
            selector: {
              id: v4(),
              type: 'box-selector',
              state: {
                x: 10,
                y: 20,
                width: 130,
                height: 140,
              },
            },
            properties: {
              name: [
                {
                  id: v4(),
                  label: 'Name',
                  type: 'text-field',
                  value: 'Some value of the label',
                },
              ],
            },
          },
        ],
        details: [
          {
            id: v4(),
            type: 'entity',
            label: 'Details',
            allowMultiple: false,
            selector: {
              id: v4(),
              type: 'box-selector',
              state: {
                x: 20,
                y: 40,
                width: 160,
                height: 180,
              },
            },
            properties: {
              label: [
                {
                  id: v4(),
                  label: 'Label',
                  type: 'text-field',
                  value: 'The label of an object',
                },
              ],
              description: [
                {
                  id: v4(),
                  label: 'Description',
                  type: 'text-field',
                  value: 'The description of an object',
                },
              ],
            },
          },
        ],
      },
    };

    expect(serialiseCaptureModel(complexModelWithEntity)).toMatchInlineSnapshot(`
      {
        "details": {
          "description": "The description of an object",
          "label": "The label of an object",
        },
        "people": [
          {
            "name": "Some value of the label",
          },
        ],
      }
    `);
    expect(serialiseCaptureModel(complexModelWithEntity, { addSelectors: true })).toMatchInlineSnapshot(`
      {
        "details": {
          "properties": {
            "description": "The description of an object",
            "label": "The label of an object",
          },
          "selector": {
            "height": 180,
            "width": 160,
            "x": 20,
            "y": 40,
          },
        },
        "people": [
          {
            "properties": {
              "name": "Some value of the label",
            },
            "selector": {
              "height": 140,
              "width": 130,
              "x": 10,
              "y": 20,
            },
          },
        ],
      }
    `);
  });
});
