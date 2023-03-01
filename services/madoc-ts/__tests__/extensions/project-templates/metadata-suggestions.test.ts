import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import { MetadataDefinition } from '../../../src/types/schemas/metadata-definition';
import { extractRevisionTextFields } from '../../../src/utility/extract-revision-text-fields';
import { parseMetadataListToValueMap } from '../../../src/utility/iiif-metadata';

describe('Project template: Metadata suggestions', function() {
  describe('hooks.beforeCloneModel', () => {
    //
  });
  describe('hooks.onRevisionApproved', () => {
    //

    describe('extractRevisionTextFields', function() {
      test('It extracts correct fields', () => {
        const model: CaptureModel = {
          id: '67ecd1d6-5d88-4000-9ffb-5c38f1cd9905',
          structure: {
            id: '273c1c4c-000f-481c-8ae7-ebe43cb88485',
            type: 'choice',
            label: 'Suggestions',
            items: [
              {
                id: 'c1d21c86-737a-453a-bf80-5c129120cfd6',
                type: 'model',
                label: 'Default',
                fields: ['field-a', 'field-b', 'field-c', 'title'],
              },
            ],
          },
          document: {
            id: 'c55e1ee5-aa51-42a0-94bf-d5a15afe4479',
            type: 'entity',
            label: 'Suggestions',
            properties: {
              'field-a': [
                {
                  id: '49c1a825-e609-4d50-9d07-23f1d5038040',
                  type: 'international-field',
                  label: 'Field A',
                  value: {
                    none: [''],
                  },
                },
                {
                  id: '57d10dbf-029a-48b0-b5cf-64d07c0b747e',
                  type: 'international-field',
                  label: 'Field A',
                  value: {
                    none: ['This is something'],
                  },
                  revises: '49c1a825-e609-4d50-9d07-23f1d5038040',
                  revision: '76c181e5-2eb0-4365-9bdd-c30d1523e0b7',
                },
              ],
              'field-b': [
                {
                  id: '2b31c90a-0f1e-4013-8ff7-a4fee46816b1',
                  type: 'international-field',
                  label: 'Field B',
                  value: {
                    none: [''],
                  },
                },
              ],
              'field-c': [
                {
                  id: '32d4305e-6aa5-408a-8c18-b1892141a6a1',
                  type: 'international-field',
                  label: 'Field C',
                  value: {
                    none: [''],
                  },
                },
              ],
            },
          },
          target: [
            {
              id: 'urn:madoc:manifest:187',
              type: 'Manifest',
            },
          ],
          profile: null,
          derivedFrom: '7fa3ebbf-ee98-4a84-b62e-141aeeae038f',
          revisions: [
            {
              structureId: 'c1d21c86-737a-453a-bf80-5c129120cfd6',
              approved: false,
              label: 'Default',
              id: '76c181e5-2eb0-4365-9bdd-c30d1523e0b7',
              fields: ['field-a', 'field-b', 'field-c', 'title'],
              status: 'draft',
              revises: 'c1d21c86-737a-453a-bf80-5c129120cfd6',
              authors: ['urn:madoc:user:1'],
              deletedFields: null,
            },
          ],
          contributors: {
            'urn:madoc:user:1': {
              id: 'urn:madoc:user:1',
              type: 'Person',
              name: 'Stephen',
            },
          },
        } as any;
        const { langValues, stringValues, modified, keysFound, keyLabels, originalKeys } = extractRevisionTextFields(
          model.document,
          model.revisions![0].id
        );

        expect(langValues).toEqual({
          'field a': { none: ['This is something'] },
        });
        expect(stringValues).toEqual({});
        expect(modified).toBeTruthy();
        expect(keysFound).toEqual(['field a']);
        expect(originalKeys).toEqual({
          'field a': 'field-a',
        });
        expect(keyLabels).toEqual({
          'field a': 'Field A',
        });
      });
    });
    describe('parseMetadataListToValueMap', function() {
      const fields: Array<MetadataDefinition & { id: number }> = [
        {
          id: 143308,
          key: 'label',
          value: 'Lanarkshire',
          language: 'none',
          source: 'iiif',
          edited: false,
          auto_update: true,
          readonly: false,
          data: null,
        },
        {
          id: 143309,
          key: 'metadata.0.label',
          value: 'Title',
          language: 'none',
          source: 'iiif',
          edited: false,
          auto_update: true,
          readonly: false,
          data: null,
        },
        {
          id: 143310,
          key: 'metadata.0.value',
          value: 'Lanarkshire',
          language: 'none',
          source: 'iiif',
          edited: false,
          auto_update: true,
          readonly: false,
          data: null,
        },
        {
          id: 143311,
          key: 'metadata.1.value',
          value: '<a href="https://digital.nls.uk/97134426">View in our digital gallery</a>',
          language: 'none',
          source: 'iiif',
          edited: false,
          auto_update: true,
          readonly: false,
          data: null,
        },
        {
          id: 143312,
          key: 'metadata.2.label',
          value: 'Full conditions of use',
          language: 'none',
          source: 'iiif',
          edited: false,
          auto_update: true,
          readonly: false,
          data: null,
        },
        {
          id: 143313,
          key: 'metadata.2.value',
          value:
            'You have permission to make copies of this work under the <a target="_top" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International Licence</a> unless otherwise stated.',
          language: 'none',
          source: 'iiif',
          edited: false,
          auto_update: true,
          readonly: false,
          data: null,
        },
        {
          id: 143314,
          key: 'requiredStatement.label',
          value: 'Attribution',
          language: 'none',
          source: 'iiif',
          edited: false,
          auto_update: true,
          readonly: false,
          data: null,
        },
        {
          id: 143315,
          key: 'requiredStatement.value',
          value:
            'National Library of Scotland<br/>License: <a target="_top" href="http://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>',
          language: 'none',
          source: 'iiif',
          edited: false,
          auto_update: true,
          readonly: false,
          data: null,
        },
        {
          id: 1860682,
          key: 'metadata.3.label',
          value: 'Field A',
          language: 'none',
          source: 'madoc',
          edited: true,
          auto_update: false,
          readonly: false,
          data: null,
        },
        {
          id: 1860683,
          key: 'metadata.3.value',
          value: 'TESTD',
          language: 'none',
          source: 'madoc',
          edited: true,
          auto_update: false,
          readonly: false,
          data: null,
        },
        {
          id: 1860684,
          key: 'metadata.4.label',
          value: 'Field B',
          language: 'none',
          source: 'madoc',
          edited: true,
          auto_update: false,
          readonly: false,
          data: null,
        },
        {
          id: 1860685,
          key: 'metadata.4.value',
          value: 'TEST V',
          language: 'none',
          source: 'madoc',
          edited: true,
          auto_update: false,
          readonly: false,
          data: null,
        },
        {
          id: 1860686,
          key: 'metadata.5.label',
          value: 'Field C',
          language: 'none',
          source: 'madoc',
          edited: true,
          auto_update: false,
          readonly: false,
          data: null,
        },
        {
          id: 1860687,
          key: 'metadata.5.value',
          value: 'TEST X',
          language: 'none',
          source: 'madoc',
          edited: true,
          auto_update: false,
          readonly: false,
          data: null,
        },
        {
          id: 1860688,
          key: 'metadata.6.label',
          value: 'title',
          language: 'none',
          source: 'madoc',
          edited: true,
          auto_update: false,
          readonly: false,
          data: null,
        },
        {
          id: 1860689,
          key: 'metadata.6.value',
          value: 'Lanarkshire TEST',
          language: 'none',
          source: 'madoc',
          edited: true,
          auto_update: false,
          readonly: false,
          data: null,
        },
      ];

      const { metadataCursor, keysIndex, valueIndex } = parseMetadataListToValueMap(fields);

      expect(metadataCursor).toEqual(7);
      expect(keysIndex).toMatchInlineSnapshot(`
        {
          "field a": 3,
          "field b": 4,
          "field c": 5,
          "full conditions of use": 2,
          "title": 6,
        }
      `);
      expect(valueIndex).toMatchInlineSnapshot(`
        {
          "0": [
            {
              "auto_update": true,
              "data": null,
              "edited": false,
              "id": 143310,
              "key": "metadata.0.value",
              "language": "none",
              "readonly": false,
              "source": "iiif",
              "value": "Lanarkshire",
            },
          ],
          "1": [
            {
              "auto_update": true,
              "data": null,
              "edited": false,
              "id": 143311,
              "key": "metadata.1.value",
              "language": "none",
              "readonly": false,
              "source": "iiif",
              "value": "<a href="https://digital.nls.uk/97134426">View in our digital gallery</a>",
            },
          ],
          "2": [
            {
              "auto_update": true,
              "data": null,
              "edited": false,
              "id": 143313,
              "key": "metadata.2.value",
              "language": "none",
              "readonly": false,
              "source": "iiif",
              "value": "You have permission to make copies of this work under the <a target="_top" href="http://creativecommons.org/licenses/by/4.0/">Creative Commons Attribution 4.0 International Licence</a> unless otherwise stated.",
            },
          ],
          "3": [
            {
              "auto_update": false,
              "data": null,
              "edited": true,
              "id": 1860683,
              "key": "metadata.3.value",
              "language": "none",
              "readonly": false,
              "source": "madoc",
              "value": "TESTD",
            },
          ],
          "4": [
            {
              "auto_update": false,
              "data": null,
              "edited": true,
              "id": 1860685,
              "key": "metadata.4.value",
              "language": "none",
              "readonly": false,
              "source": "madoc",
              "value": "TEST V",
            },
          ],
          "5": [
            {
              "auto_update": false,
              "data": null,
              "edited": true,
              "id": 1860687,
              "key": "metadata.5.value",
              "language": "none",
              "readonly": false,
              "source": "madoc",
              "value": "TEST X",
            },
          ],
          "6": [
            {
              "auto_update": false,
              "data": null,
              "edited": true,
              "id": 1860689,
              "key": "metadata.6.value",
              "language": "none",
              "readonly": false,
              "source": "madoc",
              "value": "Lanarkshire TEST",
            },
          ],
        }
      `);
    });
  });
});
