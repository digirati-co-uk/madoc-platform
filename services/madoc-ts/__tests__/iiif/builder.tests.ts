import { Vault } from '@hyperion-framework/vault';
import { entityActions } from '@hyperion-framework/store';
import { emptyManifest } from '@hyperion-framework/parser';
import { IIIFBuilder } from '../../src/utility/iiif-builder/iiif-builder';

describe('iiif vault building', () => {
  const vault = new Vault();
  const store = vault.getStore();

  test('You can create new IIIF manifest', () => {
    store.dispatch(
      entityActions.importEntities({
        entities: {
          Manifest: {
            'http://example.org/manifest-1': { ...emptyManifest },
          },
          Annotation: {},
          AnnotationCollection: {},
          AnnotationPage: {},
          Canvas: {},
          Collection: {},
          ContentResource: {},
          Range: {},
          Selector: {},
          Service: {},
        },
      })
    );

    expect(store.getState().hyperion.entities.Manifest).toMatchInlineSnapshot(`
      Object {
        "http://example.org/manifest-1": Object {
          "accompanyingCanvas": null,
          "annotations": Array [],
          "behavior": Array [],
          "homepage": null,
          "id": "https://hyperion/empty-manifest",
          "items": Array [],
          "label": null,
          "logo": Array [],
          "metadata": Array [],
          "motivation": null,
          "navDate": null,
          "partOf": Array [],
          "placeholderCanvas": null,
          "posterCanvas": null,
          "provider": Array [],
          "rendering": Array [],
          "requiredStatement": null,
          "rights": null,
          "seeAlso": Array [],
          "service": Array [],
          "services": Array [],
          "start": null,
          "structures": Array [],
          "summary": null,
          "thumbnail": Array [],
          "type": "Manifest",
          "viewingDirection": "left-to-right",
        },
      }
    `);
  });

  test('You can add fields', () => {
    store.dispatch(
      entityActions.modifyEntityField({
        id: 'http://example.org/manifest-1',
        type: 'Manifest',
        value: { none: ['An example label'] },
        key: 'label',
      })
    );

    expect(store.getState().hyperion.entities.Manifest).toMatchInlineSnapshot(`
      Object {
        "http://example.org/manifest-1": Object {
          "accompanyingCanvas": null,
          "annotations": Array [],
          "behavior": Array [],
          "homepage": null,
          "id": "https://hyperion/empty-manifest",
          "items": Array [],
          "label": Object {
            "none": Array [
              "An example label",
            ],
          },
          "logo": Array [],
          "metadata": Array [],
          "motivation": null,
          "navDate": null,
          "partOf": Array [],
          "placeholderCanvas": null,
          "posterCanvas": null,
          "provider": Array [],
          "rendering": Array [],
          "requiredStatement": null,
          "rights": null,
          "seeAlso": Array [],
          "service": Array [],
          "services": Array [],
          "start": null,
          "structures": Array [],
          "summary": null,
          "thumbnail": Array [],
          "type": "Manifest",
          "viewingDirection": "left-to-right",
        },
      }
    `);
  });

  test('builder class', () => {
    const builder = new IIIFBuilder();

    const newManifest = builder.createManifest('http://example.org/manifest-1', manifest => {
      manifest.addLabel('Testing a label');
    });

    expect(newManifest.label).toMatchInlineSnapshot(`
      Object {
        "none": Array [
          "Testing a label",
        ],
      }
    `);

    const editedManifest = builder.editManifest('http://example.org/manifest-1', manifest => {
      manifest.label = { en: ['A new label'] };
    });

    expect(editedManifest.label).toMatchInlineSnapshot(`
      Object {
        "en": Array [
          "A new label",
        ],
      }
    `);
  });

  test('building manifest with canvas', () => {
    const builder = new IIIFBuilder();

    builder.createManifest('http://example.org/manifest', manifest => {
      manifest.addLabel('My manifest');

      manifest.createCanvas('http://example.org/manifest/canvas-1', canvas => {
        canvas.addLabel('Canvas 1');
      });

      manifest.createCanvas('http://example.org/manifest/canvas-2', canvas => {
        canvas.addLabel('Canvas 1');
      });
    });

    expect(builder.vault.getState().hyperion).toMatchSnapshot();
  });
});
