import { mapMetadataList } from '../src/utility/map-metadata-list';
import { extractLinks } from '../src/utility/extract-links';

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
            ,
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

  describe('extract metadata', () => {
    test('wunder', () => {
      const manifest = {
        id: 'https://wellcomelibrary.org/iiif/b18035723/manifest',
        label: { none: ['Wunder der Vererbung'] },
        metadata: [
          { label: { none: ['Title'] }, value: { none: ['Wunder der Vererbung'] } },
          { label: { none: ['Author(s)'] }, value: { none: ['Bolle, Fritz'] } },
          { label: { none: ['Publication date'] }, value: { none: ['[1951]'] } },
          { label: { none: ['Attribution'] }, value: { none: ['Wellcome Collection<br/>License: CC-BY-NC'] } },
          {
            label: {},
            value: {
              none: [
                "<a href='https://search.wellcomelibrary.org/iii/encore/record/C__Rb1803572'>View full catalogue record</a>",
              ],
            },
          },
          {
            label: { none: ['Full conditions of use'] },
            value: {
              none: [
                'You have permission to make copies of this work under a <a target="_top" href="http://creativecommons.org/licenses/by-nc/4.0/">Creative Commons, Attribution, Non-commercial license</a>.<br/><br/>Non-commercial use includes private study, academic research, teaching, and other activities that are not primarily intended for, or directed towards, commercial advantage or private monetary compensation. See the <a target="_top" href="http://creativecommons.org/licenses/by-nc/4.0/legalcode">Legal Code</a> for further information.<br/><br/>Image source should be attributed as specified in the full catalogue record. If no source is given the image should be attributed to Wellcome Library.',
              ],
            },
          },
        ],
        logo: [],
        partOf: [],
        rendering: [],
        seeAlso: [
          {
            id: 'https://wellcomelibrary.org/data/b18035723.json',
            type: 'Dataset',
            profile: 'http://wellcomelibrary.org/profiles/res',
            format: 'application/json',
          },
          {
            id: 'https://wellcomelibrary.org/resource/schemaorg/b18035723',
            type: 'Dataset',
            profile: 'http://iiif.io/community/profiles/discovery/schema',
            format: 'application/ld+json',
          },
          {
            id: 'https://wellcomelibrary.org/resource/dublincore/b18035723',
            type: 'Dataset',
            profile: 'http://iiif.io/community/profiles/discovery/dc',
            format: 'application/ld+json',
          },
        ],
        service: [
          {
            accessHint: 'open',
            id: 'https://wellcomelibrary.org/iiif/b18035723-0/access-control-hints-service',
            type: 'Service',
            profile: 'http://wellcomelibrary.org/ld/iiif-ext/access-control-hints',
          },
          {
            label: { none: ['Search within this manifest'] },
            service: [
              {
                label: { none: ['Get suggested words in this manifest'] },
                id: 'https://wellcomelibrary.org/annoservices/autocomplete/b18035723',
                type: 'AutoCompleteService1',
                profile: 'http://iiif.io/api/search/0/autocomplete',
              },
            ],
            id: 'https://wellcomelibrary.org/annoservices/search/b18035723',
            type: 'SearchService1',
            profile: 'http://iiif.io/api/search/0/search',
          },
          {
            trackingLabel:
              'Format: monograph, Institution: n/a, Identifier: b18035723, Digicode: diggenetics, Collection code: n/a',
            id: 'http://wellcomelibrary.org/service/trackingLabels/b18035723',
            type: 'Service',
            profile: 'http://universalviewer.io/tracking-extensions-profile',
          },
        ],
        services: [],
      };

      expect(extractLinks(manifest as any, 'iiif')).toMatchInlineSnapshot(`
        Array [
          Object {
            "format": "application/json",
            "label": "See also",
            "properties": Object {
              "profile": "http://wellcomelibrary.org/profiles/res",
            },
            "property": "seeAlso",
            "source": "iiif",
            "type": "Dataset",
            "uri": "https://wellcomelibrary.org/data/b18035723.json",
          },
          Object {
            "format": "application/ld+json",
            "label": "See also",
            "properties": Object {
              "profile": "http://iiif.io/community/profiles/discovery/schema",
            },
            "property": "seeAlso",
            "source": "iiif",
            "type": "Dataset",
            "uri": "https://wellcomelibrary.org/resource/schemaorg/b18035723",
          },
          Object {
            "format": "application/ld+json",
            "label": "See also",
            "properties": Object {
              "profile": "http://iiif.io/community/profiles/discovery/dc",
            },
            "property": "seeAlso",
            "source": "iiif",
            "type": "Dataset",
            "uri": "https://wellcomelibrary.org/resource/dublincore/b18035723",
          },
          Object {
            "label": "Service",
            "properties": Object {
              "accessHint": "open",
              "profile": "http://wellcomelibrary.org/ld/iiif-ext/access-control-hints",
            },
            "property": "service",
            "source": "iiif",
            "type": "Service",
            "uri": "https://wellcomelibrary.org/iiif/b18035723-0/access-control-hints-service",
          },
          Object {
            "label": "Service",
            "properties": Object {
              "profile": "http://iiif.io/api/search/0/search",
              "service": Array [
                Object {
                  "id": "https://wellcomelibrary.org/annoservices/autocomplete/b18035723",
                  "label": Object {
                    "none": Array [
                      "Get suggested words in this manifest",
                    ],
                  },
                  "profile": "http://iiif.io/api/search/0/autocomplete",
                  "type": "AutoCompleteService1",
                },
              ],
            },
            "property": "service",
            "source": "iiif",
            "type": "SearchService1",
            "uri": "https://wellcomelibrary.org/annoservices/search/b18035723",
          },
          Object {
            "label": "Service",
            "properties": Object {
              "profile": "http://universalviewer.io/tracking-extensions-profile",
              "trackingLabel": "Format: monograph, Institution: n/a, Identifier: b18035723, Digicode: diggenetics, Collection code: n/a",
            },
            "property": "service",
            "source": "iiif",
            "type": "Service",
            "uri": "http://wellcomelibrary.org/service/trackingLabels/b18035723",
          },
        ]
      `);
    });
  });
});
