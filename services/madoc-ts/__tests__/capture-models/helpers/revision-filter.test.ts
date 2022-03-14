const single01 = require('../../../fixtures/03-revisions/01-single-field-with-revision.json');
const single02 = require('../../../fixtures/03-revisions/02-single-field-with-multiple-revisions.json');
const single03 = require('../../../fixtures/03-revisions/03-nested-revision.json');
const single04 = require('../../../fixtures/03-revisions/04-dual-transcription.json');
const single05 = require('../../../fixtures/03-revisions/05-allow-multiple-transcriptions.json');
import { revisionFilter } from '../../../src/frontend/shared/capture-models/helpers/revision-filter';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';

describe('revisionFilter', () => {
  test('single-field-with-revision non-existent', () => {
    expect(revisionFilter(single01 as CaptureModel, 'NOPE')).toMatchInlineSnapshot(`null`);
  });
  test('single-field-with-revision', () => {
    expect(revisionFilter(single01 as CaptureModel, '7c26cf57-5950-4849-b533-11e0ee4afa4b')).toMatchInlineSnapshot(`
      Object {
        "captureModelId": "b329e009-1c8a-4bed-bfde-c2a587a22f97",
        "document": Object {
          "description": "",
          "id": "3353dc03-9f35-49e7-9b81-4090fa533c64",
          "label": "Simple document",
          "properties": Object {
            "name": Array [
              Object {
                "description": "The name of the thing",
                "id": "eafb62d7-71b7-47bd-b887-def8655d8d2a",
                "label": "Name",
                "revision": "7c26cf57-5950-4849-b533-11e0ee4afa4b",
                "type": "text-field",
                "value": "Some value that was submitted",
              },
            ],
          },
          "type": "entity",
        },
        "revision": Object {
          "fields": Array [
            "name",
          ],
          "id": "7c26cf57-5950-4849-b533-11e0ee4afa4b",
          "structureId": "31b27c9b-2388-47df-b6f4-73fb4878c1fa",
        },
        "source": "structure",
      }
    `);
  });
  test('single-field-with-multiple-revisions', () => {
    expect(revisionFilter(single02 as CaptureModel, 'test-person-a')).toMatchInlineSnapshot(`null`);
    expect(revisionFilter(single02 as CaptureModel, 'test-person-b')).toMatchInlineSnapshot(`null`);
  });
  test('nested-revision', () => {
    expect(revisionFilter(single03 as CaptureModel, 'fa500021-7408-4318-ab05-ac6e4d4a3096')).toMatchInlineSnapshot(`
Object {
  "captureModelId": "2cc4131d-4f8d-4ceb-b140-48cd513b5e4f",
  "document": Object {
    "description": "",
    "id": "a8d5ff43-adb2-456a-a615-3d24fbfa05f7",
    "label": "Nested choices",
    "properties": Object {
      "person": Array [
        Object {
          "description": "Describe a person",
          "id": "5c8a5874-8bca-422c-be71-300612d67c72",
          "label": "Person",
          "properties": Object {
            "firstName": Array [
              Object {
                "id": "dda6d8bc-ca6d-48e0-8bcc-a24537586346",
                "label": "First name",
                "revision": "fa500021-7408-4318-ab05-ac6e4d4a3096",
                "type": "text-field",
                "value": "Some value",
              },
            ],
          },
          "type": "entity",
        },
      ],
    },
    "type": "entity",
  },
  "revision": Object {
    "fields": Array [
      Array [
        "person",
        Array [
          "firstName",
          "lastName",
        ],
      ],
      "name",
    ],
    "id": "fa500021-7408-4318-ab05-ac6e4d4a3096",
  },
  "source": "structure",
}
`);
  });
  test('dual-transcription', () => {
    expect(revisionFilter(single04 as any, 'test-person-a')).toMatchInlineSnapshot(`null`);
    expect(revisionFilter(single04 as any, 'test-person-b')).toMatchInlineSnapshot(`null`);
  });
  test('allow-multiple-transcriptions', () => {
    expect(revisionFilter(single05 as any, 'test-person-a')).toMatchInlineSnapshot(`null`);
    expect(revisionFilter(single05 as any, 'test-person-b')).toMatchInlineSnapshot(`null`);
    expect(revisionFilter(single05 as any, 'test-person-c')).toMatchInlineSnapshot(`null`);
  });
});
