import { captureModelShorthand } from '@capture-models/helpers';
import { documentFragmentWrapper } from '../../src/frontend/shared/caputre-models/utility/document-fragment-wrapper';
import { documentToDefaultStructure } from '../../src/frontend/shared/caputre-models/utility/document-to-default-structure';
import { siteConfigurationModel } from '../../src/frontend/shared/configuration/site-config';

describe('document to default structure', () => {
  test('site config', () => {
    const doc = captureModelShorthand(siteConfigurationModel);

    expect(documentToDefaultStructure(doc)).toMatchInlineSnapshot(`
      Array [
        "allowCollectionNavigation",
        "allowManifestNavigation",
        "allowCanvasNavigation",
        "randomlyAssignCanvas",
        "priorityRandomness",
        "claimGranularity",
        "maxContributionsPerResource",
        "allowSubmissionsWhenCanvasComplete",
        "randomlyAssignReviewer",
        "manuallyAssignedReviewer",
        "adminsAreReviewers",
        "hideCompletedResources",
        "revisionApprovalsRequired",
        "contributionWarningTime",
        "skipAutomaticOCRImport",
        "defaultEditorOrientation",
        "skipManifestListingPage",
        "hideStatistics",
        "hideProjectCollectionNavigation",
        "hideProjectManifestNavigation",
        "searchStrategy",
        "hideManifestMetadataOnCanvas",
        "hideCanvasThumbnailNavigation",
        "showSearchFacetCount",
        "miradorCanvasPage",
        "contributionMode",
        "modelPageOptions",
        "projectPageOptions",
        "manifestPageOptions",
        "headerOptions",
        "searchOptions",
      ]
    `);
  });

  const paragraphs = {
    id: '',
    label: 'Root',
    type: 'entity',
    properties: {
      paragraph: [
        {
          allowMultiple: true,
          description: 'Region of the page denoting a single paragraph',
          id: '6778df2b-adcc-4e31-92dd-6b13ffdacde1',
          label: 'Paragraph',
          labelledBy: 'lines',
          pluralLabel: 'Paragraphs',
          properties: {
            lines: [
              {
                allowMultiple: true,
                description: 'All of the lines inside of a paragraph',
                id: '9e8a07e0-4288-49f6-a808-1015c965fd2f',
                label: 'Line',
                labelledBy: 'text',
                pluralLabel: 'Lines',
                properties: {
                  text: [
                    {
                      allowMultiple: true,
                      description: 'Single word, phrase or the whole line',
                      id: '0368274e-dc81-4d46-b362-99f8125dfd4f',
                      label: 'Text of line',
                      selector: {
                        id: '3ef44d17-793d-4db6-b0c6-30562ed77827',
                        state: { height: 32, width: 105, x: 117, y: 172 },
                        type: 'box-selector',
                      },
                      type: 'text-field',
                      value: 'Alles',
                    },
                  ],
                },
                selector: {
                  id: 'd8349c6c-7aff-47d7-a66b-2033ae8c3447',
                  state: { height: 32, width: 705, x: 117, y: 172 },
                  type: 'box-selector',
                },
                type: 'entity',
              },
            ],
          },
          selector: {
            id: '00ea0eab-b367-4525-9f72-5efa4742b2ea',
            state: { height: 2532, width: 1794, x: 102, y: 150 },
            type: 'box-selector',
          },
          type: 'entity',
        },
      ],
    },
  };

  test('nested paragraph', () => {
    expect(documentToDefaultStructure(paragraphs as any)).toMatchInlineSnapshot(`
      Array [
        Array [
          "paragraph",
          Array [
            Array [
              "lines",
              Array [
                "text",
              ],
            ],
          ],
        ],
      ]
    `);
  });

  test('document-fragment-wrapper', () => {
    expect(documentFragmentWrapper(paragraphs.properties as any)).toMatchInlineSnapshot(
      {
        id: expect.any(String),
        document: {
          id: expect.any(String),
        },
        structure: {
          id: expect.any(String),
        },
      } as any,
      `
      Object {
        "document": Object {
          "id": Any<String>,
          "label": "Untitled document",
          "properties": Object {
            "paragraph": Array [
              Object {
                "allowMultiple": true,
                "description": "Region of the page denoting a single paragraph",
                "id": "6778df2b-adcc-4e31-92dd-6b13ffdacde1",
                "label": "Paragraph",
                "labelledBy": "lines",
                "pluralLabel": "Paragraphs",
                "properties": Object {
                  "lines": Array [
                    Object {
                      "allowMultiple": true,
                      "description": "All of the lines inside of a paragraph",
                      "id": "9e8a07e0-4288-49f6-a808-1015c965fd2f",
                      "label": "Line",
                      "labelledBy": "text",
                      "pluralLabel": "Lines",
                      "properties": Object {
                        "text": Array [
                          Object {
                            "allowMultiple": true,
                            "description": "Single word, phrase or the whole line",
                            "id": "0368274e-dc81-4d46-b362-99f8125dfd4f",
                            "label": "Text of line",
                            "selector": Object {
                              "id": "3ef44d17-793d-4db6-b0c6-30562ed77827",
                              "state": Object {
                                "height": 32,
                                "width": 105,
                                "x": 117,
                                "y": 172,
                              },
                              "type": "box-selector",
                            },
                            "type": "text-field",
                            "value": "Alles",
                          },
                        ],
                      },
                      "selector": Object {
                        "id": "d8349c6c-7aff-47d7-a66b-2033ae8c3447",
                        "state": Object {
                          "height": 32,
                          "width": 705,
                          "x": 117,
                          "y": 172,
                        },
                        "type": "box-selector",
                      },
                      "type": "entity",
                    },
                  ],
                },
                "selector": Object {
                  "id": "00ea0eab-b367-4525-9f72-5efa4742b2ea",
                  "state": Object {
                    "height": 2532,
                    "width": 1794,
                    "x": 102,
                    "y": 150,
                  },
                  "type": "box-selector",
                },
                "type": "entity",
              },
            ],
          },
          "type": "entity",
        },
        "id": Any<String>,
        "structure": Object {
          "fields": Array [
            Array [
              "paragraph",
              Array [
                Array [
                  "lines",
                  Array [
                    "text",
                  ],
                ],
              ],
            ],
          ],
          "id": Any<String>,
          "label": "Wrapper",
          "type": "model",
        },
      }
    `
    );
  });
});
