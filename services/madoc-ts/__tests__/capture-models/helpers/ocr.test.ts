jest.mock('.../../../src/frontend/shared/capture-models/helpers/generate-id', () => {
  return {
    __esModule: true,
    generateId() {
      return '[auto-generated]';
    },
  };
});

import * as React from 'react';
import { createRevisionDocument } from '../../../src/frontend/shared/capture-models/helpers/create-revision-document';
import { validateRevision } from '../../../src/frontend/shared/capture-models/helpers/validate-revision';
import { traverseDocument } from '../../../src/frontend/shared/capture-models/helpers/traverse-document';
import { registerField } from '../../../src/frontend/shared/capture-models/plugin-api/global-store';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../../src/frontend/shared/capture-models/types/field-types';
import { RevisionRequest } from '../../../src/frontend/shared/capture-models/types/revision-request';

registerField({
  type: 'text-field',
  allowMultiple: true,
  defaultValue: '',
  TextPreview: props => props.value,
  Component: () => React.createElement(React.Fragment),
  defaultProps: {},
  description: '',
  Editor: () => React.createElement(React.Fragment),
  label: '',
});

// import { fieldsToInserts } from '../../../database/src/utility/fields-to-inserts';

function getModel() {
  return require('../../../../fixtures/02-nesting/06-ocr.json') as CaptureModel;
}
function getRevisionA() {
  return require('../../../../fixtures/98-revision-requests/add-ocr-text.json') as RevisionRequest;
}

describe('OCR Capture model', () => {
  // Granularity
  test('When I see a typo in a word, I can make a correction only for that single word', () => {
    const model = getModel();
    const newRevisionId = '[generated]';
    const mode = 'FORK_SOME_VALUES';
    const modelRoot: string[] = ['transcription', 'lines'];
    const modelMapping: any = {
      transcription: 'b2867260-78e3-484f-8549-40a89a55d51c', // First paragraph.
      lines: 'a9d8cae8-db25-4880-bc33-e4c0ff192939', // 4th Line.
    };
    const fieldsToEdit = ['a29eb861-a893-4f2d-a3d2-e420ea405e4a'];
    // How to do it in code?
    const revisionDoc = createRevisionDocument(
      newRevisionId,
      model.document,
      mode,
      modelRoot,
      modelMapping,
      fieldsToEdit
    );

    expect(revisionDoc).toMatchInlineSnapshot(`
      Object {
        "id": "aa2344b4-a70b-41cf-aa62-5e211e76ee2c",
        "immutable": true,
        "label": "Untitled document",
        "properties": Object {
          "transcription": Array [
            Object {
              "allowMultiple": false,
              "description": "Region of the page denoting a single paragraph",
              "id": "b2867260-78e3-484f-8549-40a89a55d51c",
              "immutable": true,
              "label": "Paragraph",
              "labelledBy": "lines",
              "pluralLabel": "Paragraphs",
              "properties": Object {
                "lines": Array [
                  Object {
                    "allowMultiple": false,
                    "description": "All of the lines inside of a paragraph",
                    "id": "a9d8cae8-db25-4880-bc33-e4c0ff192939",
                    "immutable": true,
                    "label": "Line",
                    "labelledBy": "text",
                    "pluralLabel": "Lines",
                    "properties": Object {
                      "text": Array [
                        Object {
                          "allowMultiple": true,
                          "description": "Single word, phrase or the whole line",
                          "id": "[auto-generated]",
                          "label": "Text of line",
                          "pluralField": "Text of lines",
                          "previewInline": true,
                          "revises": "a29eb861-a893-4f2d-a3d2-e420ea405e4a",
                          "revision": "[generated]",
                          "selector": Object {
                            "id": "[auto-generated]",
                            "state": Object {
                              "height": 48,
                              "width": 265,
                              "x": 746,
                              "y": 2504,
                            },
                            "type": "box-selector",
                          },
                          "type": "text-field",
                          "value": "beglücken.",
                        },
                      ],
                    },
                    "selector": Object {
                      "id": "98751c14-a342-4958-9803-5e0bd5d11b6a",
                      "state": Object {
                        "height": 53,
                        "width": 1695,
                        "x": 312,
                        "y": 2499,
                      },
                      "type": "box-selector",
                    },
                    "type": "entity",
                  },
                ],
              },
              "selector": Object {
                "id": "750603ef-bf14-464a-b812-6540f53497dd",
                "state": Object {
                  "height": 2582,
                  "width": 1730,
                  "x": 296,
                  "y": 310,
                },
                "type": "box-selector",
              },
              "type": "entity",
            },
          ],
        },
        "type": "entity",
      }
    `);
  });
  test('When I see a few typos in a line, I can make a correction only for that line', () => {
    // I want to replace the line entity.
    const model = getModel();
    const newRevisionId = '[generated]';
    const mode = 'FORK_LISTED_VALUES';
    const modelRoot: string[] = ['transcription', 'lines'];
    const modelMapping: any = {
      transcription: 'b2867260-78e3-484f-8549-40a89a55d51c', // First paragraph.
      lines: 'a9d8cae8-db25-4880-bc33-e4c0ff192939', // 4th Line.
    };
    // How to do it in code?
    const revisionDoc = createRevisionDocument(newRevisionId, model.document, mode, modelRoot, modelMapping);

    expect(revisionDoc).toMatchInlineSnapshot(`
Object {
  "id": "aa2344b4-a70b-41cf-aa62-5e211e76ee2c",
  "immutable": true,
  "label": "Untitled document",
  "properties": Object {
    "transcription": Array [
      Object {
        "allowMultiple": false,
        "description": "Region of the page denoting a single paragraph",
        "id": "b2867260-78e3-484f-8549-40a89a55d51c",
        "immutable": true,
        "label": "Paragraph",
        "labelledBy": "lines",
        "pluralLabel": "Paragraphs",
        "properties": Object {
          "lines": Array [
            Object {
              "allowMultiple": false,
              "description": "All of the lines inside of a paragraph",
              "id": "[auto-generated]",
              "immutable": false,
              "label": "Line",
              "labelledBy": "text",
              "pluralLabel": "Lines",
              "properties": Object {
                "text": Array [
                  Object {
                    "allowMultiple": true,
                    "description": "Single word, phrase or the whole line",
                    "id": "[auto-generated]",
                    "label": "Text of line",
                    "pluralField": "Text of lines",
                    "previewInline": true,
                    "revision": "[generated]",
                    "selector": Object {
                      "id": "[auto-generated]",
                      "state": Object {
                        "height": 39,
                        "width": 262,
                        "x": 312,
                        "y": 2503,
                      },
                      "type": "box-selector",
                    },
                    "type": "text-field",
                    "value": "bereidiern",
                  },
                  Object {
                    "allowMultiple": true,
                    "description": "Single word, phrase or the whole line",
                    "id": "[auto-generated]",
                    "label": "Text of line",
                    "pluralField": "Text of lines",
                    "previewInline": true,
                    "revision": "[generated]",
                    "selector": Object {
                      "id": "[auto-generated]",
                      "state": Object {
                        "height": 38,
                        "width": 92,
                        "x": 617,
                        "y": 2504,
                      },
                      "type": "box-selector",
                    },
                    "type": "text-field",
                    "value": "und",
                  },
                  Object {
                    "allowMultiple": true,
                    "description": "Single word, phrase or the whole line",
                    "id": "[auto-generated]",
                    "label": "Text of line",
                    "pluralField": "Text of lines",
                    "previewInline": true,
                    "revision": "[generated]",
                    "selector": Object {
                      "id": "[auto-generated]",
                      "state": Object {
                        "height": 48,
                        "width": 265,
                        "x": 746,
                        "y": 2504,
                      },
                      "type": "box-selector",
                    },
                    "type": "text-field",
                    "value": "beglücken.",
                  },
                  Object {
                    "allowMultiple": true,
                    "description": "Single word, phrase or the whole line",
                    "id": "[auto-generated]",
                    "label": "Text of line",
                    "pluralField": "Text of lines",
                    "previewInline": true,
                    "revision": "[generated]",
                    "selector": Object {
                      "id": "[auto-generated]",
                      "state": Object {
                        "height": 37,
                        "width": 111,
                        "x": 1065,
                        "y": 2504,
                      },
                      "type": "box-selector",
                    },
                    "type": "text-field",
                    "value": "Man",
                  },
                  Object {
                    "allowMultiple": true,
                    "description": "Single word, phrase or the whole line",
                    "id": "[auto-generated]",
                    "label": "Text of line",
                    "pluralField": "Text of lines",
                    "previewInline": true,
                    "revision": "[generated]",
                    "selector": Object {
                      "id": "[auto-generated]",
                      "state": Object {
                        "height": 43,
                        "width": 126,
                        "x": 1216,
                        "y": 2504,
                      },
                      "type": "box-selector",
                    },
                    "type": "text-field",
                    "value": "lernt,",
                  },
                  Object {
                    "allowMultiple": true,
                    "description": "Single word, phrase or the whole line",
                    "id": "[auto-generated]",
                    "label": "Text of line",
                    "pluralField": "Text of lines",
                    "previewInline": true,
                    "revision": "[generated]",
                    "selector": Object {
                      "id": "[auto-generated]",
                      "state": Object {
                        "height": 37,
                        "width": 153,
                        "x": 1394,
                        "y": 2503,
                      },
                      "type": "box-selector",
                    },
                    "type": "text-field",
                    "value": "indem",
                  },
                  Object {
                    "allowMultiple": true,
                    "description": "Single word, phrase or the whole line",
                    "id": "[auto-generated]",
                    "label": "Text of line",
                    "pluralField": "Text of lines",
                    "previewInline": true,
                    "revision": "[generated]",
                    "selector": Object {
                      "id": "[auto-generated]",
                      "state": Object {
                        "height": 27,
                        "width": 105,
                        "x": 1595,
                        "y": 2512,
                      },
                      "type": "box-selector",
                    },
                    "type": "text-field",
                    "value": "man",
                  },
                  Object {
                    "allowMultiple": true,
                    "description": "Single word, phrase or the whole line",
                    "id": "[auto-generated]",
                    "label": "Text of line",
                    "pluralField": "Text of lines",
                    "previewInline": true,
                    "revision": "[generated]",
                    "selector": Object {
                      "id": "[auto-generated]",
                      "state": Object {
                        "height": 40,
                        "width": 99,
                        "x": 1739,
                        "y": 2499,
                      },
                      "type": "box-selector",
                    },
                    "type": "text-field",
                    "value": "aufs",
                  },
                  Object {
                    "allowMultiple": true,
                    "description": "Single word, phrase or the whole line",
                    "id": "[auto-generated]",
                    "label": "Text of line",
                    "pluralField": "Text of lines",
                    "previewInline": true,
                    "revision": "[generated]",
                    "selector": Object {
                      "id": "[auto-generated]",
                      "state": Object {
                        "height": 37,
                        "width": 131,
                        "x": 1876,
                        "y": 2500,
                      },
                      "type": "box-selector",
                    },
                    "type": "text-field",
                    "value": "beste",
                  },
                ],
              },
              "revises": "a9d8cae8-db25-4880-bc33-e4c0ff192939",
              "revision": "[generated]",
              "selector": Object {
                "id": "[auto-generated]",
                "state": Object {
                  "height": 53,
                  "width": 1695,
                  "x": 312,
                  "y": 2499,
                },
                "type": "box-selector",
              },
              "type": "entity",
            },
          ],
        },
        "selector": Object {
          "id": "750603ef-bf14-464a-b812-6540f53497dd",
          "state": Object {
            "height": 2582,
            "width": 1730,
            "x": 296,
            "y": 310,
          },
          "type": "box-selector",
        },
        "type": "entity",
      },
    ],
  },
  "type": "entity",
}
`);
  });
  test.todo('When I see a many typos I can make a correction for multiple lines');
  test.todo('When I want to replace the whole transcription, I can fork the whole model');

  // Saving
  test.todo('If I fork the whole transcription when I merge there still only exists one single transcription');
  test.todo('If I remove a field, the field will be removed when saving the model');
  test.todo('If I remove add a field, it will be place in the correct order.');

  describe('saving revision', () => {
    const captureModel = getModel();
    const req = getRevisionA();

    test('validation', () => {
      expect(() =>
        validateRevision(req, captureModel, {
          allowAnonymous: true,
          allowCanonicalChanges: false,
          allowCustomStructure: true,
        })
      ).not.toThrow();
    });

    test('addingFields', () => {
      const fieldsToAdd: Array<{ field: BaseField; term: string; parent: CaptureModel['document'] }> = [];
      const docsToHydrate: Array<{
        entity: CaptureModel['document'];
        term?: string;
        parent?: CaptureModel['document'];
      }> = [];

      traverseDocument(req.document, {
        visitField(field, term, parent) {
          if (parent.immutable) {
            fieldsToAdd.push({ field, term, parent });
          }
        },
        visitEntity(entity, term, parent) {
          if (entity.immutable === false && parent && parent.immutable) {
            docsToHydrate.push({ entity, term, parent });
          }
        },
      });

      expect(fieldsToAdd).toHaveLength(1);
      expect(docsToHydrate).toHaveLength(0);
    });
  });
});
