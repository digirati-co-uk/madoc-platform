import { setValueDotNotation } from '../src/utility/iiif-metadata';
import { mapMetadataList } from '../src/utility/map-metadata-list';

describe('test', () => {
  describe('mapMetadataList', () => {
    test('simple list', () => {
      const list = mapMetadataList({
        fields: [{ id: 1, key: 'label', value: 'First label', language: 'en' }],
      });

      expect(list).toMatchInlineSnapshot(`
        Object {
          "label": Object {
            "items": Array [
              Object {
                "id": 1,
                "key": "label",
                "language": "en",
                "value": "First label",
              },
            ],
            "type": "values",
          },
        }
      `);
    });

    test('2 properties list', () => {
      const list = mapMetadataList({
        fields: [
          { id: 1, key: 'label', value: 'First label', language: 'en' },
          { id: 2, key: 'label', value: 'Second label', language: 'es' },
        ],
      });

      expect(list).toMatchInlineSnapshot(`
        Object {
          "label": Object {
            "items": Array [
              Object {
                "id": 1,
                "key": "label",
                "language": "en",
                "value": "First label",
              },
              Object {
                "id": 2,
                "key": "label",
                "language": "es",
                "value": "Second label",
              },
            ],
            "type": "values",
          },
        }
      `);
    });

    test('different properties', () => {
      const list = mapMetadataList({
        fields: [
          { id: 1, key: 'label', value: 'First label', language: 'en' },
          { id: 3, key: 'summary', value: 'some summary', language: 'en' },
        ],
      });

      expect(list).toMatchInlineSnapshot(`
        Object {
          "label": Object {
            "items": Array [
              Object {
                "id": 1,
                "key": "label",
                "language": "en",
                "value": "First label",
              },
            ],
            "type": "values",
          },
          "summary": Object {
            "items": Array [
              Object {
                "id": 3,
                "key": "summary",
                "language": "en",
                "value": "some summary",
              },
            ],
            "type": "values",
          },
        }
      `);
    });

    test('array property', () => {
      const list = mapMetadataList({
        fields: [
          { id: 1, key: 'metadata.0.label', value: 'First label', language: 'en' },
          { id: 2, key: 'metadata.0.value', value: 'First value', language: 'en' },
        ],
      });

      expect(list).toMatchInlineSnapshot(`
        Object {
          "metadata": Array [
            Object {
              "label": Object {
                "items": Array [
                  Object {
                    "id": 1,
                    "key": "metadata.0.label",
                    "language": "en",
                    "value": "First label",
                  },
                ],
                "type": "values",
              },
              "value": Object {
                "items": Array [
                  Object {
                    "id": 2,
                    "key": "metadata.0.value",
                    "language": "en",
                    "value": "First value",
                  },
                ],
                "type": "values",
              },
            },
          ],
        }
      `);
    });

    test('mismatched array property', () => {
      const list = mapMetadataList({
        fields: [
          { id: 1, key: 'metadata.0.label', value: 'First label', language: 'en' },
          { id: 2, key: 'metadata.0.value', value: 'First value', language: 'en' },
          { id: 3, key: 'metadata.2.label', value: 'Third label', language: 'en' },
          { id: 4, key: 'metadata.2.value', value: 'Third value', language: 'en' },
        ],
      });

      expect(list).toMatchInlineSnapshot(`
        Object {
          "metadata": Array [
            Object {
              "label": Object {
                "items": Array [
                  Object {
                    "id": 1,
                    "key": "metadata.0.label",
                    "language": "en",
                    "value": "First label",
                  },
                ],
                "type": "values",
              },
              "value": Object {
                "items": Array [
                  Object {
                    "id": 2,
                    "key": "metadata.0.value",
                    "language": "en",
                    "value": "First value",
                  },
                ],
                "type": "values",
              },
            },
            undefined,
            Object {
              "label": Object {
                "items": Array [
                  Object {
                    "id": 3,
                    "key": "metadata.2.label",
                    "language": "en",
                    "value": "Third label",
                  },
                ],
                "type": "values",
              },
              "value": Object {
                "items": Array [
                  Object {
                    "id": 4,
                    "key": "metadata.2.value",
                    "language": "en",
                    "value": "Third value",
                  },
                ],
                "type": "values",
              },
            },
          ],
        }
      `);
    });

    test('template property', () => {
      const list = mapMetadataList({
        fields: [],
        template: ['label'],
      });

      expect(list).toMatchInlineSnapshot(`Object {}`);
    });
  });
});
