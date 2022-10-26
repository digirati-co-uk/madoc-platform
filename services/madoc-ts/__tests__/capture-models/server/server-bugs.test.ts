import { updateRevisionInDocument } from '../../../src/capture-model-server/server-filters/update-revision-in-document';

describe('Capture model server bugs', () => {
  test('Japans project - should not delete original fields', () => {
    const fixture = {
      captureModel: {
        id: 'd3944d3b-4aaf-4eac-bbbb-7a978084866b',
        structure: {
          id: '925d7b59-ec4f-43b0-bc67-f6cc039de112',
          label: 'klassiek-japans',
          type: 'choice',
          items: [
            {
              id: 'df80021e-a6e9-4b92-8276-7f86ea67eec7',
              type: 'model',
              label: 'Default',
              fields: [['vertaling en transcriptie', ['vertaling', 'transcriptie']]],
            },
          ],
        },
        document: {
          id: '78231d5f-0ac9-46fb-8914-07c6cd0bdb82',
          type: 'entity',
          label: 'klassiek-japans',
          properties: {
            'vertaling en transcriptie': [
              {
                id: '4b1ef70a-fdf0-4ecd-9a1e-fe645765f9c4',
                type: 'entity',
                label: 'vertaling en transcriptie',
                selector: {
                  id: '4bb0cc03-56f5-4f86-91a6-a753ccf023c4',
                  type: 'box-selector',
                  state: null,
                  required: true,
                },
                properties: {
                  vertaling: [
                    { id: '8e799acb-90c9-4852-9e8c-ba7903c43fa7', type: 'text-field', label: 'vertaling', value: '' },
                  ],
                  transcriptie: [
                    {
                      id: '3ebbe019-5448-48f9-a92a-459aa59d6219',
                      type: 'text-field',
                      label: 'transcriptie',
                      value: '',
                    },
                  ],
                },
                allowMultiple: true,
              },
            ],
          },
        },
        revisions: [],
        derivedFrom: '19abcfe1-6303-48c7-9cd2-356302bb9d47',
        target: [
          { id: 'urn:madoc:manifest:173', type: 'Manifest' },
          { id: 'urn:madoc:canvas:286', type: 'Canvas' },
        ],
        contributors: {},
      },
      structure: {
        id: 'df80021e-a6e9-4b92-8276-7f86ea67eec7',
        type: 'model',
        label: 'Default',
        fields: [['vertaling en transcriptie', ['vertaling', 'transcriptie']]],
      },
      filterEmpty: true,
    } as any;

    const request = {
      captureModelId: 'd3944d3b-4aaf-4eac-bbbb-7a978084866b',
      revision: {
        id: 'f284c0e6-1b55-4268-af1a-cba8c2056946',
        fields: [['vertaling en transcriptie', ['vertaling', 'transcriptie']]],
        approved: false,
        structureId: 'df80021e-a6e9-4b92-8276-7f86ea67eec7',
        label: 'Default',
        revises: 'df80021e-a6e9-4b92-8276-7f86ea67eec7',
      },
      document: {
        id: '78231d5f-0ac9-46fb-8914-07c6cd0bdb82',
        type: 'entity',
        label: 'klassiek-japans',
        properties: {
          'vertaling en transcriptie': [
            {
              id: '4b1ef70a-fdf0-4ecd-9a1e-fe645765f9c4',
              type: 'entity',
              label: 'vertaling en transcriptie',
              selector: {
                id: '4bb0cc03-56f5-4f86-91a6-a753ccf023c4',
                type: 'box-selector',
                state: null,
                required: true,
                revisedBy: [
                  {
                    id: '2e41606c-d35a-41da-9700-b0d434f2084d',
                    type: 'box-selector',
                    state: { x: 716, y: 1594, width: 579, height: 557 },
                    required: true,
                    revisionId: 'f284c0e6-1b55-4268-af1a-cba8c2056946',
                    revises: '4bb0cc03-56f5-4f86-91a6-a753ccf023c4',
                  },
                ],
              },
              properties: {
                vertaling: [
                  {
                    id: '59cd2ead-25fd-4384-bbb8-d435fd02d1d0',
                    type: 'text-field',
                    label: 'vertaling',
                    value: 'a',
                    revision: 'f284c0e6-1b55-4268-af1a-cba8c2056946',
                    revises: '8e799acb-90c9-4852-9e8c-ba7903c43fa7',
                  },
                ],
                transcriptie: [
                  {
                    id: 'd544a7d9-3c6c-4d62-aaaa-548330ae9da3',
                    type: 'text-field',
                    label: 'transcriptie',
                    value: 'a',
                    revision: 'f284c0e6-1b55-4268-af1a-cba8c2056946',
                    revises: '3ebbe019-5448-48f9-a92a-459aa59d6219',
                  },
                ],
              },
              allowMultiple: true,
              immutable: true,
            },
            {
              id: '76abd494-2ead-4a81-995f-63e730d25b2f',
              type: 'entity',
              label: 'vertaling en transcriptie',
              selector: {
                id: '931e9391-f8b3-4453-93b5-9b879285c65d',
                type: 'box-selector',
                state: { x: 1488, y: 1344, width: 216, height: 239 },
                required: true,
              },
              allowMultiple: true,
              immutable: false,
              properties: {
                vertaling: [
                  {
                    id: '6df72c26-4e94-49cd-ae2c-fa15b76ab7ae',
                    type: 'text-field',
                    label: 'vertaling',
                    value: 'b',
                    revision: 'f284c0e6-1b55-4268-af1a-cba8c2056946',
                  },
                ],
                transcriptie: [
                  {
                    id: '255af78e-6fef-4cd6-b65d-973584c73efa',
                    type: 'text-field',
                    label: 'transcriptie',
                    value: 'b',
                    revision: 'f284c0e6-1b55-4268-af1a-cba8c2056946',
                  },
                ],
              },
              revision: 'f284c0e6-1b55-4268-af1a-cba8c2056946',
            },
          ],
        },
        immutable: true,
      },
      source: 'structure',
    } as any;

    updateRevisionInDocument(fixture.captureModel, request, {
      allowAnonymous: true,
      allowCanonicalChanges: true,
    });

    expect(fixture.captureModel).toMatchSnapshot();

    //
  });
});
