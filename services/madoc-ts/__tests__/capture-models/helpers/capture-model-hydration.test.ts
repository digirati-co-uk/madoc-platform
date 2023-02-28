import { hydrateCaptureModel } from '../../../src/frontend/shared/capture-models/helpers/hydrate-capture-model';
import { v4 } from 'uuid';
import { hydrateCompressedModel } from '../../../src/frontend/shared/capture-models/helpers/hydrate-compressed-model';
import { captureModelShorthand } from '../../../src/frontend/shared/capture-models/helpers/capture-model-shorthand';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';

jest.mock('.../../../src/frontend/shared/capture-models/helpers/generate-id');
const { generateId } = require('../../../src/frontend/shared/capture-models/helpers/generate-id');
const GENERATED_ID = '[--------GENERATED-ID--------]';

generateId.mockImplementation(() => GENERATED_ID);

describe('capture model hydration', () => {
  const simpleModel: CaptureModel['document'] = {
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
      name: [
        {
          id: v4(),
          label: 'Name of person',
          type: 'text-field',
          value: '',
        },
      ],
    },
  };

  test('it can hydrate simple model', () => {
    expect(
      hydrateCaptureModel(simpleModel, {
        label: 'Testing',
      })
    ).toMatchInlineSnapshot(`
      {
        "id": "[--------GENERATED-ID--------]",
        "label": "My form",
        "properties": {
          "label": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "The label",
              "selector": undefined,
              "type": "text-field",
              "value": "Testing",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });

  test('it can hydrate while keeping blank fields', () => {
    expect(
      hydrateCaptureModel(
        simpleModel,
        {
          label: 'Testing',
        },

        { keepExtraFields: true }
      )
    ).toMatchInlineSnapshot(`
      {
        "id": "[--------GENERATED-ID--------]",
        "label": "My form",
        "properties": {
          "label": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "The label",
              "selector": undefined,
              "type": "text-field",
              "value": "Testing",
            },
          ],
          "name": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "Name of person",
              "type": "text-field",
              "value": "",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });

  test('it can hydrate model with multiple values', () => {
    expect(
      hydrateCaptureModel(simpleModel, {
        label: ['Testing A', 'Testing B'],
      })
    ).toMatchInlineSnapshot(`
      {
        "id": "[--------GENERATED-ID--------]",
        "label": "My form",
        "properties": {
          "label": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "The label",
              "selector": undefined,
              "type": "text-field",
              "value": "Testing A",
            },
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "The label",
              "selector": undefined,
              "type": "text-field",
              "value": "Testing B",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });

  test('it can hydrate model with multiple fields', () => {
    expect(
      hydrateCaptureModel(simpleModel, {
        label: ['Testing A', 'Testing B'],
        name: 'testing',
      })
    ).toMatchInlineSnapshot(`
      {
        "id": "[--------GENERATED-ID--------]",
        "label": "My form",
        "properties": {
          "label": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "The label",
              "selector": undefined,
              "type": "text-field",
              "value": "Testing A",
            },
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "The label",
              "selector": undefined,
              "type": "text-field",
              "value": "Testing B",
            },
          ],
          "name": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "Name of person",
              "selector": undefined,
              "type": "text-field",
              "value": "testing",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });

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
                value: '',
              },
            ],
            city: [
              {
                id: v4(),
                label: 'City',
                type: 'text-field',
                value: '',
              },
            ],
          },
        },
      ],
    },
  };

  test('it can hydrate a list of entities', () => {
    const doc = {
      label: 'Some label',
      people: [
        {
          name: 'Stephen',
          city: 'Glasgow',
        },
        {
          name: 'Bob',
          city: 'Edinburgh',
        },
      ],
    };

    expect(hydrateCaptureModel(complexModelWithEntity, doc)).toMatchInlineSnapshot(`
      {
        "id": "[--------GENERATED-ID--------]",
        "label": "My form",
        "properties": {
          "label": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "The label",
              "selector": undefined,
              "type": "text-field",
              "value": "Some label",
            },
          ],
          "people": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "Name of person",
              "properties": {
                "city": [
                  {
                    "id": "[--------GENERATED-ID--------]",
                    "label": "City",
                    "selector": undefined,
                    "type": "text-field",
                    "value": "Glasgow",
                  },
                ],
                "name": [
                  {
                    "id": "[--------GENERATED-ID--------]",
                    "label": "First name",
                    "selector": undefined,
                    "type": "text-field",
                    "value": "Stephen",
                  },
                ],
              },
              "type": "entity",
            },
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "Name of person",
              "properties": {
                "city": [
                  {
                    "id": "[--------GENERATED-ID--------]",
                    "label": "City",
                    "selector": undefined,
                    "type": "text-field",
                    "value": "Edinburgh",
                  },
                ],
                "name": [
                  {
                    "id": "[--------GENERATED-ID--------]",
                    "label": "First name",
                    "selector": undefined,
                    "type": "text-field",
                    "value": "Bob",
                  },
                ],
              },
              "type": "entity",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });

  test('short hand capture model', () => {
    expect(
      captureModelShorthand({
        label: 'text-field',
        name: 'text-field',
      })
    ).toMatchInlineSnapshot(`
      {
        "id": "[--------GENERATED-ID--------]",
        "label": "Root",
        "properties": {
          "label": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "label",
              "type": "text-field",
              "value": null,
            },
          ],
          "name": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "name",
              "type": "text-field",
              "value": null,
            },
          ],
        },
        "type": "entity",
      }
    `);
  });

  test('nested short hand capture model', () => {
    expect(
      captureModelShorthand({
        label: 'text-field',
        'person.name': 'text-field',
        'person.city': 'text-field',
        'person.relation.description': 'text-field',
        'person.relation.label': 'text-field',
      })
    ).toMatchInlineSnapshot(`
      {
        "id": "[--------GENERATED-ID--------]",
        "label": "Root",
        "properties": {
          "label": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "label",
              "type": "text-field",
              "value": null,
            },
          ],
          "person": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "person",
              "properties": {
                "city": [
                  {
                    "id": "[--------GENERATED-ID--------]",
                    "label": "city",
                    "type": "text-field",
                    "value": null,
                  },
                ],
                "name": [
                  {
                    "id": "[--------GENERATED-ID--------]",
                    "label": "name",
                    "type": "text-field",
                    "value": null,
                  },
                ],
                "relation": [
                  {
                    "id": "[--------GENERATED-ID--------]",
                    "label": "relation",
                    "properties": {
                      "description": [
                        {
                          "id": "[--------GENERATED-ID--------]",
                          "label": "description",
                          "type": "text-field",
                          "value": null,
                        },
                      ],
                      "label": [
                        {
                          "id": "[--------GENERATED-ID--------]",
                          "label": "label",
                          "type": "text-field",
                          "value": null,
                        },
                      ],
                    },
                    "type": "entity",
                  },
                ],
              },
              "type": "entity",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });

  test('nested short hand capture model with extra options', () => {
    expect(
      captureModelShorthand({
        label: 'text-field',
        'person.name': 'text-field',
        'person.city': {
          type: 'dropdown',
          options: [
            { value: 'aberdeen', text: 'Aberdeen' },
            { value: 'glasgow', text: 'Glasgow' },
          ],
        },
      })
    ).toMatchInlineSnapshot(`
      {
        "id": "[--------GENERATED-ID--------]",
        "label": "Root",
        "properties": {
          "label": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "label",
              "type": "text-field",
              "value": null,
            },
          ],
          "person": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "person",
              "properties": {
                "city": [
                  {
                    "id": "[--------GENERATED-ID--------]",
                    "label": "city",
                    "options": [
                      {
                        "text": "Aberdeen",
                        "value": "aberdeen",
                      },
                      {
                        "text": "Glasgow",
                        "value": "glasgow",
                      },
                    ],
                    "type": "dropdown",
                    "value": null,
                  },
                ],
                "name": [
                  {
                    "id": "[--------GENERATED-ID--------]",
                    "label": "name",
                    "type": "text-field",
                    "value": null,
                  },
                ],
              },
              "type": "entity",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });

  test('hydrating compressed model', () => {
    expect(
      hydrateCompressedModel({
        __meta__: {
          title: 'text-field',
        },
        title: 'testing a title',
      })
    ).toMatchInlineSnapshot(`
      {
        "id": "[--------GENERATED-ID--------]",
        "label": "Root",
        "properties": {
          "title": [
            {
              "id": "[--------GENERATED-ID--------]",
              "label": "title",
              "selector": undefined,
              "type": "text-field",
              "value": "testing a title",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });
});
