import { filterDocumentRevisions } from '../../../src/capture-model-server/server-filters/filter-document-revisions';

describe('Filter document revisions', () => {
  test('It can filter out new revision', () => {
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

    //
    const newDocument = filterDocumentRevisions(model.document, [], false);

    expect(newDocument).toMatchSnapshot();
  });
});
