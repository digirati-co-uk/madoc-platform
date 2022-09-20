/**
 * @jest-environment node
 */

const deepmerge = require('deepmerge');
import invariant from 'tiny-invariant';
import { extractValidRevisionChanges } from '../../../src/capture-model-server/server-filters/extract-valid-revision-changes';
import { updateRevisionInDocument } from '../../../src/capture-model-server/server-filters/update-revision-in-document';
import { createRevisionStore } from '../../../src/frontend/shared/capture-models/editor/stores/revisions/revisions-store';
import { registerField } from '../../../src/frontend/shared/capture-models/plugin-api/global-store';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';
import { StructureType } from '../../../src/frontend/shared/capture-models/types/utility';

registerField({
  label: 'Text field',
  type: 'text-field',
  description: 'Simple text field for plain text',
  Component: undefined as any,
  defaultValue: '',
  allowMultiple: true,
  defaultProps: {},
  Editor: undefined as any,
  // Editor: TextFieldEditor,
  TextPreview: undefined as any,
} as any);

const models: () => any[] = () => [
  deepmerge({}, require('../../../fixtures/03-revisions/01-single-field-with-revision.json')),
  deepmerge({}, require('../../../fixtures/03-revisions/02-single-field-with-multiple-revisions.json')),
  deepmerge({}, require('../../../fixtures/03-revisions/03-nested-revision.json')),
  deepmerge({}, require('../../../fixtures/03-revisions/04-dual-transcription.json')),
  deepmerge({}, require('../../../fixtures/03-revisions/05-allow-multiple-transcriptions.json')),
  deepmerge({}, require('../../../fixtures/04-selectors/01-simple-selector.json')),
  deepmerge({}, require('../../../fixtures/04-selectors/02-multiple-selectors.json')),
  deepmerge({}, require('../../../fixtures/04-selectors/03-nested-selector.json')),
  deepmerge({}, require('../../../fixtures/04-selectors/08-hocr-output.json')),
];

describe('Revision store', () => {
  describe('reading computed revision', () => {
    test('revision exists', () => {
      const store = createRevisionStore({
        captureModel: models()[0],
        initialRevision: '7c26cf57-5950-4849-b533-11e0ee4afa4b',
      });

      expect(store.getState().currentRevisionId).toEqual('7c26cf57-5950-4849-b533-11e0ee4afa4b');

      expect(store.getState().currentRevision).toMatchInlineSnapshot(`
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

    test('revision does not exist', () => {
      const store = createRevisionStore({ captureModel: models()[0] });

      expect(store.getState().currentRevision).toBeNull();
    });
  });

  describe('choosing selectors', () => {
    const selectorStore = (revision?: boolean, num = 5) => {
      const mod: CaptureModel = models()[num];
      const revId = (mod.structure as StructureType<'choice'>).items[0].id;
      const store = createRevisionStore({
        captureModel: models()[num],
        initialRevision: revision ? revId : undefined,
      });

      return [store, store.getActions(), revId] as const;
    };

    test('selectors are available on model', () => {
      const [store, { selectRevision }, revId] = selectorStore();
      expect(store.getState().selector.availableSelectors).toEqual([]);
      selectRevision({ revisionId: revId });
      expect(store.getState().selector.availableSelectors).toEqual([
        { id: '0c15c2b8-48e9-4c83-b77e-054cd8215f93', state: null, type: 'box-selector' },
      ]);
    });

    test('can choose a selector that exists', () => {
      const [store, { chooseSelector }] = selectorStore(true);
      chooseSelector({ selectorId: '0c15c2b8-48e9-4c83-b77e-054cd8215f93' });
      expect(store.getState().selector.currentSelectorId).toEqual('0c15c2b8-48e9-4c83-b77e-054cd8215f93');
    });

    test('can choose a selector that does not exist', () => {
      const [store, { chooseSelector }] = selectorStore();
      chooseSelector({ selectorId: 'DOES NOT EXIST' });
      expect(store.getState().selector.currentSelectorId).toEqual(null);
    });

    test('can choose a selector when one is already selected', () => {
      const [store, { chooseSelector }] = selectorStore(true, 6);
      chooseSelector({ selectorId: '6ffcfd34-4141-4f38-918d-5348e9d42ab5' });
      expect(store.getState().selector.currentSelectorId).toEqual('6ffcfd34-4141-4f38-918d-5348e9d42ab5');
      chooseSelector({ selectorId: '9b25da35-f1fb-4b58-92e4-0eef3d929029' });
      expect(store.getState().selector.currentSelectorId).toEqual('9b25da35-f1fb-4b58-92e4-0eef3d929029');
    });

    test('no top level selector is selected by default', () => {
      const [store] = selectorStore(true, 6);
      expect(store.getState().selector.topLevelSelector).toEqual(null);
    });

    test('can choose a top level selector', () => {
      const [store, { setTopLevelSelector }] = selectorStore(true, 6);
      setTopLevelSelector({ selectorId: '6ffcfd34-4141-4f38-918d-5348e9d42ab5' });
      expect(store.getState().selector.topLevelSelector).toEqual('6ffcfd34-4141-4f38-918d-5348e9d42ab5');
    });

    test('can clear the current selector', () => {
      const [store, { chooseSelector, clearSelector }] = selectorStore(true, 5);

      chooseSelector({ selectorId: '0c15c2b8-48e9-4c83-b77e-054cd8215f93' });
      expect(store.getState().selector.currentSelectorId).toEqual('0c15c2b8-48e9-4c83-b77e-054cd8215f93');

      clearSelector();
      expect(store.getState().selector.currentSelectorId).toEqual(null);
    });

    test('can clear the current selector when no selector is chosen', () => {
      const [, { clearSelector }] = selectorStore(true);

      expect(() => clearSelector()).not.toThrow();
    });

    test('can clear the current top level selector', () => {
      const [store, { setTopLevelSelector, clearTopLevelSelector }] = selectorStore(true);

      setTopLevelSelector({ selectorId: '0c15c2b8-48e9-4c83-b77e-054cd8215f93' });
      expect(store.getState().selector.topLevelSelector).toEqual('0c15c2b8-48e9-4c83-b77e-054cd8215f93');

      clearTopLevelSelector();
      expect(store.getState().selector.topLevelSelector).toEqual(null);
    });

    test('can build a selector index', () => {
      const [store, { selectRevision }] = selectorStore(false, 7);

      selectRevision({ revisionId: '18e0d089-e87c-448f-9ef2-3282a44cf6d2' });

      expect(store.getState().selector.selectorPaths).toMatchInlineSnapshot(`
        Object {
          "007a5ace-b1a4-49ca-8dd3-c78aee2d5409": Array [
            Array [
              "person",
              "56405dc7-b910-45e0-8ade-898594276795",
            ],
            Array [
              "firstName",
              "9a55a096-4a79-46b0-8111-d9775d074a14",
            ],
          ],
          "05a99c13-eedd-4a14-940a-f774fc461ca4": Array [
            Array [
              "person",
              "cc2570c7-b3a5-4e5b-8f3d-3b3693769969",
            ],
            Array [
              "firstName",
              "c3434721-19f7-4402-9bfb-1e11875a0de0",
            ],
          ],
        }
      `);
    });
  });

  describe('revision mutations', () => {
    test('create revision', () => {
      const store = createRevisionStore({ captureModel: models()[0] });
      const { createRevision } = store.getActions();

      createRevision({ revisionId: '31b27c9b-2388-47df-b6f4-73fb4878c1fa', cloneMode: 'FORK_TEMPLATE' });

      const { revisions } = store.getState();

      expect(Object.keys(revisions).length).toEqual(3);
    });

    test('duplicating field - allowMultiple=false', () => {
      const store = createRevisionStore({
        captureModel: models()[7],
      });
      const { createNewFieldInstance, selectRevision } = store.getActions();

      selectRevision({ revisionId: '18e0d089-e87c-448f-9ef2-3282a44cf6d2' });

      expect(() =>
        createNewFieldInstance({
          property: 'firstName',
          path: [['person', '56405dc7-b910-45e0-8ade-898594276795']],
        })
      ).toThrowErrorMatchingInlineSnapshot(`"field does not support multiple values."`);
    });

    test('duplicating field - allowMultiple=true', () => {
      const store = createRevisionStore({
        captureModel: models()[4],
      });
      const { createNewFieldInstance, selectRevision } = store.getActions();

      selectRevision({ revisionId: 'fd847948-11bf-42ca-bfdd-cab85ea818f3' });

      expect((store.getState().revisionSubtree as any).properties.transcription).toHaveLength(2);

      expect(() =>
        createNewFieldInstance({
          property: 'transcription',
          path: [],
        })
      ).not.toThrow();

      expect((store.getState().revisionSubtree as any).properties.transcription).toHaveLength(3);

      expect((store.getState().revisionSubtree as any).properties.transcription[2].label).toEqual('Transcription');
      expect((store.getState().revisionSubtree as any).properties.transcription[2].type).toEqual('text-field');
      expect((store.getState().revisionSubtree as any).properties.transcription[2].value).toEqual('');

      // @ts-ignore
      expect(store.getState().currentRevision.document.properties.transcription).toHaveLength(3);

      // And we can detect the changes on the server side.

      const newModel = models()[4];

      const { mutations } = extractValidRevisionChanges(
        newModel,
        store.getState().revisions['fd847948-11bf-42ca-bfdd-cab85ea818f3'] as any,
        {
          allowAnonymous: true,
          allowCustomStructure: true,
        }
      );

      expect(Object.keys(mutations)).toHaveLength(1);
      const first = mutations[(Object.keys(mutations) as any)[0]][0];
      invariant(first.type === 'field');
      expect(first.term).toEqual('transcription');
      expect(first.field.value).toEqual('');

      expect(newModel.document.properties.transcription).toHaveLength(5);
      updateRevisionInDocument(newModel, store.getState().revisions['fd847948-11bf-42ca-bfdd-cab85ea818f3'] as any, {});
      expect(newModel.document.properties.transcription).toHaveLength(6);
      expect(newModel.document.properties.transcription.filter((r: any) => r.id === first.field.id)).toHaveLength(1);
    });

    test('duplicating field with selector', () => {
      const store = createRevisionStore({
        captureModel: models()[8],
      });
      const { createNewFieldInstance, selectRevision } = store.getActions();

      selectRevision({ revisionId: 'c8bb939a-7a76-4b15-9f77-81375519128c' });

      expect(() =>
        createNewFieldInstance({
          property: 'text',
          path: [
            ['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091'],
            ['lines', '64e82cb7-16f8-432e-b2b7-3828233a134c'],
          ],
        })
      ).not.toThrow();

      expect(
        (store.getState().revisionSubtree as any).properties.paragraph[0].properties.lines[0].properties.text
      ).toHaveLength(2);

      const selectorId = (store.getState().revisionSubtree as any).properties.paragraph[0].properties.lines[0]
        .properties.text[1].selector.id;

      expect(selectorId).toBeDefined();

      expect(store.getState().selector.availableSelectors.map(e => e.id)).toContain(selectorId);
      expect(store.getState().selector.selectorPaths).toHaveProperty(selectorId);
      // The selectors should be the same size.
      const selector = store.getState().selector.selectorPaths[selectorId];

      expect(selector[0]).toMatchInlineSnapshot(`
        Array [
          "paragraph",
          "159621fb-4f93-4cd7-a394-5a1141fc1091",
        ]
      `);
      expect(selector[1]).toMatchInlineSnapshot(`
        Array [
          "lines",
          "64e82cb7-16f8-432e-b2b7-3828233a134c",
        ]
      `);
      expect(selector[2][0]).toEqual('text');
    });

    test('duplicating entity - allowMultiple=false', () => {
      const model = require('../../../fixtures/02-nesting/01-nested-model.json');

      const store = createRevisionStore({
        captureModel: model,
      });
      const { createNewEntityInstance, selectRevision } = store.getActions();

      selectRevision({ revisionId: '6fb10d2e-8a88-4a5f-a318-ac6542f073de' });

      expect(() =>
        createNewEntityInstance({
          property: 'person',
          path: [],
        })
      ).toThrowErrorMatchingInlineSnapshot(`"entity does not support multiple values."`);
    });
    test('duplicating entity - allowMultiple=true', () => {
      const model = require('../../../fixtures/02-nesting/05-nested-model-multiple.json');

      const store = createRevisionStore({
        captureModel: model,
      });
      const { createNewEntityInstance, selectRevision } = store.getActions();

      selectRevision({ revisionId: '0e29f176-aeeb-4bf3-a92c-d64654e29c90' });

      expect(() =>
        createNewEntityInstance({
          property: 'person',
          path: [],
        })
      ).not.toThrow();

      expect((store.getState().revisionSubtree as CaptureModel['document'])?.properties.person).toHaveLength(3);

      expect(
        (store.getState().revisionSubtree as CaptureModel['document'])?.properties.person[2]
      ).toMatchInlineSnapshot(
        {
          id: expect.any(String),
          properties: {
            firstName: [{ id: expect.any(String) }],
            lastName: [{ id: expect.any(String) }],
          },
        },
        `
        Object {
          "allowMultiple": true,
          "description": "Describe a person",
          "id": Any<String>,
          "immutable": false,
          "label": "Person",
          "labelledBy": "firstName",
          "properties": Object {
            "firstName": Array [
              Object {
                "id": Any<String>,
                "label": "First name",
                "revision": "0e29f176-aeeb-4bf3-a92c-d64654e29c90",
                "type": "text-field",
                "value": "",
              },
            ],
            "lastName": Array [
              Object {
                "id": Any<String>,
                "label": "Last name",
                "revision": "0e29f176-aeeb-4bf3-a92c-d64654e29c90",
                "type": "text-field",
                "value": "",
              },
            ],
          },
          "revision": "0e29f176-aeeb-4bf3-a92c-d64654e29c90",
          "type": "entity",
        }
      `
      );
    });

    test('duplicating entity with selector', () => {
      const model = require('../../../fixtures/04-selectors/08-hocr-output.json');

      const store = createRevisionStore({
        captureModel: model,
      });
      const { createNewEntityInstance, selectRevision } = store.getActions();

      selectRevision({ revisionId: 'c8bb939a-7a76-4b15-9f77-81375519128c' });

      expect(() =>
        createNewEntityInstance({
          property: 'lines',
          path: [['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091']],
        })
      ).not.toThrow();

      const newLine = ((store.getState().revisionSubtree as CaptureModel['document'])?.properties
        .paragraph[0] as CaptureModel['document']).properties.lines[1];

      expect(newLine).toMatchInlineSnapshot(
        {
          id: expect.any(String),
          properties: {
            text: [{ id: expect.any(String), selector: { id: expect.any(String) } }],
          },
          selector: { id: expect.any(String) },
        },
        `
        Object {
          "allowMultiple": true,
          "description": "All of the lines inside of a paragraph",
          "id": Any<String>,
          "immutable": false,
          "label": "Line",
          "labelledBy": "text",
          "pluralLabel": "Lines",
          "properties": Object {
            "text": Array [
              Object {
                "allowMultiple": true,
                "description": "Single word, phrase or the whole line",
                "id": Any<String>,
                "label": "Text of line",
                "multiline": false,
                "pluralField": "Text of lines",
                "revision": "c8bb939a-7a76-4b15-9f77-81375519128c",
                "selector": Object {
                  "id": Any<String>,
                  "state": null,
                  "type": "box-selector",
                },
                "type": "text-field",
                "value": "",
              },
            ],
          },
          "revision": "c8bb939a-7a76-4b15-9f77-81375519128c",
          "selector": Object {
            "id": Any<String>,
            "state": null,
            "type": "box-selector",
          },
          "type": "entity",
        }
      `
      );

      const newTextSelector = (newLine.selector as any).id;
      const newLineSelector = (newLine as any).properties.text[0].selector.id;

      expect(store.getState().selector.availableSelectors).toHaveLength(5);
      expect(store.getState().selector.availableSelectors.map(e => e.id)).toContain(newTextSelector);
      expect(store.getState().selector.availableSelectors.map(e => e.id)).toContain(newLineSelector);
    });

    test('removing entity instance', () => {
      const model = require('../../../fixtures/04-selectors/08-hocr-output.json');

      const store = createRevisionStore({
        captureModel: model,
      });
      const { createNewEntityInstance, removeInstance, selectRevision } = store.getActions();

      selectRevision({ revisionId: 'c8bb939a-7a76-4b15-9f77-81375519128c' });

      expect(() =>
        createNewEntityInstance({
          property: 'lines',
          path: [['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091']],
        })
      ).not.toThrow();

      const newLine = ((store.getState().revisionSubtree as CaptureModel['document'])?.properties
        .paragraph[0] as CaptureModel['document']).properties.lines[1];

      removeInstance({
        path: [
          ['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091'],
          ['lines', newLine.id],
        ],
      });

      expect(
        ((store.getState().revisionSubtree as CaptureModel['document'])?.properties
          .paragraph[0] as CaptureModel['document']).properties.lines
      ).toHaveLength(1);

      const newTextSelector = (newLine.selector as any).id;
      const newLineSelector = (newLine as any).properties.text[0].selector.id;

      expect(store.getState().selector.availableSelectors).toHaveLength(3);
      expect(store.getState().selector.availableSelectors.map(e => e.id)).not.toContain(newTextSelector);
      expect(store.getState().selector.availableSelectors.map(e => e.id)).not.toContain(newLineSelector);
    });

    test('removing field instance', () => {
      const store = createRevisionStore({
        captureModel: models()[8],
      });
      const { createNewFieldInstance, removeInstance, selectRevision } = store.getActions();

      selectRevision({ revisionId: 'c8bb939a-7a76-4b15-9f77-81375519128c' });

      expect(() =>
        createNewFieldInstance({
          property: 'text',
          path: [
            ['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091'],
            ['lines', '64e82cb7-16f8-432e-b2b7-3828233a134c'],
          ],
        })
      ).not.toThrow();

      const text = (store.getState().revisionSubtree as any).properties.paragraph[0].properties.lines[0].properties
        .text[1];

      removeInstance({
        path: [
          ['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091'],
          ['lines', '64e82cb7-16f8-432e-b2b7-3828233a134c'],
          ['text', text.id],
        ],
      });

      expect(
        (store.getState().revisionSubtree as any).properties.paragraph[0].properties.lines[0].properties.text
      ).toHaveLength(1);

      expect(store.getState().selector.availableSelectors).toHaveLength(3);
      expect(store.getState().selector.availableSelectors.map(e => e.id)).not.toContain(text.selector.id);
    });

    test('removing field instance - not last one', () => {
      const store = createRevisionStore({
        captureModel: models()[8],
      });
      const { removeInstance, selectRevision } = store.getActions();

      selectRevision({ revisionId: 'c8bb939a-7a76-4b15-9f77-81375519128c' });

      const text = (store.getState().revisionSubtree as any).properties.paragraph[0].properties.lines[0].properties
        .text[0];

      expect(() =>
        removeInstance({
          path: [
            ['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091'],
            ['lines', '64e82cb7-16f8-432e-b2b7-3828233a134c'],
            ['text', text.id],
          ],
        })
      ).toThrowErrorMatchingInlineSnapshot(`"Cannot delete last item"`);
    });
  });

  describe('revision field path 2', () => {
    // Fields and navigation.

    describe('simple navigation', () => {
      const store = createRevisionStore({
        captureModel: models()[7],
      });
      const { selectRevision, revisionPushSubtree, revisionSelectField, revisionPopSubtree } = store.getActions();

      it('should show the available keys when selecting a revision', () => {
        selectRevision({ revisionId: '18e0d089-e87c-448f-9ef2-3282a44cf6d2' });

        expect(store.getState().revisionSubtreeFieldKeys).toEqual(['person']);
      });

      it('should allow you to navigate down a tree', () => {
        revisionPushSubtree({ term: 'person', id: '56405dc7-b910-45e0-8ade-898594276795' });

        expect(store.getState().revisionSubtreeFieldKeys).toEqual(['firstName', 'lastName']);

        expect((store.getState().revisionSubtree as CaptureModel['document'])?.id).toEqual(
          '56405dc7-b910-45e0-8ade-898594276795'
        );
      });

      it('should let choose a single field', () => {
        revisionSelectField({ id: '9a55a096-4a79-46b0-8111-d9775d074a14', term: 'firstName' });

        const revisionSelectState = store.getState();

        expect(revisionSelectState.revisionSelectedFieldProperty).toEqual('firstName');
        expect(revisionSelectState.revisionSelectedFieldInstance).toEqual('9a55a096-4a79-46b0-8111-d9775d074a14');
        expect(revisionSelectState.revisionSubtreeField).toMatchInlineSnapshot(`
                  Object {
                    "id": "9a55a096-4a79-46b0-8111-d9775d074a14",
                    "label": "First name",
                    "selector": Object {
                      "id": "007a5ace-b1a4-49ca-8dd3-c78aee2d5409",
                      "state": null,
                      "type": "box-selector",
                    },
                    "type": "text-field",
                    "value": "second first name",
                  }
              `);
      });
      it('should remove the selected field when navigating', () => {
        revisionPopSubtree(undefined);

        const revisionSelectStatePopped = store.getState();

        expect(revisionSelectStatePopped.revisionSelectedFieldProperty).toEqual(null);
        expect(revisionSelectStatePopped.revisionSelectedFieldInstance).toEqual(null);
      });
    });

    // Selectors.
    describe('selectors while navigating revision', () => {
      test('can select linear path', () => {
        const store = createRevisionStore({
          captureModel: require('../../../fixtures/04-selectors/08-hocr-output.json'),
        });
        const { selectRevision, revisionPushSubtree } = store.getActions();

        selectRevision({ revisionId: 'c8bb939a-7a76-4b15-9f77-81375519128c' });

        // What are the selectors before.

        expect(store.getState().visibleCurrentLevelSelectorIds).toHaveLength(1);

        revisionPushSubtree({ id: '159621fb-4f93-4cd7-a394-5a1141fc1091', term: 'paragraph' });

        // now what are the selectors.
        expect(store.getState().visibleCurrentLevelSelectorIds).toHaveLength(2);
        expect(store.getState().visibleCurrentLevelSelectorIds).toEqual([
          '2f32a9f6-525e-4cba-9bef-115129680fce',
          '0d0a0325-6d9a-407a-93c2-db0f55bb7209',
        ]);

        revisionPushSubtree({ id: '64e82cb7-16f8-432e-b2b7-3828233a134c', term: 'lines' });

        expect(store.getState().visibleCurrentLevelSelectorIds).toHaveLength(2);
        expect(store.getState().visibleCurrentLevelSelectorIds).toEqual([
          '0d0a0325-6d9a-407a-93c2-db0f55bb7209',
          'da7e26f8-9797-423e-a0cf-276df7b859ea',
        ]);
      });

      test.todo('can navigate to adjacent field'); // select adjacent line
      test.todo('can navigate to deeper field'); // select text directly, emulating what happens when selector is clicked.
      test.todo('setting current level selectors only configuration');
    });
  });

  describe('revision with continuous forking', () => {
    test('revision can fork field', () => {
      const store = createRevisionStore({
        captureModel: models()[0],
      });
      const actions = store.getActions();

      actions.setRevisionMode({ editMode: true });

      actions.createRevision({
        revisionId: '31b27c9b-2388-47df-b6f4-73fb4878c1fa',
        cloneMode: 'EDIT_ALL_VALUES',
      });

      actions.updateFieldValue({
        path: [['name', 'aca844a3-836a-45c3-bb16-dc28bcdce46f']],
        value: 'Testing a new value',
      });

      // @ts-ignore
      expect(store.getState().currentRevision.document.properties.name[0].revises).toBeDefined();
    });

    test('revision can fork entity', () => {
      const store = createRevisionStore({
        captureModel: models()[2],
      });
      const actions = store.getActions();

      actions.setRevisionMode({ editMode: true });

      actions.createRevision({
        revisionId: 'd4000be7-1407-43a4-b5e7-75479fb96a0d',
        cloneMode: 'EDIT_ALL_VALUES',
      });

      actions.updateFieldValue({
        path: [
          ['person', '5c8a5874-8bca-422c-be71-300612d67c72'],
          ['firstName', '7b45ec25-15a6-40dd-9a1d-0fd1d673df15'],
        ],
        value: 'Testing a new value',
      });

      expect(
        // @ts-ignore
        store.getState().currentRevision.document.properties.person[0].properties.firstName[0].revises
      ).toBeDefined();
    });

    // OCR Tests
    test('Correct a word in OCR', () => {
      const store = createRevisionStore({
        captureModel: models()[8],
      });
      const actions = store.getActions();

      actions.setRevisionMode({ editMode: true });

      actions.createRevision({
        revisionId: 'c8bb939a-7a76-4b15-9f77-81375519128c',
        cloneMode: 'EDIT_ALL_VALUES',
      });

      actions.updateFieldValue({
        path: [
          ['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091'],
          ['lines', '64e82cb7-16f8-432e-b2b7-3828233a134c'],
          ['text', 'eb122262-fab3-43c8-9432-ac93dad3abf8'],
        ],
        value: 'Testing a new value',
      });

      expect(
        // @ts-ignore
        store.getState().currentRevision.document.properties.paragraph[0].properties.lines[0].properties.text[0].revises
      ).toBeDefined();
    });

    test('Add a missing line', () => {
      const store = createRevisionStore({
        captureModel: models()[8],
      });
      const actions = store.getActions();

      actions.setRevisionMode({ editMode: true });

      actions.createRevision({
        revisionId: 'c8bb939a-7a76-4b15-9f77-81375519128c',
        cloneMode: 'EDIT_ALL_VALUES',
      });

      expect(
        // @ts-ignore
        store.getState().currentRevision.document.properties.paragraph[0].properties.lines[1]
      ).not.toBeDefined();

      actions.createNewEntityInstance({
        path: [['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091']],
        property: 'lines',
      });

      expect(
        // @ts-ignore
        store.getState().currentRevision.document.properties.paragraph[0].properties.lines[1]
      ).toBeDefined();

      expect(
        // @ts-ignore
        store.getState().currentRevision.document.properties.paragraph[0].properties.lines[1].properties.text[0]
      ).toMatchInlineSnapshot(
        {
          id: expect.any(String),
          revision: expect.any(String),
          selector: {
            id: expect.any(String),
          },
        },
        `
        Object {
          "allowMultiple": true,
          "description": "Single word, phrase or the whole line",
          "id": Any<String>,
          "label": "Text of line",
          "multiline": false,
          "pluralField": "Text of lines",
          "revision": Any<String>,
          "selector": Object {
            "id": Any<String>,
            "state": null,
            "type": "box-selector",
          },
          "type": "text-field",
          "value": "",
        }
      `
      );
    });
    test('Change the bounding box of a word', () => {
      const store = createRevisionStore({
        captureModel: models()[8],
      });
      const actions = store.getActions();

      actions.setRevisionMode({ editMode: true });

      actions.createRevision({
        revisionId: 'c8bb939a-7a76-4b15-9f77-81375519128c',
        cloneMode: 'EDIT_ALL_VALUES',
      });

      expect(
        // @ts-ignore
        store.getState().currentRevision.document.properties.paragraph[0].properties.lines[1]
      ).not.toBeDefined();

      actions.updateSelector({
        state: { x: 1, y: 2, width: 3, height: 4 },
        selectorId: 'da7e26f8-9797-423e-a0cf-276df7b859ea',
      });

      // The original should remain unchanged.
      expect(
        // @ts-ignore
        store.getState().currentRevision.document.properties.paragraph[0].properties.lines[0].properties.text[0]
          .selector
      ).toMatchInlineSnapshot(
        {
          id: expect.any(String),
          revisedBy: expect.any(Array),
        },
        `
        Object {
          "id": Any<String>,
          "revisedBy": Any<Array>,
          "state": Object {
            "height": 40,
            "width": 30,
            "x": 10,
            "y": 20,
          },
          "type": "box-selector",
        }
      `
      );

      // But revised selector should be updated.
      expect(
        // @ts-ignore
        store.getState().currentRevision.document.properties.paragraph[0].properties.lines[0].properties.text[0]
          .selector.revisedBy
      ).toHaveLength(1);

      // @todo And then when we change the field, it should revert the original and just keep the fork
      actions.updateFieldValue({
        path: [
          ['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091'],
          ['lines', '64e82cb7-16f8-432e-b2b7-3828233a134c'],
          ['text', 'eb122262-fab3-43c8-9432-ac93dad3abf8'],
        ],
        value: 'Testing a new value',
      });

      expect(
        // @ts-ignore
        store.getState().currentRevision.document.properties.paragraph[0].properties.lines[0].properties.text[0]
          .selector
      ).toMatchInlineSnapshot(
        {
          id: expect.any(String),
        },
        `
        Object {
          "id": Any<String>,
          "state": Object {
            "height": 4,
            "width": 3,
            "x": 1,
            "y": 2,
          },
          "type": "box-selector",
        }
      `
      );

      // Make sure the selectors are right.
      // @ts-ignore
      const newSelectorId = store.getState().currentRevision.document.properties.paragraph[0].properties.lines[0]
        .properties.text[0].selector.id;

      expect(store.getState().resolvedSelectors.map(r => r.id)).toContain(newSelectorId);
    });

    test('Change the bounding box of word and then change the word', () => {
      const store = createRevisionStore({
        captureModel: models()[8],
      });
      const actions = store.getActions();

      actions.setRevisionMode({ editMode: true });

      actions.createRevision({
        revisionId: 'c8bb939a-7a76-4b15-9f77-81375519128c',
        cloneMode: 'EDIT_ALL_VALUES',
      });

      // @ts-ignore
      expect(store.getState().currentRevision.document.properties.paragraph[0].id).toEqual(
        '159621fb-4f93-4cd7-a394-5a1141fc1091'
      );

      // First we update the selector.
      actions.updateSelector({
        state: { x: 1, y: 2, width: 3, height: 4 },
        selectorId: 'da7e26f8-9797-423e-a0cf-276df7b859ea',
      });

      // Then we update the field value. What we are looking for is that the selector is reset to be a canonical value.
      actions.updateFieldValue({
        path: [
          ['paragraph', '159621fb-4f93-4cd7-a394-5a1141fc1091'],
          ['lines', '64e82cb7-16f8-432e-b2b7-3828233a134c'],
          ['text', 'eb122262-fab3-43c8-9432-ac93dad3abf8'],
        ],
        value: 'Testing a new value',
      });

      // @ts-ignore
      const newText = store.getState().currentRevision.document.properties.paragraph[0].properties.lines[0].properties
        .text[0];

      expect(newText.id).not.toEqual('eb122262-fab3-43c8-9432-ac93dad3abf8');
      expect(newText.selector.id).not.toEqual('da7e26f8-9797-423e-a0cf-276df7b859ea');
      expect(newText.selector.revisedBy).not.toBeDefined();
      expect(newText.selector.state).toEqual({
        x: 1,
        y: 2,
        width: 3,
        height: 4,
      });
    });
  });
});
