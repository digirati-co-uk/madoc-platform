import { filterEmptyFields } from '../../../src/frontend/shared/capture-models/helpers/field-post-filters';
import { filterCaptureModel } from '../../../src/frontend/shared/capture-models/helpers/filter-capture-model';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';

describe('filterCaptureModel', () => {
  const personModel: CaptureModel = require('../../../fixtures/02-nesting/05-nested-model-multiple.json');
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
      {
        "description": "",
        "id": "626422b1-abbf-4f46-b160-d9bb768b2e29",
        "label": "Nested choices",
        "properties": {
          "person": [
            {
              "allowMultiple": true,
              "description": "Describe a person",
              "id": "3036e4a5-c350-426b-82b5-8fafdfe55e27",
              "label": "Person",
              "labelledBy": "firstName",
              "properties": {
                "firstName": [
                  {
                    "id": "1da67423-f4a1-49e6-8561-55c40be47c00",
                    "label": "First name",
                    "type": "text-field",
                    "value": "first first name",
                  },
                ],
                "lastName": [
                  {
                    "id": "6b7ce0c3-2a13-4ea3-a190-822fee80176b",
                    "label": "Last name",
                    "type": "text-field",
                    "value": "first last name",
                  },
                ],
              },
              "type": "entity",
            },
            {
              "allowMultiple": true,
              "description": "Describe a person",
              "id": "41cf9550-af77-4310-82ca-130141ed215d",
              "label": "Person",
              "labelledBy": "firstName",
              "properties": {
                "firstName": [
                  {
                    "id": "f8678b43-f803-40b2-8e2e-fcc014631e1a",
                    "label": "First name",
                    "type": "text-field",
                    "value": "second first name",
                  },
                ],
                "lastName": [
                  {
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
      {
        "description": "",
        "id": "626422b1-abbf-4f46-b160-d9bb768b2e29",
        "label": "Nested choices",
        "properties": {
          "person": [
            {
              "allowMultiple": true,
              "description": "Describe a person",
              "id": "3036e4a5-c350-426b-82b5-8fafdfe55e27",
              "label": "Person",
              "labelledBy": "firstName",
              "properties": {
                "firstName": [
                  {
                    "id": "1da67423-f4a1-49e6-8561-55c40be47c00",
                    "label": "First name",
                    "type": "text-field",
                    "value": "first first name",
                  },
                ],
              },
              "type": "entity",
            },
            {
              "allowMultiple": true,
              "description": "Describe a person",
              "id": "41cf9550-af77-4310-82ca-130141ed215d",
              "label": "Person",
              "labelledBy": "firstName",
              "properties": {
                "firstName": [
                  {
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

  test('filter entity model root bug', () => {
    const rev = '63642c5e-5e37-4bba-af33-7e4b9dbf653e';
    const model = require(`../../../fixtures/97-bugs/06-model-root-filter.json`);
    const flatFields = [
      ['pp2transcription', 'pp2-name'],
      ['pp2transcription', 'pp2-address'],
      ['pp2transcription', 'pp2-difficult'],
      ['pp2transcription', 'pp2-empty'],
    ];
    const allRevisions = ['63642c5e-5e37-4bba-af33-7e4b9dbf653e', '178fca6d-3624-4b8a-9af7-2c50e4034edc'];

    const filtered = filterCaptureModel(
      rev,
      model.document,
      flatFields,
      (field, parent, key) => {
        if (field.revision) {
          return allRevisions.indexOf(field.revision) !== -1;
        }

        // This will show additional fields - but also empty entities.
        return true;
      },
      [
        // Filter empty fields.
        filterEmptyFields,
      ]
    );

    expect(filtered).toEqual(null);

    // console.log(JSON.stringify(filtered, null, 2));
    //
    // expect(filtered?.properties.pp2transcription).not.toHaveLength(0);
    // const keys = Object.keys((filtered?.properties.pp2transcription[0] as any).properties);
    // expect(keys).toEqual(['pp2-name', 'pp2-address', 'pp2-difficult', 'pp2-empty']);
  });
});
