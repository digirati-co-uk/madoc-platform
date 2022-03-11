/**
 * @jest-environment node
 */

import { hydrateRevisionStore } from '../../../../src/frontend/shared/capture-models/editor/stores/revisions/revisions-store';
import { registerField } from '../../../../src/frontend/shared/capture-models/plugin-api/global-store';

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

describe('1. Nuking selector bug', () => {
  test('it should not revise the selector', () => {
    const state = {
      revisions: {
        '9c2c6558-703d-4276-ac44-01c78e66ecef': {
          captureModelId: 'fb97bec1-5ff4-4413-bdb2-96fff1b70ae3',
          revision: {
            id: '9c2c6558-703d-4276-ac44-01c78e66ecef',
            fields: ['regionOfInterest'],
            approved: true,
            structureId: '9c2c6558-703d-4276-ac44-01c78e66ecef',
            label: 'Default',
          },
          source: 'canonical',
          document: {
            id: '7d313298-e8d7-4ecf-a459-b6e9768013e3',
            type: 'entity',
            label: 'Untitled document',
            properties: {
              regionOfInterest: [
                {
                  id: 'e2ab2dd6-a80d-41ea-b289-38966eb092f5',
                  type: 'text-field',
                  label: 'regionOfInterest test test',
                  value: '',
                  description: 'test',
                  selector: {
                    id: '4d60c63c-d3e3-40e7-9243-a0b98a6daba6',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
            },
          },
        },
        '5b21c821-0600-4530-80bf-43fbe09e4469': {
          captureModelId: 'fb97bec1-5ff4-4413-bdb2-96fff1b70ae3',
          revision: {
            structureId: '9c2c6558-703d-4276-ac44-01c78e66ecef',
            approved: false,
            label: 'Default',
            id: '5b21c821-0600-4530-80bf-43fbe09e4469',
            fields: ['regionOfInterest'],
            status: 'draft',
            revises: '9c2c6558-703d-4276-ac44-01c78e66ecef',
            authors: ['urn:madoc:user:1'],
            deletedFields: null,
          },
          document: {
            id: '7d313298-e8d7-4ecf-a459-b6e9768013e3',
            type: 'entity',
            label: 'Untitled document',
            properties: {
              regionOfInterest: [
                {
                  id: '05127e2f-4b7e-4dfe-8061-8ca6914b02ae',
                  type: 'text-field',
                  label: 'regionOfInterest test test',
                  value: 'test again',
                  revises: 'e2ab2dd6-a80d-41ea-b289-38966eb092f5',
                  description: 'test',
                  selector: {
                    id: 'bd8599f7-98f1-48ef-b926-61b53a7a9711',
                    type: 'box-selector',
                    state: null,
                  },
                  revision: '5b21c821-0600-4530-80bf-43fbe09e4469',
                },
              ],
            },
          },
          source: 'structure',
        },
      },
      revisionEditMode: true,
      currentRevisionId: '5b21c821-0600-4530-80bf-43fbe09e4469',
      currentRevision: {
        captureModelId: 'fb97bec1-5ff4-4413-bdb2-96fff1b70ae3',
        revision: {
          structureId: '9c2c6558-703d-4276-ac44-01c78e66ecef',
          approved: false,
          label: 'Default',
          id: '5b21c821-0600-4530-80bf-43fbe09e4469',
          fields: ['regionOfInterest'],
          status: 'draft',
          revises: '9c2c6558-703d-4276-ac44-01c78e66ecef',
          authors: ['urn:madoc:user:1'],
          deletedFields: null,
        },
        document: {
          id: '7d313298-e8d7-4ecf-a459-b6e9768013e3',
          type: 'entity',
          label: 'Untitled document',
          properties: {
            regionOfInterest: [
              {
                id: '05127e2f-4b7e-4dfe-8061-8ca6914b02ae',
                type: 'text-field',
                label: 'regionOfInterest test test',
                value: 'test again',
                revises: 'e2ab2dd6-a80d-41ea-b289-38966eb092f5',
                description: 'test',
                selector: {
                  id: 'bd8599f7-98f1-48ef-b926-61b53a7a9711',
                  type: 'box-selector',
                  state: null,
                },
                revision: '5b21c821-0600-4530-80bf-43fbe09e4469',
              },
            ],
          },
        },
        source: 'structure',
      },
      unsavedRevisionIds: [],
      currentRevisionReadMode: false,
      revisionSubtreePath: [],
      revisionSelectedFieldProperty: null,
      revisionSelectedFieldInstance: null,
      revisionSubtree: {
        id: '7d313298-e8d7-4ecf-a459-b6e9768013e3',
        type: 'entity',
        label: 'Untitled document',
        properties: {
          regionOfInterest: [
            {
              id: '05127e2f-4b7e-4dfe-8061-8ca6914b02ae',
              type: 'text-field',
              label: 'regionOfInterest test test',
              value: 'test again',
              revises: 'e2ab2dd6-a80d-41ea-b289-38966eb092f5',
              description: 'test',
              selector: {
                id: 'bd8599f7-98f1-48ef-b926-61b53a7a9711',
                type: 'box-selector',
                state: null,
              },
              revision: '5b21c821-0600-4530-80bf-43fbe09e4469',
            },
          ],
        },
      },
      revisionSubtreeFieldKeys: ['regionOfInterest'],
      revisionSubtreeFields: [
        {
          term: 'regionOfInterest',
          value: [
            {
              id: '05127e2f-4b7e-4dfe-8061-8ca6914b02ae',
              type: 'text-field',
              label: 'regionOfInterest test test',
              value: 'test again',
              revises: 'e2ab2dd6-a80d-41ea-b289-38966eb092f5',
              description: 'test',
              selector: {
                id: 'bd8599f7-98f1-48ef-b926-61b53a7a9711',
                type: 'box-selector',
                state: null,
              },
              revision: '5b21c821-0600-4530-80bf-43fbe09e4469',
            },
          ],
        },
      ],
      structure: {
        id: '16e4789c-6866-4271-bdfd-ee5220e9ffeb',
        type: 'choice',
        description: 'test',
        label: 'First project',
        items: [
          {
            id: '9c2c6558-703d-4276-ac44-01c78e66ecef',
            type: 'model',
            description: 'test test',
            label: 'Default',
            fields: ['regionOfInterest'],
            instructions: 'test test test test',
          },
        ],
      },
      idStack: ['9c2c6558-703d-4276-ac44-01c78e66ecef'],
      isThankYou: false,
      isPreviewing: false,
      structureMap: {
        '9c2c6558-703d-4276-ac44-01c78e66ecef': {
          id: '9c2c6558-703d-4276-ac44-01c78e66ecef',
          structure: {
            id: '9c2c6558-703d-4276-ac44-01c78e66ecef',
            type: 'model',
            description: 'test test',
            label: 'Default',
            fields: ['regionOfInterest'],
            instructions: 'test test test test',
          },
          path: [
            '16e4789c-6866-4271-bdfd-ee5220e9ffeb',
            '16e4789c-6866-4271-bdfd-ee5220e9ffeb',
            '9c2c6558-703d-4276-ac44-01c78e66ecef',
          ],
        },
        '16e4789c-6866-4271-bdfd-ee5220e9ffeb': {
          id: '16e4789c-6866-4271-bdfd-ee5220e9ffeb',
          structure: {
            id: '16e4789c-6866-4271-bdfd-ee5220e9ffeb',
            type: 'choice',
            description: 'test',
            label: 'First project',
            items: [
              {
                id: '9c2c6558-703d-4276-ac44-01c78e66ecef',
                type: 'model',
                description: 'test test',
                label: 'Default',
                fields: ['regionOfInterest'],
                instructions: 'test test test test',
              },
            ],
          },
          path: ['16e4789c-6866-4271-bdfd-ee5220e9ffeb'],
        },
      },
      currentStructureId: '9c2c6558-703d-4276-ac44-01c78e66ecef',
      currentStructure: {
        id: '9c2c6558-703d-4276-ac44-01c78e66ecef',
        type: 'model',
        description: 'test test',
        label: 'Default',
        fields: ['regionOfInterest'],
        instructions: 'test test test test',
      },
      choiceStack: [
        {
          id: '9c2c6558-703d-4276-ac44-01c78e66ecef',
          structure: {
            id: '9c2c6558-703d-4276-ac44-01c78e66ecef',
            type: 'model',
            description: 'test test',
            label: 'Default',
            fields: ['regionOfInterest'],
            instructions: 'test test test test',
          },
          path: [
            '16e4789c-6866-4271-bdfd-ee5220e9ffeb',
            '16e4789c-6866-4271-bdfd-ee5220e9ffeb',
            '9c2c6558-703d-4276-ac44-01c78e66ecef',
          ],
        },
      ],
      selector: {
        availableSelectors: [
          {
            id: 'bd8599f7-98f1-48ef-b926-61b53a7a9711',
            type: 'box-selector',
            state: null,
          },
        ],
        currentSelectorId: 'bd8599f7-98f1-48ef-b926-61b53a7a9711',
        selectorPreviewData: {},
        currentSelectorState: null,
        topLevelSelector: null,
        visibleSelectorIds: [],
        selectorPaths: {
          'bd8599f7-98f1-48ef-b926-61b53a7a9711': [['regionOfInterest', '05127e2f-4b7e-4dfe-8061-8ca6914b02ae']],
        },
      },
      visibleCurrentLevelSelectorIds: ['bd8599f7-98f1-48ef-b926-61b53a7a9711'],
      revisionAdjacentSubtreeFields: {
        fields: [],
      },
      visibleAdjacentSelectorIds: [],
      resolvedSelectors: [
        {
          id: 'bd8599f7-98f1-48ef-b926-61b53a7a9711',
          type: 'box-selector',
          state: null,
        },
      ],
      visibleCurrentLevelSelectors: [
        {
          id: 'bd8599f7-98f1-48ef-b926-61b53a7a9711',
          type: 'box-selector',
          state: null,
        },
      ],
      visibleAdjacentSelectors: [],
    };

    const store = hydrateRevisionStore(state);

    const actions = store.getActions();

    actions.updateSelector({
      selectorId: 'bd8599f7-98f1-48ef-b926-61b53a7a9711',
      state: {
        x: 1826,
        y: 307,
        width: 431,
        height: 272,
      },
    });

    const newState: any = store.getState();

    expect(newState.currentRevision.document.properties.regionOfInterest[0].selector.revisedBy).not.toBeDefined();
  });

  test('it should update the selector', () => {
    const state = {
      revisions: {
        '501dbece-137d-4180-9bbd-c3ae022ad10b': {
          captureModelId: '25024a58-8816-49e6-83de-dc4004325f45',
          revision: {
            id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
            approved: true,
            structureId: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            label: 'Default',
          },
          source: 'canonical',
          document: {
            id: 'feded624-8a56-4398-91ca-44adc7392c65',
            type: 'entity',
            label: 'Project with selectors',
            properties: {
              'entity-single': [
                {
                  id: '9e475583-8fbc-48f6-ae08-250779822fce',
                  type: 'entity',
                  label: 'entity',
                  labelledBy: 'test',
                  properties: {
                    test: [
                      {
                        id: 'ca7e58cf-a552-4ac5-abc3-3cc7934dbb66',
                        type: 'text-field',
                        label: 'Test',
                        value: '',
                      },
                    ],
                  },
                  selector: {
                    id: '80e91e80-3b5d-42b5-94ab-d1f51bf47142',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'entity-multiple': [
                {
                  id: '06726886-6244-4dc8-89b5-0eaf29e5c089',
                  type: 'entity',
                  label: 'Entity multiple',
                  allowMultiple: true,
                  properties: {
                    name: [
                      {
                        id: 'ba3e1cf6-6f65-4fd3-8cf3-80ec88453987',
                        type: 'text-field',
                        label: 'name',
                        value: '',
                      },
                    ],
                  },
                  selector: {
                    id: '88e7437b-925a-460c-9674-ef980bff2051',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'field-multiple': [
                {
                  id: '976510eb-e05b-4296-b164-44c42c2011fa',
                  type: 'text-field',
                  label: 'Field multiple',
                  value: '',
                  allowMultiple: true,
                  selector: {
                    id: '281db7c8-41fa-4553-9cac-2fa8246263bb',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'field-single': [
                {
                  id: '39a18d5a-728e-422f-ad04-e80c3a280fae',
                  type: 'text-field',
                  label: 'Field',
                  value: '',
                  selector: {
                    id: 'e4399ba6-9adf-4cbd-bce5-80dd26ab094e',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
            },
          },
        },
        'a85e9b77-1e29-49b0-b229-b1a771e75482': {
          captureModelId: '25024a58-8816-49e6-83de-dc4004325f45',
          revision: {
            structureId: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            approved: false,
            label: 'Default',
            id: 'a85e9b77-1e29-49b0-b229-b1a771e75482',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
            status: 'draft',
            revises: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            authors: ['urn:madoc:user:3'],
            deletedFields: null,
          },
          document: {
            id: 'feded624-8a56-4398-91ca-44adc7392c65',
            type: 'entity',
            label: 'Project with selectors',
            properties: {
              'entity-single': [
                {
                  id: '9e475583-8fbc-48f6-ae08-250779822fce',
                  type: 'entity',
                  label: 'entity',
                  labelledBy: 'test',
                  properties: {
                    test: [
                      {
                        id: 'ca7e58cf-a552-4ac5-abc3-3cc7934dbb66',
                        type: 'text-field',
                        label: 'Test',
                        value: '',
                      },
                    ],
                  },
                  selector: {
                    id: '80e91e80-3b5d-42b5-94ab-d1f51bf47142',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'entity-multiple': [
                {
                  id: '06726886-6244-4dc8-89b5-0eaf29e5c089',
                  type: 'entity',
                  label: 'Entity multiple',
                  allowMultiple: true,
                  properties: {
                    name: [
                      {
                        id: 'ba3e1cf6-6f65-4fd3-8cf3-80ec88453987',
                        type: 'text-field',
                        label: 'name',
                        value: '',
                      },
                    ],
                  },
                  selector: {
                    id: '88e7437b-925a-460c-9674-ef980bff2051',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'field-multiple': [
                {
                  id: '976510eb-e05b-4296-b164-44c42c2011fa',
                  type: 'text-field',
                  label: 'Field multiple',
                  value: '',
                  allowMultiple: true,
                  selector: {
                    id: '281db7c8-41fa-4553-9cac-2fa8246263bb',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'field-single': [
                {
                  id: '94a7ee49-62a3-4fa6-86e5-09e52089ba8c',
                  type: 'text-field',
                  label: 'Field',
                  value: 'An example value with selector',
                  revises: '39a18d5a-728e-422f-ad04-e80c3a280fae',
                  selector: {
                    id: 'ed97dd6f-fdcf-427d-b501-068793ba6c44',
                    type: 'box-selector',
                    state: null,
                  },
                  revision: 'a85e9b77-1e29-49b0-b229-b1a771e75482',
                },
              ],
            },
          },
          source: 'structure',
        },
        'dfff8c9e-28d1-4e39-bd5c-353621e50a81': {
          captureModelId: '25024a58-8816-49e6-83de-dc4004325f45',
          revision: {
            id: 'dfff8c9e-28d1-4e39-bd5c-353621e50a81',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
            approved: false,
            structureId: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            label: 'Default',
            revises: '501dbece-137d-4180-9bbd-c3ae022ad10b',
          },
          document: {
            id: 'feded624-8a56-4398-91ca-44adc7392c65',
            type: 'entity',
            label: 'Project with selectors',
            properties: {
              'entity-single': [
                {
                  id: '9e475583-8fbc-48f6-ae08-250779822fce',
                  type: 'entity',
                  label: 'entity',
                  labelledBy: 'test',
                  properties: {
                    test: [
                      {
                        id: 'ca7e58cf-a552-4ac5-abc3-3cc7934dbb66',
                        type: 'text-field',
                        label: 'Test',
                        value: '',
                      },
                    ],
                  },
                  selector: {
                    id: '80e91e80-3b5d-42b5-94ab-d1f51bf47142',
                    type: 'box-selector',
                    state: null,
                  },
                  immutable: true,
                },
              ],
              'entity-multiple': [
                {
                  id: '06726886-6244-4dc8-89b5-0eaf29e5c089',
                  type: 'entity',
                  label: 'Entity multiple',
                  allowMultiple: true,
                  properties: {
                    name: [
                      {
                        id: 'ba3e1cf6-6f65-4fd3-8cf3-80ec88453987',
                        type: 'text-field',
                        label: 'name',
                        value: '',
                      },
                    ],
                  },
                  selector: {
                    id: '88e7437b-925a-460c-9674-ef980bff2051',
                    type: 'box-selector',
                    state: null,
                  },
                  immutable: true,
                },
              ],
              'field-multiple': [
                {
                  id: '976510eb-e05b-4296-b164-44c42c2011fa',
                  type: 'text-field',
                  label: 'Field multiple',
                  value: '',
                  allowMultiple: true,
                  selector: {
                    id: '281db7c8-41fa-4553-9cac-2fa8246263bb',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'field-single': [
                {
                  id: '57ad1c35-8495-4716-b70a-fa6a18534e92',
                  type: 'text-field',
                  label: 'Field',
                  value: 'test',
                  selector: {
                    id: '170081c2-1d55-40ec-b698-55476877806c',
                    type: 'box-selector',
                    state: null,
                  },
                  revision: 'dfff8c9e-28d1-4e39-bd5c-353621e50a81',
                  revises: '39a18d5a-728e-422f-ad04-e80c3a280fae',
                },
              ],
            },
            immutable: true,
          },
          source: 'structure',
        },
      },
      revisionEditMode: true,
      currentRevisionId: 'dfff8c9e-28d1-4e39-bd5c-353621e50a81',
      currentRevision: {
        captureModelId: '25024a58-8816-49e6-83de-dc4004325f45',
        revision: {
          id: 'dfff8c9e-28d1-4e39-bd5c-353621e50a81',
          fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
          approved: false,
          structureId: '501dbece-137d-4180-9bbd-c3ae022ad10b',
          label: 'Default',
          revises: '501dbece-137d-4180-9bbd-c3ae022ad10b',
        },
        document: {
          id: 'feded624-8a56-4398-91ca-44adc7392c65',
          type: 'entity',
          label: 'Project with selectors',
          properties: {
            'entity-single': [
              {
                id: '9e475583-8fbc-48f6-ae08-250779822fce',
                type: 'entity',
                label: 'entity',
                labelledBy: 'test',
                properties: {
                  test: [
                    {
                      id: 'ca7e58cf-a552-4ac5-abc3-3cc7934dbb66',
                      type: 'text-field',
                      label: 'Test',
                      value: '',
                    },
                  ],
                },
                selector: {
                  id: '80e91e80-3b5d-42b5-94ab-d1f51bf47142',
                  type: 'box-selector',
                  state: null,
                },
                immutable: true,
              },
            ],
            'entity-multiple': [
              {
                id: '06726886-6244-4dc8-89b5-0eaf29e5c089',
                type: 'entity',
                label: 'Entity multiple',
                allowMultiple: true,
                properties: {
                  name: [
                    {
                      id: 'ba3e1cf6-6f65-4fd3-8cf3-80ec88453987',
                      type: 'text-field',
                      label: 'name',
                      value: '',
                    },
                  ],
                },
                selector: {
                  id: '88e7437b-925a-460c-9674-ef980bff2051',
                  type: 'box-selector',
                  state: null,
                },
                immutable: true,
              },
            ],
            'field-multiple': [
              {
                id: '976510eb-e05b-4296-b164-44c42c2011fa',
                type: 'text-field',
                label: 'Field multiple',
                value: '',
                allowMultiple: true,
                selector: {
                  id: '281db7c8-41fa-4553-9cac-2fa8246263bb',
                  type: 'box-selector',
                  state: null,
                },
              },
            ],
            'field-single': [
              {
                id: '57ad1c35-8495-4716-b70a-fa6a18534e92',
                type: 'text-field',
                label: 'Field',
                value: 'test',
                selector: {
                  id: '170081c2-1d55-40ec-b698-55476877806c',
                  type: 'box-selector',
                  state: null,
                },
                revision: 'dfff8c9e-28d1-4e39-bd5c-353621e50a81',
                revises: '39a18d5a-728e-422f-ad04-e80c3a280fae',
              },
            ],
          },
          immutable: true,
        },
        source: 'structure',
      },
      unsavedRevisionIds: ['dfff8c9e-28d1-4e39-bd5c-353621e50a81'],
      currentRevisionReadMode: false,
      revisionSubtreePath: [],
      revisionSelectedFieldProperty: null,
      revisionSelectedFieldInstance: null,
      revisionSubtree: {
        id: 'feded624-8a56-4398-91ca-44adc7392c65',
        type: 'entity',
        label: 'Project with selectors',
        properties: {
          'entity-single': [
            {
              id: '9e475583-8fbc-48f6-ae08-250779822fce',
              type: 'entity',
              label: 'entity',
              labelledBy: 'test',
              properties: {
                test: [
                  {
                    id: 'ca7e58cf-a552-4ac5-abc3-3cc7934dbb66',
                    type: 'text-field',
                    label: 'Test',
                    value: '',
                  },
                ],
              },
              selector: {
                id: '80e91e80-3b5d-42b5-94ab-d1f51bf47142',
                type: 'box-selector',
                state: null,
              },
              immutable: true,
            },
          ],
          'entity-multiple': [
            {
              id: '06726886-6244-4dc8-89b5-0eaf29e5c089',
              type: 'entity',
              label: 'Entity multiple',
              allowMultiple: true,
              properties: {
                name: [
                  {
                    id: 'ba3e1cf6-6f65-4fd3-8cf3-80ec88453987',
                    type: 'text-field',
                    label: 'name',
                    value: '',
                  },
                ],
              },
              selector: {
                id: '88e7437b-925a-460c-9674-ef980bff2051',
                type: 'box-selector',
                state: null,
              },
              immutable: true,
            },
          ],
          'field-multiple': [
            {
              id: '976510eb-e05b-4296-b164-44c42c2011fa',
              type: 'text-field',
              label: 'Field multiple',
              value: '',
              allowMultiple: true,
              selector: {
                id: '281db7c8-41fa-4553-9cac-2fa8246263bb',
                type: 'box-selector',
                state: null,
              },
            },
          ],
          'field-single': [
            {
              id: '57ad1c35-8495-4716-b70a-fa6a18534e92',
              type: 'text-field',
              label: 'Field',
              value: 'test',
              selector: {
                id: '170081c2-1d55-40ec-b698-55476877806c',
                type: 'box-selector',
                state: null,
              },
              revision: 'dfff8c9e-28d1-4e39-bd5c-353621e50a81',
              revises: '39a18d5a-728e-422f-ad04-e80c3a280fae',
            },
          ],
        },
        immutable: true,
      },
      revisionSubtreeFieldKeys: ['entity-single', 'entity-multiple', 'field-multiple', 'field-single'],
      revisionSubtreeFields: [
        {
          term: 'entity-single',
          value: [
            {
              id: '9e475583-8fbc-48f6-ae08-250779822fce',
              type: 'entity',
              label: 'entity',
              labelledBy: 'test',
              properties: {
                test: [
                  {
                    id: 'ca7e58cf-a552-4ac5-abc3-3cc7934dbb66',
                    type: 'text-field',
                    label: 'Test',
                    value: '',
                  },
                ],
              },
              selector: {
                id: '80e91e80-3b5d-42b5-94ab-d1f51bf47142',
                type: 'box-selector',
                state: null,
              },
              immutable: true,
            },
          ],
        },
        {
          term: 'entity-multiple',
          value: [
            {
              id: '06726886-6244-4dc8-89b5-0eaf29e5c089',
              type: 'entity',
              label: 'Entity multiple',
              allowMultiple: true,
              properties: {
                name: [
                  {
                    id: 'ba3e1cf6-6f65-4fd3-8cf3-80ec88453987',
                    type: 'text-field',
                    label: 'name',
                    value: '',
                  },
                ],
              },
              selector: {
                id: '88e7437b-925a-460c-9674-ef980bff2051',
                type: 'box-selector',
                state: null,
              },
              immutable: true,
            },
          ],
        },
        {
          term: 'field-multiple',
          value: [
            {
              id: '976510eb-e05b-4296-b164-44c42c2011fa',
              type: 'text-field',
              label: 'Field multiple',
              value: '',
              allowMultiple: true,
              selector: {
                id: '281db7c8-41fa-4553-9cac-2fa8246263bb',
                type: 'box-selector',
                state: null,
              },
            },
          ],
        },
        {
          term: 'field-single',
          value: [
            {
              id: '57ad1c35-8495-4716-b70a-fa6a18534e92',
              type: 'text-field',
              label: 'Field',
              value: 'test',
              selector: {
                id: '170081c2-1d55-40ec-b698-55476877806c',
                type: 'box-selector',
                state: null,
              },
              revision: 'dfff8c9e-28d1-4e39-bd5c-353621e50a81',
              revises: '39a18d5a-728e-422f-ad04-e80c3a280fae',
            },
          ],
        },
      ],
      structure: {
        id: '707daf5f-648f-4ae2-a5b4-86ed3986c703',
        type: 'choice',
        label: 'Project with selectors',
        items: [
          {
            id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            type: 'model',
            label: 'Default',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
          },
        ],
      },
      idStack: ['501dbece-137d-4180-9bbd-c3ae022ad10b'],
      isThankYou: false,
      isPreviewing: false,
      structureMap: {
        '501dbece-137d-4180-9bbd-c3ae022ad10b': {
          id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
          structure: {
            id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            type: 'model',
            label: 'Default',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
          },
          path: [
            '707daf5f-648f-4ae2-a5b4-86ed3986c703',
            '707daf5f-648f-4ae2-a5b4-86ed3986c703',
            '501dbece-137d-4180-9bbd-c3ae022ad10b',
          ],
        },
        '707daf5f-648f-4ae2-a5b4-86ed3986c703': {
          id: '707daf5f-648f-4ae2-a5b4-86ed3986c703',
          structure: {
            id: '707daf5f-648f-4ae2-a5b4-86ed3986c703',
            type: 'choice',
            label: 'Project with selectors',
            items: [
              {
                id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
                type: 'model',
                label: 'Default',
                fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
              },
            ],
          },
          path: ['707daf5f-648f-4ae2-a5b4-86ed3986c703'],
        },
      },
      currentStructureId: '501dbece-137d-4180-9bbd-c3ae022ad10b',
      currentStructure: {
        id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
        type: 'model',
        label: 'Default',
        fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
      },
      choiceStack: [
        {
          id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
          structure: {
            id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            type: 'model',
            label: 'Default',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
          },
          path: [
            '707daf5f-648f-4ae2-a5b4-86ed3986c703',
            '707daf5f-648f-4ae2-a5b4-86ed3986c703',
            '501dbece-137d-4180-9bbd-c3ae022ad10b',
          ],
        },
      ],
      selector: {
        availableSelectors: [
          {
            id: '80e91e80-3b5d-42b5-94ab-d1f51bf47142',
            type: 'box-selector',
            state: null,
          },
          {
            id: '88e7437b-925a-460c-9674-ef980bff2051',
            type: 'box-selector',
            state: null,
          },
          {
            id: '281db7c8-41fa-4553-9cac-2fa8246263bb',
            type: 'box-selector',
            state: null,
          },
          {
            id: 'e4399ba6-9adf-4cbd-bce5-80dd26ab094e',
            type: 'box-selector',
            state: null,
          },
          {
            id: '170081c2-1d55-40ec-b698-55476877806c',
            type: 'box-selector',
            state: null,
          },
        ],
        currentSelectorId: '170081c2-1d55-40ec-b698-55476877806c',
        selectorPreviewData: {},
        currentSelectorState: null,
        topLevelSelector: null,
        visibleSelectorIds: [],
        selectorPaths: {
          '80e91e80-3b5d-42b5-94ab-d1f51bf47142': [['entity-single', '9e475583-8fbc-48f6-ae08-250779822fce']],
          '88e7437b-925a-460c-9674-ef980bff2051': [['entity-multiple', '06726886-6244-4dc8-89b5-0eaf29e5c089']],
          '281db7c8-41fa-4553-9cac-2fa8246263bb': [['field-multiple', '976510eb-e05b-4296-b164-44c42c2011fa']],
          'e4399ba6-9adf-4cbd-bce5-80dd26ab094e': [['field-single', '39a18d5a-728e-422f-ad04-e80c3a280fae']],
          '170081c2-1d55-40ec-b698-55476877806c': [['field-single', '39a18d5a-728e-422f-ad04-e80c3a280fae']],
        },
      },
      visibleCurrentLevelSelectorIds: [
        '80e91e80-3b5d-42b5-94ab-d1f51bf47142',
        '88e7437b-925a-460c-9674-ef980bff2051',
        '281db7c8-41fa-4553-9cac-2fa8246263bb',
        '170081c2-1d55-40ec-b698-55476877806c',
      ],
      revisionAdjacentSubtreeFields: {
        fields: [],
      },
      visibleAdjacentSelectorIds: [],
      resolvedSelectors: [
        {
          id: '80e91e80-3b5d-42b5-94ab-d1f51bf47142',
          type: 'box-selector',
          state: null,
        },
        {
          id: '88e7437b-925a-460c-9674-ef980bff2051',
          type: 'box-selector',
          state: null,
        },
        {
          id: '281db7c8-41fa-4553-9cac-2fa8246263bb',
          type: 'box-selector',
          state: null,
        },
        {
          id: 'e4399ba6-9adf-4cbd-bce5-80dd26ab094e',
          type: 'box-selector',
          state: null,
        },
        {
          id: '170081c2-1d55-40ec-b698-55476877806c',
          type: 'box-selector',
          state: null,
        },
      ],
      visibleCurrentLevelSelectors: [
        {
          id: '80e91e80-3b5d-42b5-94ab-d1f51bf47142',
          type: 'box-selector',
          state: null,
        },
        {
          id: '88e7437b-925a-460c-9674-ef980bff2051',
          type: 'box-selector',
          state: null,
        },
        {
          id: '281db7c8-41fa-4553-9cac-2fa8246263bb',
          type: 'box-selector',
          state: null,
        },
        {
          id: '170081c2-1d55-40ec-b698-55476877806c',
          type: 'box-selector',
          state: null,
        },
      ],
      visibleAdjacentSelectors: [],
    };

    const store = hydrateRevisionStore(state);

    const actions = store.getActions();

    actions.updateCurrentSelector({
      x: 1155,
      y: 536,
      width: 607,
      height: 285,
    } as any);

    const newState: any = store.getState();

    expect(newState.currentRevision.document.properties['field-single'][0].selector.state).toEqual({
      x: 1155,
      y: 536,
      width: 607,
      height: 285,
    });
  });

  test('it should not copy revised by when creating new entity instance', () => {
    const state = {
      revisions: {
        '501dbece-137d-4180-9bbd-c3ae022ad10b': {
          captureModelId: 'cf1063cd-22de-4c71-9cd3-410aee300e39',
          revision: {
            id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
            approved: true,
            structureId: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            label: 'Default',
          },
          source: 'canonical',
          document: {
            id: '31fd3e04-1fc2-4cab-b0c9-88b3e654fc06',
            type: 'entity',
            label: 'Project with selectors',
            properties: {
              'entity-single': [
                {
                  id: '46ffe8a3-1663-4457-bb20-c1ced15f8e68',
                  type: 'entity',
                  label: 'entity',
                  labelledBy: 'test',
                  properties: {
                    test: [
                      {
                        id: 'af393ef9-6753-436d-bc18-c677e45c5b77',
                        type: 'text-field',
                        label: 'Test',
                        value: '',
                      },
                    ],
                  },
                  selector: {
                    id: '11e0389a-d697-4865-91b3-c79b9f18e108',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'entity-multiple': [
                {
                  id: '4ff479d3-c6aa-4c73-97c6-49dc1a84f653',
                  type: 'entity',
                  label: 'Entity multiple',
                  allowMultiple: true,
                  properties: {
                    name: [
                      {
                        id: 'b81f9016-1ac4-412b-9067-49e9160c9e65',
                        type: 'text-field',
                        label: 'name',
                        value: '',
                      },
                    ],
                  },
                  selector: {
                    id: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'field-multiple': [
                {
                  id: '7a9408ca-975c-4b0a-9d36-2b9a00907930',
                  type: 'text-field',
                  label: 'Field multiple',
                  value: '',
                  allowMultiple: true,
                  selector: {
                    id: 'f5f5e733-ac67-4298-9be9-a0478223eb11',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'field-single': [
                {
                  id: '6222fcce-3dea-4a17-b8e0-b1ce466db3d9',
                  type: 'text-field',
                  label: 'Field',
                  value: '',
                  selector: {
                    id: '710cd08d-9925-4732-b726-2cdae56c11df',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
            },
          },
        },
        '36110f66-81fd-4567-8f85-8042658be21c': {
          captureModelId: 'cf1063cd-22de-4c71-9cd3-410aee300e39',
          revision: {
            id: '36110f66-81fd-4567-8f85-8042658be21c',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
            approved: false,
            structureId: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            label: 'Default',
            revises: '501dbece-137d-4180-9bbd-c3ae022ad10b',
          },
          document: {
            id: '31fd3e04-1fc2-4cab-b0c9-88b3e654fc06',
            type: 'entity',
            label: 'Project with selectors',
            properties: {
              'entity-single': [
                {
                  id: '46ffe8a3-1663-4457-bb20-c1ced15f8e68',
                  type: 'entity',
                  label: 'entity',
                  labelledBy: 'test',
                  properties: {
                    test: [
                      {
                        id: 'af393ef9-6753-436d-bc18-c677e45c5b77',
                        type: 'text-field',
                        label: 'Test',
                        value: '',
                      },
                    ],
                  },
                  selector: {
                    id: '11e0389a-d697-4865-91b3-c79b9f18e108',
                    type: 'box-selector',
                    state: null,
                  },
                  immutable: true,
                },
              ],
              'entity-multiple': [
                {
                  id: '4ff479d3-c6aa-4c73-97c6-49dc1a84f653',
                  type: 'entity',
                  label: 'Entity multiple',
                  allowMultiple: true,
                  properties: {
                    name: [
                      {
                        id: '74fff33d-911f-4490-8f2f-911c91d76998',
                        type: 'text-field',
                        label: 'name',
                        value: 'entity 1',
                        revision: '36110f66-81fd-4567-8f85-8042658be21c',
                        revises: 'b81f9016-1ac4-412b-9067-49e9160c9e65',
                      },
                    ],
                  },
                  selector: {
                    id: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
                    type: 'box-selector',
                    state: null,
                    revisedBy: [
                      {
                        id: '3ba99318-dda3-4be4-894c-153f0809cd3f',
                        type: 'box-selector',
                        state: {
                          x: 680,
                          y: 213,
                          width: 466,
                          height: 268,
                        },
                        revisionId: '36110f66-81fd-4567-8f85-8042658be21c',
                        revises: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
                      },
                    ],
                  },
                  immutable: true,
                },
              ],
              'field-multiple': [
                {
                  id: '7a9408ca-975c-4b0a-9d36-2b9a00907930',
                  type: 'text-field',
                  label: 'Field multiple',
                  value: '',
                  allowMultiple: true,
                  selector: {
                    id: 'f5f5e733-ac67-4298-9be9-a0478223eb11',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
              'field-single': [
                {
                  id: '6222fcce-3dea-4a17-b8e0-b1ce466db3d9',
                  type: 'text-field',
                  label: 'Field',
                  value: '',
                  selector: {
                    id: '710cd08d-9925-4732-b726-2cdae56c11df',
                    type: 'box-selector',
                    state: null,
                  },
                },
              ],
            },
            immutable: true,
          },
          source: 'structure',
        },
      },
      revisionEditMode: true,
      currentRevisionId: '36110f66-81fd-4567-8f85-8042658be21c',
      currentRevision: {
        captureModelId: 'cf1063cd-22de-4c71-9cd3-410aee300e39',
        revision: {
          id: '36110f66-81fd-4567-8f85-8042658be21c',
          fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
          approved: false,
          structureId: '501dbece-137d-4180-9bbd-c3ae022ad10b',
          label: 'Default',
          revises: '501dbece-137d-4180-9bbd-c3ae022ad10b',
        },
        document: {
          id: '31fd3e04-1fc2-4cab-b0c9-88b3e654fc06',
          type: 'entity',
          label: 'Project with selectors',
          properties: {
            'entity-single': [
              {
                id: '46ffe8a3-1663-4457-bb20-c1ced15f8e68',
                type: 'entity',
                label: 'entity',
                labelledBy: 'test',
                properties: {
                  test: [
                    {
                      id: 'af393ef9-6753-436d-bc18-c677e45c5b77',
                      type: 'text-field',
                      label: 'Test',
                      value: '',
                    },
                  ],
                },
                selector: {
                  id: '11e0389a-d697-4865-91b3-c79b9f18e108',
                  type: 'box-selector',
                  state: null,
                },
                immutable: true,
              },
            ],
            'entity-multiple': [
              {
                id: '4ff479d3-c6aa-4c73-97c6-49dc1a84f653',
                type: 'entity',
                label: 'Entity multiple',
                allowMultiple: true,
                properties: {
                  name: [
                    {
                      id: '74fff33d-911f-4490-8f2f-911c91d76998',
                      type: 'text-field',
                      label: 'name',
                      value: 'entity 1',
                      revision: '36110f66-81fd-4567-8f85-8042658be21c',
                      revises: 'b81f9016-1ac4-412b-9067-49e9160c9e65',
                    },
                  ],
                },
                selector: {
                  id: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
                  type: 'box-selector',
                  state: null,
                  revisedBy: [
                    {
                      id: '3ba99318-dda3-4be4-894c-153f0809cd3f',
                      type: 'box-selector',
                      state: {
                        x: 680,
                        y: 213,
                        width: 466,
                        height: 268,
                      },
                      revisionId: '36110f66-81fd-4567-8f85-8042658be21c',
                      revises: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
                    },
                  ],
                },
                immutable: true,
              },
            ],
            'field-multiple': [
              {
                id: '7a9408ca-975c-4b0a-9d36-2b9a00907930',
                type: 'text-field',
                label: 'Field multiple',
                value: '',
                allowMultiple: true,
                selector: {
                  id: 'f5f5e733-ac67-4298-9be9-a0478223eb11',
                  type: 'box-selector',
                  state: null,
                },
              },
            ],
            'field-single': [
              {
                id: '6222fcce-3dea-4a17-b8e0-b1ce466db3d9',
                type: 'text-field',
                label: 'Field',
                value: '',
                selector: {
                  id: '710cd08d-9925-4732-b726-2cdae56c11df',
                  type: 'box-selector',
                  state: null,
                },
              },
            ],
          },
          immutable: true,
        },
        source: 'structure',
      },
      unsavedRevisionIds: ['36110f66-81fd-4567-8f85-8042658be21c'],
      currentRevisionReadMode: false,
      revisionSubtreePath: [],
      revisionSelectedFieldProperty: null,
      revisionSelectedFieldInstance: null,
      revisionSubtree: {
        id: '31fd3e04-1fc2-4cab-b0c9-88b3e654fc06',
        type: 'entity',
        label: 'Project with selectors',
        properties: {
          'entity-single': [
            {
              id: '46ffe8a3-1663-4457-bb20-c1ced15f8e68',
              type: 'entity',
              label: 'entity',
              labelledBy: 'test',
              properties: {
                test: [
                  {
                    id: 'af393ef9-6753-436d-bc18-c677e45c5b77',
                    type: 'text-field',
                    label: 'Test',
                    value: '',
                  },
                ],
              },
              selector: {
                id: '11e0389a-d697-4865-91b3-c79b9f18e108',
                type: 'box-selector',
                state: null,
              },
              immutable: true,
            },
          ],
          'entity-multiple': [
            {
              id: '4ff479d3-c6aa-4c73-97c6-49dc1a84f653',
              type: 'entity',
              label: 'Entity multiple',
              allowMultiple: true,
              properties: {
                name: [
                  {
                    id: '74fff33d-911f-4490-8f2f-911c91d76998',
                    type: 'text-field',
                    label: 'name',
                    value: 'entity 1',
                    revision: '36110f66-81fd-4567-8f85-8042658be21c',
                    revises: 'b81f9016-1ac4-412b-9067-49e9160c9e65',
                  },
                ],
              },
              selector: {
                id: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
                type: 'box-selector',
                state: null,
                revisedBy: [
                  {
                    id: '3ba99318-dda3-4be4-894c-153f0809cd3f',
                    type: 'box-selector',
                    state: {
                      x: 680,
                      y: 213,
                      width: 466,
                      height: 268,
                    },
                    revisionId: '36110f66-81fd-4567-8f85-8042658be21c',
                    revises: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
                  },
                ],
              },
              immutable: true,
            },
          ],
          'field-multiple': [
            {
              id: '7a9408ca-975c-4b0a-9d36-2b9a00907930',
              type: 'text-field',
              label: 'Field multiple',
              value: '',
              allowMultiple: true,
              selector: {
                id: 'f5f5e733-ac67-4298-9be9-a0478223eb11',
                type: 'box-selector',
                state: null,
              },
            },
          ],
          'field-single': [
            {
              id: '6222fcce-3dea-4a17-b8e0-b1ce466db3d9',
              type: 'text-field',
              label: 'Field',
              value: '',
              selector: {
                id: '710cd08d-9925-4732-b726-2cdae56c11df',
                type: 'box-selector',
                state: null,
              },
            },
          ],
        },
        immutable: true,
      },
      revisionSubtreeFieldKeys: ['entity-single', 'entity-multiple', 'field-multiple', 'field-single'],
      revisionSubtreeFields: [
        {
          term: 'entity-single',
          value: [
            {
              id: '46ffe8a3-1663-4457-bb20-c1ced15f8e68',
              type: 'entity',
              label: 'entity',
              labelledBy: 'test',
              properties: {
                test: [
                  {
                    id: 'af393ef9-6753-436d-bc18-c677e45c5b77',
                    type: 'text-field',
                    label: 'Test',
                    value: '',
                  },
                ],
              },
              selector: {
                id: '11e0389a-d697-4865-91b3-c79b9f18e108',
                type: 'box-selector',
                state: null,
              },
              immutable: true,
            },
          ],
        },
        {
          term: 'entity-multiple',
          value: [
            {
              id: '4ff479d3-c6aa-4c73-97c6-49dc1a84f653',
              type: 'entity',
              label: 'Entity multiple',
              allowMultiple: true,
              properties: {
                name: [
                  {
                    id: '74fff33d-911f-4490-8f2f-911c91d76998',
                    type: 'text-field',
                    label: 'name',
                    value: 'entity 1',
                    revision: '36110f66-81fd-4567-8f85-8042658be21c',
                    revises: 'b81f9016-1ac4-412b-9067-49e9160c9e65',
                  },
                ],
              },
              selector: {
                id: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
                type: 'box-selector',
                state: null,
                revisedBy: [
                  {
                    id: '3ba99318-dda3-4be4-894c-153f0809cd3f',
                    type: 'box-selector',
                    state: {
                      x: 680,
                      y: 213,
                      width: 466,
                      height: 268,
                    },
                    revisionId: '36110f66-81fd-4567-8f85-8042658be21c',
                    revises: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
                  },
                ],
              },
              immutable: true,
            },
          ],
        },
        {
          term: 'field-multiple',
          value: [
            {
              id: '7a9408ca-975c-4b0a-9d36-2b9a00907930',
              type: 'text-field',
              label: 'Field multiple',
              value: '',
              allowMultiple: true,
              selector: {
                id: 'f5f5e733-ac67-4298-9be9-a0478223eb11',
                type: 'box-selector',
                state: null,
              },
            },
          ],
        },
        {
          term: 'field-single',
          value: [
            {
              id: '6222fcce-3dea-4a17-b8e0-b1ce466db3d9',
              type: 'text-field',
              label: 'Field',
              value: '',
              selector: {
                id: '710cd08d-9925-4732-b726-2cdae56c11df',
                type: 'box-selector',
                state: null,
              },
            },
          ],
        },
      ],
      structure: {
        id: '707daf5f-648f-4ae2-a5b4-86ed3986c703',
        type: 'choice',
        label: 'Project with selectors',
        items: [
          {
            id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            type: 'model',
            label: 'Default',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
          },
        ],
      },
      idStack: ['501dbece-137d-4180-9bbd-c3ae022ad10b'],
      isThankYou: false,
      isPreviewing: false,
      structureMap: {
        '501dbece-137d-4180-9bbd-c3ae022ad10b': {
          id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
          structure: {
            id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            type: 'model',
            label: 'Default',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
          },
          path: [
            '707daf5f-648f-4ae2-a5b4-86ed3986c703',
            '707daf5f-648f-4ae2-a5b4-86ed3986c703',
            '501dbece-137d-4180-9bbd-c3ae022ad10b',
          ],
        },
        '707daf5f-648f-4ae2-a5b4-86ed3986c703': {
          id: '707daf5f-648f-4ae2-a5b4-86ed3986c703',
          structure: {
            id: '707daf5f-648f-4ae2-a5b4-86ed3986c703',
            type: 'choice',
            label: 'Project with selectors',
            items: [
              {
                id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
                type: 'model',
                label: 'Default',
                fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
              },
            ],
          },
          path: ['707daf5f-648f-4ae2-a5b4-86ed3986c703'],
        },
      },
      currentStructureId: '501dbece-137d-4180-9bbd-c3ae022ad10b',
      currentStructure: {
        id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
        type: 'model',
        label: 'Default',
        fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
      },
      choiceStack: [
        {
          id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
          structure: {
            id: '501dbece-137d-4180-9bbd-c3ae022ad10b',
            type: 'model',
            label: 'Default',
            fields: [['entity-single', ['test']], ['entity-multiple', ['name']], 'field-multiple', 'field-single'],
          },
          path: [
            '707daf5f-648f-4ae2-a5b4-86ed3986c703',
            '707daf5f-648f-4ae2-a5b4-86ed3986c703',
            '501dbece-137d-4180-9bbd-c3ae022ad10b',
          ],
        },
      ],
      selector: {
        availableSelectors: [
          {
            id: '11e0389a-d697-4865-91b3-c79b9f18e108',
            type: 'box-selector',
            state: null,
          },
          {
            id: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
            type: 'box-selector',
            state: null,
            revisedBy: [
              {
                id: '3ba99318-dda3-4be4-894c-153f0809cd3f',
                type: 'box-selector',
                state: {
                  x: 680,
                  y: 213,
                  width: 466,
                  height: 268,
                },
                revisionId: '36110f66-81fd-4567-8f85-8042658be21c',
                revises: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
              },
            ],
          },
          {
            id: 'f5f5e733-ac67-4298-9be9-a0478223eb11',
            type: 'box-selector',
            state: null,
          },
          {
            id: '710cd08d-9925-4732-b726-2cdae56c11df',
            type: 'box-selector',
            state: null,
          },
        ],
        currentSelectorId: null,
        selectorPreviewData: {
          '147c59cc-589f-46f6-84f0-e7a446fdfe9a':
            'https://view.nls.uk/iiif/7443/74438658.5/680,213,466,268/256,/0/default.jpg',
        },
        currentSelectorState: null,
        topLevelSelector: null,
        visibleSelectorIds: [],
        selectorPaths: {
          '11e0389a-d697-4865-91b3-c79b9f18e108': [['entity-single', '46ffe8a3-1663-4457-bb20-c1ced15f8e68']],
          '147c59cc-589f-46f6-84f0-e7a446fdfe9a': [['entity-multiple', '4ff479d3-c6aa-4c73-97c6-49dc1a84f653']],
          'f5f5e733-ac67-4298-9be9-a0478223eb11': [['field-multiple', '7a9408ca-975c-4b0a-9d36-2b9a00907930']],
          '710cd08d-9925-4732-b726-2cdae56c11df': [['field-single', '6222fcce-3dea-4a17-b8e0-b1ce466db3d9']],
        },
      },
      visibleCurrentLevelSelectorIds: [
        '11e0389a-d697-4865-91b3-c79b9f18e108',
        '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
        'f5f5e733-ac67-4298-9be9-a0478223eb11',
        '710cd08d-9925-4732-b726-2cdae56c11df',
      ],
      revisionAdjacentSubtreeFields: {
        fields: [],
      },
      visibleAdjacentSelectorIds: [],
      resolvedSelectors: [
        {
          id: '11e0389a-d697-4865-91b3-c79b9f18e108',
          type: 'box-selector',
          state: null,
        },
        {
          id: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
          type: 'box-selector',
          state: {
            x: 680,
            y: 213,
            width: 466,
            height: 268,
          },
          revisedBy: [
            {
              id: '3ba99318-dda3-4be4-894c-153f0809cd3f',
              type: 'box-selector',
              state: {
                x: 680,
                y: 213,
                width: 466,
                height: 268,
              },
              revisionId: '36110f66-81fd-4567-8f85-8042658be21c',
              revises: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
            },
          ],
        },
        {
          id: 'f5f5e733-ac67-4298-9be9-a0478223eb11',
          type: 'box-selector',
          state: null,
        },
        {
          id: '710cd08d-9925-4732-b726-2cdae56c11df',
          type: 'box-selector',
          state: null,
        },
      ],
      visibleCurrentLevelSelectors: [
        {
          id: '11e0389a-d697-4865-91b3-c79b9f18e108',
          type: 'box-selector',
          state: null,
        },
        {
          id: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
          type: 'box-selector',
          state: {
            x: 680,
            y: 213,
            width: 466,
            height: 268,
          },
          revisedBy: [
            {
              id: '3ba99318-dda3-4be4-894c-153f0809cd3f',
              type: 'box-selector',
              state: {
                x: 680,
                y: 213,
                width: 466,
                height: 268,
              },
              revisionId: '36110f66-81fd-4567-8f85-8042658be21c',
              revises: '147c59cc-589f-46f6-84f0-e7a446fdfe9a',
            },
          ],
        },
        {
          id: 'f5f5e733-ac67-4298-9be9-a0478223eb11',
          type: 'box-selector',
          state: null,
        },
        {
          id: '710cd08d-9925-4732-b726-2cdae56c11df',
          type: 'box-selector',
          state: null,
        },
      ],
      visibleAdjacentSelectors: [],
    };

    const store = hydrateRevisionStore(state);

    const actions = store.getActions();

    actions.createNewEntityInstance({
      property: 'entity-multiple',
      path: [],
    } as any);

    const newState: any = store.getState();

    expect(newState.currentRevision.document.properties['entity-multiple'][1].selector.revisedBy).not.toBeDefined();
  });
});
