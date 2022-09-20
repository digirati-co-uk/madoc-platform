import { extractValidUserRevisionsIds } from '../../../src/capture-model-server/server-filters/extract-valid-user-revisions-ids';
import { filterDocumentRevisions } from '../../../src/capture-model-server/server-filters/filter-document-revisions';

describe('Extract valid user revision ids', () => {
  test('It can extract own revisions', () => {
    const model: any = {
      id: '6017f74e-48c8-4c27-ad26-cc673b563659',
      structure: {
        id: '7b2a10da-587f-4f61-80b5-709effa2968f',
        type: 'choice',
        label: 'A project with boxes',
        items: [
          {
            id: '838088d6-9f53-4a67-9c57-307a7695ad51',
            type: 'model',
            label: 'Default',
            fields: [['boxes', ['description']], 'test'],
            modelRoot: ['boxes'],
          },
        ],
      },
      document: {
        id: 'bb5aa1ec-bdb3-4e99-a47d-12f9bbc01d52',
        type: 'entity',
        label: 'A project with boxes',
        properties: {
          boxes: [
            {
              id: '54bf43db-765b-43fa-a71f-a9084c1187c2',
              type: 'entity',
              label: 'boxes',
              revision: '5325ebc1-2331-4a0c-a77a-27c7413ef743',
              properties: {
                description: [
                  {
                    id: '3066d80b-6370-4e84-8f09-2d7eb3fbc379',
                    type: 'text-field',
                    label: 'Description',
                    value: 'test',
                    description: 'What is in your box',
                    revision: '5325ebc1-2331-4a0c-a77a-27c7413ef743',
                    minLines: 6,
                    multiline: true,
                  },
                ],
              },
              selector: {
                id: '388f0c61-e2bc-40c5-9c7c-dc4e5e1ffebe',
                type: 'box-selector',
                state: {
                  x: 860,
                  y: 616,
                  width: 480,
                  height: 408,
                },
              },
            },
            {
              id: 'feaa163d-0668-4557-9494-6aa80659e203',
              type: 'entity',
              label: 'boxes',
              properties: {
                description: [
                  {
                    id: 'b84f3423-a914-4b1b-bb7a-1248c093f334',
                    type: 'text-field',
                    label: 'Description',
                    value: '',
                    description: 'What is in your box',
                    minLines: 6,
                    multiline: true,
                  } as any,
                ],
              },
              selector: {
                id: '3e079573-4229-4886-8fcb-815f3d9ed729',
                type: 'box-selector',
                state: null,
              },
            },
          ],
          test: [
            {
              id: 'ce769b17-f9c2-4eb8-a3db-c4f13da5ce81',
              type: 'autocomplete-field',
              label: 'test',
              value: null,
              revises: '53d1e719-95c9-4be2-9889-3b947eb1e8a1',
              revision: '5325ebc1-2331-4a0c-a77a-27c7413ef743',
              preset: 'bentham',
            } as any,
            {
              id: '53d1e719-95c9-4be2-9889-3b947eb1e8a1',
              type: 'autocomplete-field',
              label: 'test',
              value: '',
              preset: 'bentham',
            },
          ],
        },
      },
      target: [
        {
          id: 'urn:madoc:collection:903',
          type: 'Collection',
        },
        {
          id: 'urn:madoc:manifest:904',
          type: 'Manifest',
        },
        {
          id: 'urn:madoc:canvas:942',
          type: 'Canvas',
        },
      ],
      profile: null,
      derivedFrom: '6c0c6464-b2e2-448c-8471-ddd5a3fa0d7a',
      revisions: [
        {
          structureId: '838088d6-9f53-4a67-9c57-307a7695ad51',
          approved: false,
          label: 'Default',
          id: '5325ebc1-2331-4a0c-a77a-27c7413ef743',
          fields: [['boxes', ['description']], 'test'],
          status: 'draft',
          revises: '838088d6-9f53-4a67-9c57-307a7695ad51',
          authors: ['urn:madoc:user:1'],
          deletedFields: null,
        },
      ],
      contributors: {
        'urn:madoc:user:1': {
          id: 'urn:madoc:user:1',
          type: 'Person',
          name: 'admin',
        },
      },
    };

    const user1 = extractValidUserRevisionsIds(model, 1);

    expect(user1).toMatchInlineSnapshot(`
      Object {
        "approvedRevisions": Array [],
        "excludedRevisions": Array [],
        "myRevisions": Array [
          "5325ebc1-2331-4a0c-a77a-27c7413ef743",
        ],
      }
    `);

    const user2 = extractValidUserRevisionsIds(model, 2);

    expect(user2).toMatchInlineSnapshot(`
      Object {
        "approvedRevisions": Array [],
        "excludedRevisions": Array [
          "5325ebc1-2331-4a0c-a77a-27c7413ef743",
        ],
        "myRevisions": Array [],
      }
    `);
  });

  test('approved submissions', () => {
    const model = {
      id: 'f3f73eff-0078-4175-9294-6a5805626e51',
      structure: {
        id: '7b2a10da-587f-4f61-80b5-709effa2968f',
        type: 'choice',
        label: 'A project with boxes',
        items: [
          {
            id: '838088d6-9f53-4a67-9c57-307a7695ad51',
            type: 'model',
            label: 'Default',
            fields: [['boxes', ['description']], 'test'],
            modelRoot: ['boxes'],
          },
        ],
      },
      document: {
        id: '906bf197-6fe5-4dd7-86c5-801d1b3537a3',
        type: 'entity',
        label: 'A project with boxes',
        properties: {
          boxes: [
            {
              id: '32c6f9bf-07ad-42c1-a8ce-c1763c15c885',
              type: 'entity',
              label: 'boxes',
              revision: '9d373b5c-10b4-4d66-91cc-72e68672de62',
              properties: {
                description: [
                  {
                    id: 'cf9106bc-f101-4889-90bc-475e9bc81034',
                    type: 'text-field',
                    label: 'Description',
                    value: 'Test another',
                    description: 'What is in your box',
                    revision: '9d373b5c-10b4-4d66-91cc-72e68672de62',
                    minLines: 6,
                    multiline: true,
                  },
                ],
              },
              selector: {
                id: 'ba6e3a2b-ad04-417e-9601-0b72968eae9f',
                type: 'box-selector',
                state: {
                  x: 1414,
                  y: 686,
                  width: 130,
                  height: 267,
                },
              },
            },
            {
              id: '1ffcdb0b-4611-4f8f-836e-ffbfdd7212bb',
              type: 'entity',
              label: 'boxes',
              revision: 'a05443af-f69d-4ff1-9d7e-c0c6915f3939',
              properties: {
                description: [
                  {
                    id: 'e7fc44e4-979b-46b8-8bd7-b0ff6a75211e',
                    type: 'text-field',
                    label: 'Description',
                    value: 'A wall',
                    description: 'What is in your box',
                    revision: 'a05443af-f69d-4ff1-9d7e-c0c6915f3939',
                    minLines: 6,
                    multiline: true,
                  },
                ],
              },
              selector: {
                id: 'dff1b279-03e9-4690-b18c-2e0e266609e5',
                type: 'box-selector',
                state: {
                  x: 631,
                  y: 1122,
                  width: 934,
                  height: 306,
                },
              },
            },
            {
              id: '1d39093b-b563-4831-97e0-c6805bab163e',
              type: 'entity',
              label: 'boxes',
              revision: 'be4df9b1-22af-4486-92a6-6355ca61ff2c',
              properties: {
                description: [
                  {
                    id: '09780f3e-36a7-40f9-b941-223c4c2f478f',
                    type: 'text-field',
                    label: 'Description',
                    value: 'b',
                    description: 'What is in your box',
                    revision: 'be4df9b1-22af-4486-92a6-6355ca61ff2c',
                    minLines: 6,
                    multiline: true,
                  },
                ],
              },
              selector: {
                id: '74a5e231-915e-40dd-85c6-d2b2e7ffec5f',
                type: 'box-selector',
                state: {
                  x: 1446,
                  y: 991,
                  width: 319,
                  height: 239,
                },
              },
            },
            {
              id: '0acc0d6a-4df3-441c-bd7e-c80a2f5283d5',
              type: 'entity',
              label: 'boxes',
              revision: 'b7051f66-3937-4d7f-940e-2f9aae701ade',
              properties: {
                description: [
                  {
                    id: 'fb3c9b24-d850-45c7-9f24-c3140861ca2d',
                    type: 'text-field',
                    label: 'Description',
                    value: 'asdasd',
                    description: 'What is in your box',
                    revision: 'b7051f66-3937-4d7f-940e-2f9aae701ade',
                    minLines: 6,
                    multiline: true,
                  },
                ],
              },
              selector: {
                id: 'ca94b29b-7618-426f-ab00-56ff652da0ec',
                type: 'box-selector',
                state: {
                  x: 1910,
                  y: 319,
                  width: 329,
                  height: 775,
                },
              },
            },
            {
              id: '01ee1e5f-69c4-4650-aada-a69bce1a27e3',
              type: 'entity',
              label: 'boxes',
              properties: {
                description: [
                  {
                    id: 'fb93c90e-5875-4a0d-8163-7006059d7ed0',
                    type: 'text-field',
                    label: 'Description',
                    value: '',
                    description: 'What is in your box',
                    minLines: 6,
                    multiline: true,
                  },
                ],
              },
              selector: {
                id: 'a4ab51a8-d4fe-40e8-ade5-44957bcc3ae0',
                type: 'box-selector',
                state: null,
              },
            },
          ],
        },
      },
      target: [
        {
          id: 'urn:madoc:collection:903',
          type: 'Collection',
        },
        {
          id: 'urn:madoc:manifest:904',
          type: 'Manifest',
        },
        {
          id: 'urn:madoc:canvas:941',
          type: 'Canvas',
        },
      ],
      profile: null,
      derivedFrom: '6c0c6464-b2e2-448c-8471-ddd5a3fa0d7a',
      revisions: [
        {
          structureId: '838088d6-9f53-4a67-9c57-307a7695ad51',
          approved: true,
          label: 'Default',
          id: 'b7051f66-3937-4d7f-940e-2f9aae701ade',
          fields: [['boxes', ['description']]],
          status: 'accepted',
          revises: '838088d6-9f53-4a67-9c57-307a7695ad51',
          authors: ['urn:madoc:user:1'],
          deletedFields: null,
        },
        {
          structureId: '838088d6-9f53-4a67-9c57-307a7695ad51',
          approved: true,
          label: 'Default',
          id: 'be4df9b1-22af-4486-92a6-6355ca61ff2c',
          fields: [['boxes', ['description']]],
          status: 'accepted',
          revises: '838088d6-9f53-4a67-9c57-307a7695ad51',
          authors: ['urn:madoc:user:1'],
          deletedFields: null,
        },
        {
          structureId: '838088d6-9f53-4a67-9c57-307a7695ad51',
          approved: false,
          label: 'Default',
          id: '9d373b5c-10b4-4d66-91cc-72e68672de62',
          fields: [['boxes', ['description']], 'test'],
          status: 'draft',
          revises: '838088d6-9f53-4a67-9c57-307a7695ad51',
          authors: ['urn:madoc:user:1'],
          deletedFields: null,
        },
        {
          structureId: '838088d6-9f53-4a67-9c57-307a7695ad51',
          approved: true,
          label: 'Default',
          id: 'a05443af-f69d-4ff1-9d7e-c0c6915f3939',
          fields: [['boxes', ['description']]],
          status: 'accepted',
          revises: '838088d6-9f53-4a67-9c57-307a7695ad51',
          authors: ['urn:madoc:user:1'],
          deletedFields: null,
        },
      ],
      contributors: {
        'urn:madoc:user:1': {
          id: 'urn:madoc:user:1',
          type: 'Person',
          name: 'admin',
        },
      },
    } as any;

    const user1 = extractValidUserRevisionsIds(model, 1);
    expect(user1).toMatchInlineSnapshot(`
      Object {
        "approvedRevisions": Array [
          "b7051f66-3937-4d7f-940e-2f9aae701ade",
          "be4df9b1-22af-4486-92a6-6355ca61ff2c",
          "a05443af-f69d-4ff1-9d7e-c0c6915f3939",
        ],
        "excludedRevisions": Array [],
        "myRevisions": Array [
          "b7051f66-3937-4d7f-940e-2f9aae701ade",
          "be4df9b1-22af-4486-92a6-6355ca61ff2c",
          "9d373b5c-10b4-4d66-91cc-72e68672de62",
          "a05443af-f69d-4ff1-9d7e-c0c6915f3939",
        ],
      }
    `);

    const user2 = extractValidUserRevisionsIds(model, 2);
    expect(user2).toMatchInlineSnapshot(`
      Object {
        "approvedRevisions": Array [
          "b7051f66-3937-4d7f-940e-2f9aae701ade",
          "be4df9b1-22af-4486-92a6-6355ca61ff2c",
          "a05443af-f69d-4ff1-9d7e-c0c6915f3939",
        ],
        "excludedRevisions": Array [
          "9d373b5c-10b4-4d66-91cc-72e68672de62",
        ],
        "myRevisions": Array [],
      }
    `);
  });
});
