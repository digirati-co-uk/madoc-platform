import { hydrateRevisionStore } from '../../../../src/frontend/shared/capture-models/editor/stores/revisions/revisions-store';

describe('Jira bugs', () => {
  test('MAD-1183 circular selector', () => {
    const state = {
      revisions: {
        '58e0424a-b26f-4ef8-806b-ca1edf9096e3': {
          captureModelId: '8b74c3bf-ebde-430f-92fb-2e8a9902fddc',
          revision: {
            id: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
            approved: true,
            structureId: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            label: 'Default',
          },
          source: 'canonical',
          document: {
            id: '87f6f2d0-d46b-45b6-b035-f671e7fcdbf7',
            type: 'entity',
            label: 'Transcriptie&Vertaling',
            properties: {
              Transcriptie: [
                {
                  id: '6b0608fd-aca6-43b9-80a5-358e0f92a1f4',
                  type: 'entity',
                  label: 'Transcriptie & Vertaling',
                  selector: {
                    id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                    type: 'box-selector',
                    state: null,
                    revisedBy: [
                      {
                        id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
                        type: 'box-selector',
                        state: {
                          x: 756,
                          y: 600,
                          width: 160,
                          height: 788,
                        },
                        revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                        revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
                      },
                      {
                        id: '996976e0-618a-41d3-b6cd-19248fb57313',
                        type: 'box-selector',
                        state: {
                          x: 958,
                          y: 641,
                          width: 567.394987360801,
                          height: 772.4299219556424,
                        },
                        revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                        revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
                      },
                    ],
                  },
                  properties: {
                    Vertaling: [
                      {
                        id: '49ad96a6-4bc1-46b9-9c22-66be1a8cc31a',
                        type: 'text-field',
                        label: 'Vertaling',
                        value: '',
                        multiline: true,
                      },
                    ],
                    Transcriptie: [
                      {
                        id: 'cfc54aa6-cf64-4720-b2f2-06271cebf7e8',
                        type: 'text-field',
                        label: 'Transcriptie',
                        value: '',
                        multiline: true,
                      },
                    ],
                  },
                  description: 'Make a transcription',
                  allowMultiple: false,
                },
              ],
            },
          },
        },
        'b92e5f67-c57e-422a-8c02-478b090c3d2f': {
          captureModelId: '8b74c3bf-ebde-430f-92fb-2e8a9902fddc',
          revision: {
            fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
            structureId: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            id: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
            revises: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            approved: false,
            status: 'submitted',
            authors: ['urn:madoc:user:153'],
            label: 'Default',
            captureModelId: '8b74c3bf-ebde-430f-92fb-2e8a9902fddc',
          },
          document: {
            id: '87f6f2d0-d46b-45b6-b035-f671e7fcdbf7',
            type: 'entity',
            label: 'Transcriptie&Vertaling',
            properties: {
              Transcriptie: [
                {
                  id: '6b0608fd-aca6-43b9-80a5-358e0f92a1f4',
                  type: 'entity',
                  label: 'Transcriptie & Vertaling',
                  selector: {
                    id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                    type: 'box-selector',
                    state: null,
                    revisedBy: [
                      {
                        id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
                        type: 'box-selector',
                        state: {
                          x: 756,
                          y: 600,
                          width: 160,
                          height: 788,
                        },
                        revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                        revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
                      },
                      {
                        id: '996976e0-618a-41d3-b6cd-19248fb57313',
                        type: 'box-selector',
                        state: {
                          x: 958,
                          y: 641,
                          width: 567.394987360801,
                          height: 772.4299219556424,
                        },
                        revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                        revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
                      },
                    ],
                  },
                  properties: {
                    Vertaling: [
                      {
                        id: '4dfbfa46-05a4-4587-a6a0-c91ddfcab67e',
                        type: 'text-field',
                        label: 'Vertaling',
                        value: 'test 3',
                        revises: '49ad96a6-4bc1-46b9-9c22-66be1a8cc31a',
                        revision: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
                        immutable: true,
                        multiline: true,
                      },
                    ],
                    Transcriptie: [
                      {
                        id: 'd0fa9b30-6e32-4f21-ada1-4d573d701d08',
                        type: 'text-field',
                        label: 'Transcriptie',
                        value: 'Test again',
                        revises: 'cfc54aa6-cf64-4720-b2f2-06271cebf7e8',
                        revision: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
                        immutable: true,
                        multiline: true,
                      },
                    ],
                  },
                  description: 'Make a transcription',
                  allowMultiple: false,
                },
              ],
            },
          },
          source: 'structure',
        },
        '4d82fe50-7ea2-4c19-b417-0eb6677611f9': {
          captureModelId: '8b74c3bf-ebde-430f-92fb-2e8a9902fddc',
          revision: {
            fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
            structureId: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            id: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
            revises: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            approved: false,
            status: 'submitted',
            authors: ['urn:madoc:user:153'],
            label: 'Default',
            captureModelId: '8b74c3bf-ebde-430f-92fb-2e8a9902fddc',
          },
          document: {
            id: '87f6f2d0-d46b-45b6-b035-f671e7fcdbf7',
            type: 'entity',
            label: 'Transcriptie&Vertaling',
            properties: {
              Transcriptie: [
                {
                  id: '6b0608fd-aca6-43b9-80a5-358e0f92a1f4',
                  type: 'entity',
                  label: 'Transcriptie & Vertaling',
                  selector: {
                    id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                    type: 'box-selector',
                    state: null,
                    revisedBy: [
                      {
                        id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
                        type: 'box-selector',
                        state: {
                          x: 756,
                          y: 600,
                          width: 160,
                          height: 788,
                        },
                        revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                        revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
                      },
                      {
                        id: '996976e0-618a-41d3-b6cd-19248fb57313',
                        type: 'box-selector',
                        state: {
                          x: 958,
                          y: 641,
                          width: 567.394987360801,
                          height: 772.4299219556424,
                        },
                        revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                        revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
                      },
                    ],
                  },
                  properties: {
                    Vertaling: [
                      {
                        id: 'ff3dec4b-c8b5-45fe-8089-6d143d13bf0e',
                        type: 'text-field',
                        label: 'Vertaling',
                        value: 'Test 2',
                        revises: '49ad96a6-4bc1-46b9-9c22-66be1a8cc31a',
                        revision: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
                        immutable: true,
                        multiline: true,
                      },
                    ],
                    Transcriptie: [
                      {
                        id: '36d64fed-e9d8-48b6-b96d-aaad1bd8df06',
                        type: 'text-field',
                        label: 'Transcriptie',
                        value: 'Test another',
                        revises: 'cfc54aa6-cf64-4720-b2f2-06271cebf7e8',
                        revision: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
                        immutable: true,
                        multiline: true,
                      },
                    ],
                  },
                  description: 'Make a transcription',
                  allowMultiple: false,
                },
              ],
            },
          },
          source: 'structure',
        },
        '426b17fc-22f4-45f4-a961-79898cfd2f73': {
          captureModelId: '8b74c3bf-ebde-430f-92fb-2e8a9902fddc',
          revision: {
            fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
            structureId: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            id: '426b17fc-22f4-45f4-a961-79898cfd2f73',
            revises: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            approved: false,
            status: 'submitted',
            authors: ['urn:madoc:user:153'],
            label: 'Default',
            captureModelId: '8b74c3bf-ebde-430f-92fb-2e8a9902fddc',
          },
          document: {
            id: '87f6f2d0-d46b-45b6-b035-f671e7fcdbf7',
            type: 'entity',
            label: 'Transcriptie&Vertaling',
            properties: {
              Transcriptie: [
                {
                  id: '6b0608fd-aca6-43b9-80a5-358e0f92a1f4',
                  type: 'entity',
                  label: 'Transcriptie & Vertaling',
                  selector: {
                    id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                    type: 'box-selector',
                    state: null,
                    revisedBy: [
                      {
                        id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
                        type: 'box-selector',
                        state: {
                          x: 756,
                          y: 600,
                          width: 160,
                          height: 788,
                        },
                        revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                        revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
                      },
                      {
                        id: '996976e0-618a-41d3-b6cd-19248fb57313',
                        type: 'box-selector',
                        state: {
                          x: 958,
                          y: 641,
                          width: 567.394987360801,
                          height: 772.4299219556424,
                        },
                        revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                        revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
                      },
                    ],
                  },
                  properties: {
                    Vertaling: [
                      {
                        id: '30da8acc-cc46-42ba-b589-976471ce93b5',
                        type: 'text-field',
                        label: 'Vertaling',
                        value: 'Test',
                        revises: '49ad96a6-4bc1-46b9-9c22-66be1a8cc31a',
                        revision: '426b17fc-22f4-45f4-a961-79898cfd2f73',
                        multiline: true,
                      },
                    ],
                    Transcriptie: [
                      {
                        id: 'eb5ddc55-dc99-4fcf-b200-71c922f41d8f',
                        type: 'text-field',
                        label: 'Transcriptie',
                        value: 'Turn around',
                        revises: 'cfc54aa6-cf64-4720-b2f2-06271cebf7e8',
                        revision: '426b17fc-22f4-45f4-a961-79898cfd2f73',
                        multiline: true,
                      },
                    ],
                  },
                  description: 'Make a transcription',
                  allowMultiple: false,
                },
              ],
            },
          },
          source: 'structure',
        },
        '7568b1af-69b0-4b84-b799-a08854941e4c': {
          captureModelId: '8b74c3bf-ebde-430f-92fb-2e8a9902fddc',
          revision: {
            id: '7568b1af-69b0-4b84-b799-a08854941e4c',
            fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
            approved: false,
            structureId: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            label: 'Default',
            revises: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
          },
          document: {
            id: '87f6f2d0-d46b-45b6-b035-f671e7fcdbf7',
            type: 'entity',
            label: 'Transcriptie&Vertaling',
            properties: {
              Transcriptie: [
                {
                  id: '6b0608fd-aca6-43b9-80a5-358e0f92a1f4',
                  type: 'entity',
                  label: 'Transcriptie & Vertaling',
                  selector: {
                    id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                    type: 'box-selector',
                    state: null,
                    revisedBy: [
                      {
                        id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
                        type: 'box-selector',
                        state: {
                          x: 756,
                          y: 600,
                          width: 160,
                          height: 788,
                        },
                        revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                        revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
                      },
                      {
                        id: '996976e0-618a-41d3-b6cd-19248fb57313',
                        type: 'box-selector',
                        state: {
                          x: 958,
                          y: 641,
                          width: 567.394987360801,
                          height: 772.4299219556424,
                        },
                        revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                        revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
                      },
                    ],
                  },
                  properties: {
                    Vertaling: [
                      {
                        id: 'a6285ec6-7270-4904-a5e9-4931628c51fb',
                        type: 'text-field',
                        label: 'Vertaling',
                        value: 'asdasd',
                        multiline: true,
                        revision: '7568b1af-69b0-4b84-b799-a08854941e4c',
                        revises: '49ad96a6-4bc1-46b9-9c22-66be1a8cc31a',
                      },
                    ],
                    Transcriptie: [
                      {
                        id: 'cfc54aa6-cf64-4720-b2f2-06271cebf7e8',
                        type: 'text-field',
                        label: 'Transcriptie',
                        value: '',
                        multiline: true,
                      },
                    ],
                  },
                  description: 'Make a transcription',
                  allowMultiple: false,
                  immutable: true,
                },
              ],
            },
            immutable: true,
          },
          source: 'structure',
        },
      },
      revisionEditMode: true,
      currentRevisionId: '7568b1af-69b0-4b84-b799-a08854941e4c',
      currentRevision: {
        captureModelId: '8b74c3bf-ebde-430f-92fb-2e8a9902fddc',
        revision: {
          id: '7568b1af-69b0-4b84-b799-a08854941e4c',
          fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
          approved: false,
          structureId: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
          label: 'Default',
          revises: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
        },
        document: {
          id: '87f6f2d0-d46b-45b6-b035-f671e7fcdbf7',
          type: 'entity',
          label: 'Transcriptie&Vertaling',
          properties: {
            Transcriptie: [
              {
                id: '6b0608fd-aca6-43b9-80a5-358e0f92a1f4',
                type: 'entity',
                label: 'Transcriptie & Vertaling',
                selector: {
                  id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                  type: 'box-selector',
                  state: null,
                  revisedBy: [
                    {
                      id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
                      type: 'box-selector',
                      state: {
                        x: 756,
                        y: 600,
                        width: 160,
                        height: 788,
                      },
                      revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                      revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
                    },
                    {
                      id: '996976e0-618a-41d3-b6cd-19248fb57313',
                      type: 'box-selector',
                      state: {
                        x: 958,
                        y: 641,
                        width: 567.394987360801,
                        height: 772.4299219556424,
                      },
                      revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                      revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
                    },
                  ],
                },
                properties: {
                  Vertaling: [
                    {
                      id: 'a6285ec6-7270-4904-a5e9-4931628c51fb',
                      type: 'text-field',
                      label: 'Vertaling',
                      value: 'asdasd',
                      multiline: true,
                      revision: '7568b1af-69b0-4b84-b799-a08854941e4c',
                      revises: '49ad96a6-4bc1-46b9-9c22-66be1a8cc31a',
                    },
                  ],
                  Transcriptie: [
                    {
                      id: 'cfc54aa6-cf64-4720-b2f2-06271cebf7e8',
                      type: 'text-field',
                      label: 'Transcriptie',
                      value: '',
                      multiline: true,
                    },
                  ],
                },
                description: 'Make a transcription',
                allowMultiple: false,
                immutable: true,
              },
            ],
          },
          immutable: true,
        },
        source: 'structure',
      },
      unsavedRevisionIds: ['7568b1af-69b0-4b84-b799-a08854941e4c'],
      currentRevisionReadMode: false,
      revisionSubtreePath: [['Transcriptie', '6b0608fd-aca6-43b9-80a5-358e0f92a1f4', true]],
      revisionSelectedFieldProperty: null,
      revisionSelectedFieldInstance: null,
      revisionSubtree: {
        id: '6b0608fd-aca6-43b9-80a5-358e0f92a1f4',
        type: 'entity',
        label: 'Transcriptie & Vertaling',
        selector: {
          id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
          type: 'box-selector',
          state: null,
          revisedBy: [
            {
              id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
              type: 'box-selector',
              state: {
                x: 756,
                y: 600,
                width: 160,
                height: 788,
              },
              revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
              revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
            },
            {
              id: '996976e0-618a-41d3-b6cd-19248fb57313',
              type: 'box-selector',
              state: {
                x: 958,
                y: 641,
                width: 567.394987360801,
                height: 772.4299219556424,
              },
              revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
              revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
            },
          ],
        },
        properties: {
          Vertaling: [
            {
              id: 'a6285ec6-7270-4904-a5e9-4931628c51fb',
              type: 'text-field',
              label: 'Vertaling',
              value: 'asdasd',
              multiline: true,
              revision: '7568b1af-69b0-4b84-b799-a08854941e4c',
              revises: '49ad96a6-4bc1-46b9-9c22-66be1a8cc31a',
            },
          ],
          Transcriptie: [
            {
              id: 'cfc54aa6-cf64-4720-b2f2-06271cebf7e8',
              type: 'text-field',
              label: 'Transcriptie',
              value: '',
              multiline: true,
            },
          ],
        },
        description: 'Make a transcription',
        allowMultiple: false,
        immutable: true,
      },
      revisionSubtreeFieldKeys: ['Vertaling', 'Transcriptie'],
      revisionSubtreeFields: [
        {
          term: 'Vertaling',
          value: [
            {
              id: 'a6285ec6-7270-4904-a5e9-4931628c51fb',
              type: 'text-field',
              label: 'Vertaling',
              value: 'asdasd',
              multiline: true,
              revision: '7568b1af-69b0-4b84-b799-a08854941e4c',
              revises: '49ad96a6-4bc1-46b9-9c22-66be1a8cc31a',
            },
          ],
        },
        {
          term: 'Transcriptie',
          value: [
            {
              id: 'cfc54aa6-cf64-4720-b2f2-06271cebf7e8',
              type: 'text-field',
              label: 'Transcriptie',
              value: '',
              multiline: true,
            },
          ],
        },
      ],
      structure: {
        id: 'c12ce2d8-16a2-45d3-a803-56eb259a0a77',
        label: 'Transcriptie&Vertaling',
        type: 'choice',
        items: [
          {
            id: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            type: 'model',
            label: 'Default',
            fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
          },
        ],
      },
      idStack: ['58e0424a-b26f-4ef8-806b-ca1edf9096e3'],
      isThankYou: false,
      isPreviewing: false,
      structureMap: {
        '58e0424a-b26f-4ef8-806b-ca1edf9096e3': {
          id: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
          structure: {
            id: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            type: 'model',
            label: 'Default',
            fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
          },
          path: [
            'c12ce2d8-16a2-45d3-a803-56eb259a0a77',
            'c12ce2d8-16a2-45d3-a803-56eb259a0a77',
            '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
          ],
        },
        'c12ce2d8-16a2-45d3-a803-56eb259a0a77': {
          id: 'c12ce2d8-16a2-45d3-a803-56eb259a0a77',
          structure: {
            id: 'c12ce2d8-16a2-45d3-a803-56eb259a0a77',
            label: 'Transcriptie&Vertaling',
            type: 'choice',
            items: [
              {
                id: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
                type: 'model',
                label: 'Default',
                fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
              },
            ],
          },
          path: ['c12ce2d8-16a2-45d3-a803-56eb259a0a77'],
        },
      },
      currentStructureId: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
      currentStructure: {
        id: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
        type: 'model',
        label: 'Default',
        fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
      },
      choiceStack: [
        {
          id: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
          structure: {
            id: '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
            type: 'model',
            label: 'Default',
            fields: [['Transcriptie', ['Vertaling', 'Transcriptie']]],
          },
          path: [
            'c12ce2d8-16a2-45d3-a803-56eb259a0a77',
            'c12ce2d8-16a2-45d3-a803-56eb259a0a77',
            '58e0424a-b26f-4ef8-806b-ca1edf9096e3',
          ],
        },
      ],
      selector: {
        availableSelectors: [
          {
            id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
            type: 'box-selector',
            state: null,
            revisedBy: [
              {
                id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
                type: 'box-selector',
                state: {
                  x: 756,
                  y: 600,
                  width: 160,
                  height: 788,
                },
                revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
              },
              {
                id: '996976e0-618a-41d3-b6cd-19248fb57313',
                type: 'box-selector',
                state: {
                  x: 958,
                  y: 641,
                  width: 567.394987360801,
                  height: 772.4299219556424,
                },
                revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
              },
            ],
          },
          {
            id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
            type: 'box-selector',
            state: {
              x: 756,
              y: 600,
              width: 160,
              height: 788,
            },
            revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
            revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
          },
          {
            id: '996976e0-618a-41d3-b6cd-19248fb57313',
            type: 'box-selector',
            state: {
              x: 958,
              y: 641,
              width: 567.394987360801,
              height: 772.4299219556424,
            },
            revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
            revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
          },
        ],
        currentSelectorId: '83c20c28-6e10-4acd-8590-06401d0e98c4',
        selectorPreviewData: {},
        currentSelectorState: null,
        topLevelSelector: null,
        visibleSelectorIds: [],
        selectorPaths: {
          '83c20c28-6e10-4acd-8590-06401d0e98c4': [['Transcriptie', '6b0608fd-aca6-43b9-80a5-358e0f92a1f4']],
          '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb': [['Transcriptie', '6b0608fd-aca6-43b9-80a5-358e0f92a1f4']],
          '996976e0-618a-41d3-b6cd-19248fb57313': [['Transcriptie', '6b0608fd-aca6-43b9-80a5-358e0f92a1f4']],
        },
      },
      visibleCurrentLevelSelectorIds: ['83c20c28-6e10-4acd-8590-06401d0e98c4'],
      revisionAdjacentSubtreeFields: {
        fields: [
          {
            id: '6b0608fd-aca6-43b9-80a5-358e0f92a1f4',
            type: 'entity',
            label: 'Transcriptie & Vertaling',
            selector: {
              id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
              type: 'box-selector',
              state: null,
              revisedBy: [
                {
                  id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
                  type: 'box-selector',
                  state: {
                    x: 756,
                    y: 600,
                    width: 160,
                    height: 788,
                  },
                  revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                  revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
                },
                {
                  id: '996976e0-618a-41d3-b6cd-19248fb57313',
                  type: 'box-selector',
                  state: {
                    x: 958,
                    y: 641,
                    width: 567.394987360801,
                    height: 772.4299219556424,
                  },
                  revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
                  revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
                },
              ],
            },
            properties: {
              Vertaling: [
                {
                  id: 'a6285ec6-7270-4904-a5e9-4931628c51fb',
                  type: 'text-field',
                  label: 'Vertaling',
                  value: 'asdasd',
                  multiline: true,
                  revision: '7568b1af-69b0-4b84-b799-a08854941e4c',
                  revises: '49ad96a6-4bc1-46b9-9c22-66be1a8cc31a',
                },
              ],
              Transcriptie: [
                {
                  id: 'cfc54aa6-cf64-4720-b2f2-06271cebf7e8',
                  type: 'text-field',
                  label: 'Transcriptie',
                  value: '',
                  multiline: true,
                },
              ],
            },
            description: 'Make a transcription',
            allowMultiple: false,
            immutable: true,
          },
        ],
        currentId: '6b0608fd-aca6-43b9-80a5-358e0f92a1f4',
      },
      visibleAdjacentSelectorIds: [],
      resolvedSelectors: [
        {
          id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
          type: 'box-selector',
          state: null,
          revisedBy: [
            {
              id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
              type: 'box-selector',
              state: {
                x: 756,
                y: 600,
                width: 160,
                height: 788,
              },
              revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
              revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
            },
            {
              id: '996976e0-618a-41d3-b6cd-19248fb57313',
              type: 'box-selector',
              state: {
                x: 958,
                y: 641,
                width: 567.394987360801,
                height: 772.4299219556424,
              },
              revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
              revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
            },
          ],
        },
        {
          id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
          type: 'box-selector',
          state: {
            x: 756,
            y: 600,
            width: 160,
            height: 788,
          },
          revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
          revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
        },
        {
          id: '996976e0-618a-41d3-b6cd-19248fb57313',
          type: 'box-selector',
          state: {
            x: 958,
            y: 641,
            width: 567.394987360801,
            height: 772.4299219556424,
          },
          revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
          revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
        },
      ],
      visibleCurrentLevelSelectors: [],
      topLevelSelector: {
        id: '83c20c28-6e10-4acd-8590-06401d0e98c4',
        type: 'box-selector',
        state: null,
        revisedBy: [
          {
            id: '8ef2fe94-3c2f-4696-afb0-0c89b2c9a3fb',
            type: 'box-selector',
            state: {
              x: 756,
              y: 600,
              width: 160,
              height: 788,
            },
            revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
            revisionId: '4d82fe50-7ea2-4c19-b417-0eb6677611f9',
          },
          {
            id: '996976e0-618a-41d3-b6cd-19248fb57313',
            type: 'box-selector',
            state: {
              x: 958,
              y: 641,
              width: 567.394987360801,
              height: 772.4299219556424,
            },
            revises: '83c20c28-6e10-4acd-8590-06401d0e98c4',
            revisionId: 'b92e5f67-c57e-422a-8c02-478b090c3d2f',
          },
        ],
      },
      visibleAdjacentSelectors: [],
    };
    const store = hydrateRevisionStore(state);

    expect(() => {
      JSON.stringify(
        store.getState().selector.availableSelectors.find(s => s.id === '83c20c28-6e10-4acd-8590-06401d0e98c4')
      );
    }).not.toThrow();

    store.dispatch.updateSelector({
      selectorId: '83c20c28-6e10-4acd-8590-06401d0e98c4',
      state: {
        x: 1943,
        y: 825,
        width: 450,
        height: 464,
      },
    });

    expect(() => {
      JSON.stringify(
        store.getState().selector.availableSelectors.find(s => s.id === '83c20c28-6e10-4acd-8590-06401d0e98c4')
      );
    }).not.toThrow();

    // expect(store.getState().selector.availableSelectors)
  });
});
