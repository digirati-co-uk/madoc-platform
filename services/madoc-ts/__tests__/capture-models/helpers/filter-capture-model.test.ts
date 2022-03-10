import { filterCaptureModel } from '../../../src/frontend/shared/capture-models/helpers/filter-capture-model';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';

describe('filterCaptureModel', () => {
  const personModel: CaptureModel = require('../../../../fixtures/02-nesting/05-nested-model-multiple.json');
  test('non-filter entity maintains structure', () => {
    const filtered = filterCaptureModel(
      'something',
      personModel.document,
      [
        ['person', 'firstName'],
        ['person', 'lastName'],
      ],
      () => true
    );

    expect(filtered).toMatchInlineSnapshot(`
      Object {
        "description": "",
        "id": "626422b1-abbf-4f46-b160-d9bb768b2e29",
        "label": "Nested choices",
        "properties": Object {
          "person": Array [
            Object {
              "allowMultiple": true,
              "description": "Describe a person",
              "id": "3036e4a5-c350-426b-82b5-8fafdfe55e27",
              "label": "Person",
              "labelledBy": "firstName",
              "properties": Object {
                "firstName": Array [
                  Object {
                    "id": "1da67423-f4a1-49e6-8561-55c40be47c00",
                    "label": "First name",
                    "type": "text-field",
                    "value": "first first name",
                  },
                ],
                "lastName": Array [
                  Object {
                    "id": "6b7ce0c3-2a13-4ea3-a190-822fee80176b",
                    "label": "Last name",
                    "type": "text-field",
                    "value": "first last name",
                  },
                ],
              },
              "type": "entity",
            },
            Object {
              "allowMultiple": true,
              "description": "Describe a person",
              "id": "41cf9550-af77-4310-82ca-130141ed215d",
              "label": "Person",
              "labelledBy": "firstName",
              "properties": Object {
                "firstName": Array [
                  Object {
                    "id": "f8678b43-f803-40b2-8e2e-fcc014631e1a",
                    "label": "First name",
                    "type": "text-field",
                    "value": "second first name",
                  },
                ],
                "lastName": Array [
                  Object {
                    "id": "12e92ef6-6ebc-49af-95b3-42718ac92c26",
                    "label": "Last name",
                    "type": "text-field",
                    "value": "second last name",
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

  test('filter entity maintains structure', () => {
    const filtered = filterCaptureModel('something', personModel.document, [['person', 'firstName']], () => true);

    expect(filtered).toMatchInlineSnapshot(`
      Object {
        "description": "",
        "id": "626422b1-abbf-4f46-b160-d9bb768b2e29",
        "label": "Nested choices",
        "properties": Object {
          "person": Array [
            Object {
              "allowMultiple": true,
              "description": "Describe a person",
              "id": "3036e4a5-c350-426b-82b5-8fafdfe55e27",
              "label": "Person",
              "labelledBy": "firstName",
              "properties": Object {
                "firstName": Array [
                  Object {
                    "id": "1da67423-f4a1-49e6-8561-55c40be47c00",
                    "label": "First name",
                    "type": "text-field",
                    "value": "first first name",
                  },
                ],
              },
              "type": "entity",
            },
            Object {
              "allowMultiple": true,
              "description": "Describe a person",
              "id": "41cf9550-af77-4310-82ca-130141ed215d",
              "label": "Person",
              "labelledBy": "firstName",
              "properties": Object {
                "firstName": Array [
                  Object {
                    "id": "f8678b43-f803-40b2-8e2e-fcc014631e1a",
                    "label": "First name",
                    "type": "text-field",
                    "value": "second first name",
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
});
