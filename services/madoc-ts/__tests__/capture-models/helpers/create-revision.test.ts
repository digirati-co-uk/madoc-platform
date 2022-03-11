/**
 * @jest-environment jsdom
 */

import * as React from 'react';
import { captureModelToRevisionList } from '../../../src/frontend/shared/capture-models/helpers/capture-model-to-revision-list';
import { forkDocument } from '../../../src/frontend/shared/capture-models/helpers/create-revision-document';
import { filterDocumentGraph } from '../../../src/frontend/shared/capture-models/helpers/filter-document-graph';
import { splitDocumentByModelRoot } from '../../../src/frontend/shared/capture-models/helpers/split-document-by-model-root';
import { registerField } from '../../../src/frontend/shared/capture-models/plugin-api/global-store';
import { CaptureModel } from '../../../src/frontend/shared/capture-models/types/capture-model';

// Mocked field.
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

jest.mock('.../../../src/frontend/shared/capture-models/helpers/generate-id');
const { generateId } = require('../../../src/frontend/shared/capture-models/helpers/generate-id');

generateId.mockImplementation(() => '[--------GENERATED-ID--------]');

describe('create revision', () => {
  const captureModel: CaptureModel = require('../../../fixtures/03-revisions/06-model-root.json');
  const [
    createFieldA,
    editModelA,
    editModelAWithRoot,
    fieldAboveRoot,
    modelCNoModelRoot,
    modelCNoModelRootDepth1,
    modelCNoModelRootDepth2,
    modelCNoModelRootDepth1FieldUnder,
    modelCNoModelRootDepth1FieldOver,
    modelCNoModelRootDepth2FieldOver,
    modelCNoModelRootDepth2FieldOver2x,
    editModelBDepth1,
    editModelBDepth2,
    editModelBDepth3,
    modelFDepth1,
    modelFDepth2,
    modelIDepth0,
    modelIDepth1,
    modelIDepth2,
  ] = captureModelToRevisionList(captureModel, true);

  describe('splitDocumentByModelRoot', () => {
    test('top level', () => {
      const [immutableDocuments, modelRootDocuments] = splitDocumentByModelRoot(captureModel.document);

      expect(immutableDocuments).toHaveLength(0);
      expect(modelRootDocuments).toHaveLength(1);
      expect(modelRootDocuments[0].parent).toBeUndefined();
      expect(modelRootDocuments[0].documents).toHaveLength(1);
      expect(modelRootDocuments[0].documents[0].id).toEqual('3353dc03-9f35-49e7-9b81-4090fa533c64');
    });

    test('single depth', () => {
      const [immutableDocuments, modelRootDocuments] = splitDocumentByModelRoot(captureModel.document, ['model-a']);

      expect(immutableDocuments).toHaveLength(1);
      expect(modelRootDocuments).toHaveLength(1);
      expect(immutableDocuments[0].documents).toHaveLength(1);
      expect(immutableDocuments[0].documents[0].id).toEqual('3353dc03-9f35-49e7-9b81-4090fa533c64');
    });

    test('second depth', () => {
      const [immutableDocuments, modelRootDocuments] = splitDocumentByModelRoot(captureModel.document, [
        'model-a',
        'model-c',
      ]);

      expect(immutableDocuments).toHaveLength(2);
      expect(modelRootDocuments).toHaveLength(1);
    });

    test('third depth', () => {
      const [immutableDocuments, modelRootDocuments] = splitDocumentByModelRoot(captureModel.document, [
        'model-b',
        'model-c',
        'model-d',
      ]);

      expect(immutableDocuments).toHaveLength(3);
      expect(modelRootDocuments).toHaveLength(1);
    });

    test('second depth - with 2 items', () => {
      const [immutableDocuments, modelRootDocuments] = splitDocumentByModelRoot(captureModel.document, [
        'model-f',
        'model-g',
      ]);

      expect(immutableDocuments).toHaveLength(2);
      expect(immutableDocuments[0].documents).toHaveLength(1);
      expect(modelRootDocuments).toHaveLength(1);
      expect(modelRootDocuments[0].documents).toHaveLength(2);
    });

    test('second depth - with adjacent models', () => {
      const [immutableDocuments, modelRootDocuments] = splitDocumentByModelRoot(captureModel.document, [
        'model-h',
        'model-i',
      ]);

      expect(immutableDocuments).toHaveLength(2);
      expect(immutableDocuments[0].documents).toHaveLength(1);
      expect(immutableDocuments[1].documents).toHaveLength(2);
      expect(modelRootDocuments).toHaveLength(2);
      expect(modelRootDocuments[0].documents).toHaveLength(2);
      expect(modelRootDocuments[1].documents).toHaveLength(2);

      expect(modelRootDocuments[0].documents[0].id).toEqual('ecbd3446-6da3-4125-934f-1a3b766b8afe');
      expect(modelRootDocuments[0].documents[1].id).toEqual('7de07c37-6157-4d63-8097-d2d4a78b778f');
      expect(modelRootDocuments[1].documents[0].id).toEqual('3c5abf69-5258-4b0f-a082-a7e53ec15c47');
      expect(modelRootDocuments[1].documents[1].id).toEqual('915106fd-f663-4e55-a727-8253e251c62d');
    });

    test('invalid depth', () => {
      expect(() => splitDocumentByModelRoot(captureModel.document, ['model-a', 'model-c', 'NOT EXIST'])).toThrow(
        'Invalid modelRoot provided'
      );
    });

    test('Fixture - Edit model C - model root depth 2', () => {
      const [immutableDocuments, modelRootDocuments] = splitDocumentByModelRoot(
        modelCNoModelRootDepth2.document,
        modelCNoModelRootDepth2.modelRoot
      );

      expect(immutableDocuments).toHaveLength(2);
      expect(modelRootDocuments).toHaveLength(1);
    });
  });

  describe('filterDocumentGraph', () => {
    test('single depth', () => {
      const [immutableDocuments] = splitDocumentByModelRoot(captureModel.document, ['model-h', 'model-i']);

      const [documentsToKeep, documentsToRemove] = filterDocumentGraph(immutableDocuments, {
        'model-h': 'aa6fe309-deef-4211-802c-dbc0f2ba16ed',
      });

      expect(documentsToRemove).toHaveLength(1);
      expect(documentsToRemove[0].id).toEqual('ab70224e-4cb8-4d8d-a379-9769ad3e06e5');

      expect(documentsToKeep).toHaveLength(1);
      expect(documentsToKeep[0].id).toEqual('aa6fe309-deef-4211-802c-dbc0f2ba16ed');
    });

    test('no filters', () => {
      const [immutableDocuments] = splitDocumentByModelRoot(captureModel.document, ['model-h', 'model-i']);

      const [documentsToKeep, documentsToRemove] = filterDocumentGraph(immutableDocuments, {});

      expect(documentsToRemove).toHaveLength(0);

      expect(documentsToKeep).toHaveLength(2);
      expect(documentsToKeep[0].id).toEqual('ab70224e-4cb8-4d8d-a379-9769ad3e06e5');
      expect(documentsToKeep[1].id).toEqual('aa6fe309-deef-4211-802c-dbc0f2ba16ed');
    });

    test('depth 3, no filters', () => {
      const [immutableDocuments] = splitDocumentByModelRoot(captureModel.document, ['model-b', 'model-c', 'model-d']);

      const [documentsToKeep, documentsToRemove] = filterDocumentGraph(immutableDocuments, {});

      expect(documentsToRemove).toHaveLength(0);

      expect(documentsToKeep).toHaveLength(1);
      expect(documentsToKeep[0].id).toEqual('b51eae75-e76f-496f-b048-f0b5b7f6cacd');
    });

    test('depth 3, single filter', () => {
      const [immutableDocuments] = splitDocumentByModelRoot(captureModel.document, ['model-b', 'model-c', 'model-d']);

      const [documentsToKeep, documentsToRemove] = filterDocumentGraph(immutableDocuments, {
        'model-b': 'd948d756-14ad-4554-92ce-0296e5ce8735',
      });

      expect(documentsToRemove).toHaveLength(0);

      expect(documentsToKeep).toHaveLength(1);
      expect(documentsToKeep[0].id).toEqual('d948d756-14ad-4554-92ce-0296e5ce8735');

      expect(documentsToRemove).toHaveLength(0);
    });

    test('depth 3, double filter', () => {
      const [immutableDocuments] = splitDocumentByModelRoot(captureModel.document, ['model-b', 'model-c', 'model-d']);

      const [documentsToKeep, documentsToRemove] = filterDocumentGraph(immutableDocuments, {
        'model-b': 'd948d756-14ad-4554-92ce-0296e5ce8735',
        'model-c': 'b51eae75-e76f-496f-b048-f0b5b7f6cacd',
      });

      expect(documentsToRemove).toHaveLength(0);

      expect(documentsToKeep).toHaveLength(1);
      expect(documentsToKeep[0].id).toEqual('b51eae75-e76f-496f-b048-f0b5b7f6cacd');
      expect(documentsToRemove).toHaveLength(0);
    });

    test('depth 3, single middle filter', () => {
      const [immutableDocuments] = splitDocumentByModelRoot(captureModel.document, ['model-b', 'model-c', 'model-d']);

      const [documentsToKeep, documentsToRemove] = filterDocumentGraph(immutableDocuments, {
        'model-c': 'b51eae75-e76f-496f-b048-f0b5b7f6cacd',
      });

      expect(documentsToRemove).toHaveLength(0);

      expect(documentsToKeep).toHaveLength(1);
      expect(documentsToKeep[0].id).toEqual('b51eae75-e76f-496f-b048-f0b5b7f6cacd');
      expect(documentsToRemove).toHaveLength(0);
    });
  });

  describe('Single dimension revision creation (non-adjacent)', () => {
    test('Edit field A', () => {
      // Everything above model-i is immutable
      // Only the model-h selected should be in the form (H1)
      // Capture model should be filtered, as per normal capture models.
      expect(
        forkDocument(createFieldA.document, {
          modelRoot: createFieldA.modelRoot,
          revisionId: 'REVISION-ID',
          removeDefaultValues: true,
        })
      ).toMatchSnapshot();
    });

    describe('Edit model a', () => {
      test('Fork template should fork at Model A.1 with nuked values throughout', () => {
        expect(
          forkDocument(editModelA.document, {
            modelRoot: editModelA.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values should create a new document with pre-filled fields and different ID', () => {
        expect(
          forkDocument(editModelA.document, {
            modelRoot: editModelA.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values should return the original documents', () => {
        expect(
          forkDocument(editModelA.document, {
            modelRoot: editModelA.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model a - with model root', () => {
      test('Fork template should fork at Model A.1 with nuked values throughout', () => {
        expect(
          forkDocument(editModelAWithRoot.document, {
            modelRoot: editModelAWithRoot.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });

      test('Fork values should create a new document with pre-filled fields and different ID', () => {
        expect(
          forkDocument(editModelAWithRoot.document, {
            modelRoot: editModelAWithRoot.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values should return the original documents', () => {
        expect(
          forkDocument(editModelAWithRoot.document, {
            modelRoot: editModelAWithRoot.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model a - model root and field above root', () => {
      // Come back to this one.
      test('This should throw as an invalid structure because the field is above the root', () => {
        // @todo this may be invalid, but the model is holding!
        expect(
          forkDocument(fieldAboveRoot.document, {
            modelRoot: fieldAboveRoot.modelRoot,
            revisionId: 'REVISION-ID',
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model C - no model root', () => {
      test('Fork template should fork at Model A.1 with nuked values throughout', () => {
        expect(
          forkDocument(modelCNoModelRoot.document, {
            modelRoot: modelCNoModelRoot.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values should fork at Model A.1 with the same values but new ids', () => {
        expect(
          forkDocument(modelCNoModelRoot.document, {
            modelRoot: modelCNoModelRoot.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values should return the original documents', () => {
        expect(
          forkDocument(modelCNoModelRoot.document, {
            modelRoot: modelCNoModelRoot.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model C - model root depth 1', () => {
      test('Fork template should fork at Model A.1 with nuked values throughout', () => {
        expect(
          forkDocument(modelCNoModelRootDepth1.document, {
            modelRoot: modelCNoModelRootDepth1.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values should fork at Model A.1 with the same values but new ids', () => {
        expect(
          forkDocument(modelCNoModelRootDepth1.document, {
            modelRoot: modelCNoModelRootDepth1.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values should return the original documents', () => {
        expect(
          forkDocument(modelCNoModelRootDepth1.document, {
            modelRoot: modelCNoModelRootDepth1.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model C - model root depth 2', () => {
      test('Fork template should fork at Model C.1 with nuked values throughout', () => {
        expect(
          forkDocument(modelCNoModelRootDepth2.document, {
            modelRoot: modelCNoModelRootDepth2.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values should fork at Model C.1 with the same values but new ids', () => {
        expect(
          forkDocument(modelCNoModelRootDepth2.document, {
            modelRoot: modelCNoModelRootDepth2.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values should return the original documents', () => {
        expect(
          forkDocument(modelCNoModelRootDepth2.document, {
            modelRoot: modelCNoModelRootDepth2.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model C - model root depth 1 + field under', () => {
      test('Fork template should create new field-b and model-c', () => {
        expect(
          forkDocument(modelCNoModelRootDepth1FieldUnder.document, {
            modelRoot: modelCNoModelRootDepth1FieldUnder.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values should create new field-b and model-c with values', () => {
        expect(
          forkDocument(modelCNoModelRootDepth1FieldUnder.document, {
            modelRoot: modelCNoModelRootDepth1FieldUnder.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values should set values immutable until field-b and model-c', () => {
        expect(
          forkDocument(modelCNoModelRootDepth1FieldUnder.document, {
            modelRoot: modelCNoModelRootDepth1FieldUnder.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model C - model root depth 1 + field over', () => {
      test('Fork template should keep model a immutable, but keep the field over mutable', () => {
        expect(
          forkDocument(modelCNoModelRootDepth1FieldOver.document, {
            modelRoot: modelCNoModelRootDepth1FieldOver.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values should keep model a immutable, but keep the field over mutable', () => {
        expect(
          forkDocument(modelCNoModelRootDepth1FieldOver.document, {
            modelRoot: modelCNoModelRootDepth1FieldOver.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values should should keep model a immutable, but keep the field over mutable', () => {
        expect(
          forkDocument(modelCNoModelRootDepth1FieldOver.document, {
            modelRoot: modelCNoModelRootDepth1FieldOver.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model C - model root depth 2 + field over', () => {
      test('Fork template should keep both models immutable, but keep the field over mutable', () => {
        expect(
          forkDocument(modelCNoModelRootDepth2FieldOver.document, {
            modelRoot: modelCNoModelRootDepth2FieldOver.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values should keep both models immutable, but keep the field over mutable', () => {
        expect(
          forkDocument(modelCNoModelRootDepth2FieldOver.document, {
            modelRoot: modelCNoModelRootDepth2FieldOver.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values should should keep both models immutable, but keep the field over mutable', () => {
        expect(
          forkDocument(modelCNoModelRootDepth2FieldOver.document, {
            modelRoot: modelCNoModelRootDepth2FieldOver.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model C - model root depth 2 + field over (x2)', () => {
      test('Fork template should keep model a immutable, but keep all 2 fields over mutable', () => {
        expect(
          forkDocument(modelCNoModelRootDepth2FieldOver2x.document, {
            modelRoot: modelCNoModelRootDepth2FieldOver2x.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values should keep model a immutable, but keep all 2 fields over mutable', () => {
        expect(
          forkDocument(modelCNoModelRootDepth2FieldOver2x.document, {
            modelRoot: modelCNoModelRootDepth2FieldOver2x.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values should should keep model a immutable, but keep all 2 fields over mutable', () => {
        expect(
          forkDocument(modelCNoModelRootDepth2FieldOver2x.document, {
            modelRoot: modelCNoModelRootDepth2FieldOver2x.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });
  });

  describe('Multi-dimensional revision creation (adjacent at all levels)', () => {
    describe('Edit model B - edit nested field (no duplicate allow) [model-b]', () => {
      test('Fork template, model-b should be immutable, the rest mutable and forked', () => {
        expect(
          forkDocument(editModelBDepth1.document, {
            modelRoot: editModelBDepth1.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values - model-b should be immutable, the rest mutable with values', () => {
        expect(
          forkDocument(editModelBDepth1.document, {
            modelRoot: editModelBDepth1.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values - model-b should be immutable, the rest should be the same', () => {
        expect(
          forkDocument(editModelBDepth1.document, {
            modelRoot: editModelBDepth1.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model B - edit nested field (root on allowMultiple=false)', () => {
      test('Fork template, no models should be forked, since allowMultiple is in the root', () => {
        expect(
          forkDocument(editModelBDepth2.document, {
            modelRoot: editModelBDepth2.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values - model-b and c should be immutable, the rest mutable with values', () => {
        expect(
          forkDocument(editModelBDepth2.document, {
            modelRoot: editModelBDepth2.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values - model-b and c should be immutable, the rest should be the same', () => {
        expect(
          forkDocument(editModelBDepth2.document, {
            modelRoot: editModelBDepth2.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model B - depth 3', () => {
      test('Fork template, should...', () => {
        expect(
          forkDocument(editModelBDepth3.document, {
            modelRoot: editModelBDepth3.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values - should...', () => {
        expect(
          forkDocument(editModelBDepth3.document, {
            modelRoot: editModelBDepth3.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values - should...', () => {
        expect(
          forkDocument(editModelBDepth3.document, {
            modelRoot: editModelBDepth3.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    // modelMapping: {
    //   'model-g': '20254fca-fdad-4c70-b748-590f206e51d8',
    // },

    describe('Edit model F - depth 1', () => {
      test('Fork template, should only contain 1 model', () => {
        expect(
          forkDocument(modelFDepth1.document, {
            modelRoot: modelFDepth1.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
          })
        ).toMatchSnapshot();
      });
      test('Fork values - should only contain ??? model', () => {
        expect(
          forkDocument(modelFDepth1.document, {
            modelRoot: modelFDepth1.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
          })
        ).toMatchSnapshot();
      });
      test('Edit values - should contain all models', () => {
        expect(
          forkDocument(modelFDepth1.document, {
            modelRoot: modelFDepth1.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Edit model F - depth 2', () => {
      test('Fork template, should only contain 1 model matching ID', () => {
        expect(
          forkDocument(modelFDepth2.document, {
            modelRoot: modelFDepth2.modelRoot,
            revisionId: 'REVISION-ID',
            removeDefaultValues: true,
            modelMapping: {
              'model-g': '1a7e07f0-f111-406e-972e-71976258a47f',
            },
          })
        ).toMatchSnapshot();
      });
      test('Fork values - should only contain ??? model', () => {
        const forkedValues = forkDocument(modelFDepth2.document, {
          modelRoot: modelFDepth2.modelRoot,
          revisionId: 'REVISION-ID',
          removeValues: false,
          modelMapping: {
            'model-g': '1a7e07f0-f111-406e-972e-71976258a47f',
          },
        });

        // This is what's wrong with the forked values here.
        expect(
          (forkedValues as any).properties['model-f'][0].properties['model-g'][0].properties['field-f'][0].revises
        ).toBeUndefined();

        expect(
          forkDocument(modelFDepth2.document, {
            modelRoot: modelFDepth2.modelRoot,
            revisionId: 'REVISION-ID',
            removeValues: false,
            modelMapping: {
              'model-g': '1a7e07f0-f111-406e-972e-71976258a47f',
            },
          })
        ).toMatchSnapshot();
      });
      test('Edit values - should contain all models', () => {
        expect(
          forkDocument(modelFDepth2.document, {
            modelRoot: modelFDepth2.modelRoot,
            revisionId: 'REVISION-ID',
            editValues: true,
          })
        ).toMatchSnapshot();
      });
    });

    describe('Model H - 2x2 models', () => {
      describe('test model-h depth 0', () => {
        test('Fork template, should only contain one model at each level', () => {
          expect(
            forkDocument(modelIDepth0.document, {
              modelRoot: modelIDepth0.modelRoot,
              revisionId: 'REVISION-ID',
              removeDefaultValues: true,
            })
          ).toMatchSnapshot();
        });
        test('Fork values - should only contain all models, with values but no revises', () => {
          expect(
            forkDocument(modelIDepth0.document, {
              modelRoot: modelIDepth0.modelRoot,
              revisionId: 'REVISION-ID',
              removeValues: false,
            })
          ).toMatchSnapshot();
        });
        test('Edit values - should contain all models', () => {
          expect(
            forkDocument(modelIDepth0.document, {
              modelRoot: modelIDepth0.modelRoot,
              revisionId: 'REVISION-ID',
              editValues: true,
            })
          ).toMatchSnapshot();
        });
      });
      describe('test model-h depth 1', () => {
        test('Fork template, should only contain one model at each level', () => {
          expect(
            forkDocument(modelIDepth1.document, {
              modelRoot: modelIDepth1.modelRoot,
              revisionId: 'REVISION-ID',
              removeDefaultValues: true,
            })
          ).toMatchSnapshot();
        });
        test('Fork values - should only contain all models, with values but no revises', () => {
          expect(
            forkDocument(modelIDepth1.document, {
              modelRoot: modelIDepth1.modelRoot,
              revisionId: 'REVISION-ID',
              removeValues: false,
            })
          ).toMatchSnapshot();
        });
        test('Edit values - should contain all models', () => {
          expect(
            forkDocument(modelIDepth1.document, {
              modelRoot: modelIDepth1.modelRoot,
              revisionId: 'REVISION-ID',
              editValues: true,
            })
          ).toMatchSnapshot();
        });
      });
      describe('test model-h depth 1 - with field value at depth below should _not_ filter', () => {
        test('Fork template, should only contain one model at each level, not any special selection', () => {
          expect(
            forkDocument(modelIDepth1.document, {
              modelRoot: modelIDepth1.modelRoot,
              revisionId: 'REVISION-ID',
              removeDefaultValues: true,
              modelMapping: {
                'model-i': '7de07c37-6157-4d63-8097-d2d4a78b778f',
              },
            })
          ).toMatchSnapshot();
        });
        test('Fork values - should only contain all models, and not filter', () => {
          expect(
            forkDocument(modelIDepth1.document, {
              modelRoot: modelIDepth1.modelRoot,
              revisionId: 'REVISION-ID',
              removeValues: false,
              modelMapping: {
                'model-i': '7de07c37-6157-4d63-809 7-d2d4a78b778f',
              },
            })
          ).toMatchSnapshot();
        });
        test('Edit values - should contain all models', () => {
          expect(
            forkDocument(modelIDepth1.document, {
              modelRoot: modelIDepth1.modelRoot,
              revisionId: 'REVISION-ID',
              editValues: true,
              modelMapping: {
                'model-i': '7de07c37-6157-4d63-8097-d2d4a78b778f',
              },
            })
          ).toMatchSnapshot();
        });
      });
      describe('test model-h depth 1 - with field value at first depth', () => {
        test('Fork template, should only contain one model at each level, using chosen model H', () => {
          expect(
            forkDocument(modelIDepth1.document, {
              modelRoot: modelIDepth1.modelRoot,
              revisionId: 'REVISION-ID',
              removeDefaultValues: true,
              modelMapping: {
                'model-h': 'aa6fe309-deef-4211-802c-dbc0f2ba16ed',
              },
            })
          ).toMatchSnapshot();
        });
        test('Fork values - should only contain all models under model h, with values but no revises', () => {
          expect(
            forkDocument(modelIDepth1.document, {
              modelRoot: modelIDepth1.modelRoot,
              revisionId: 'REVISION-ID',
              removeValues: false,
              modelMapping: {
                'model-h': 'aa6fe309-deef-4211-802c-dbc0f2ba16ed',
              },
            })
          ).toMatchSnapshot();
        });
        test('Edit values - should contain all models under chosen model h', () => {
          expect(
            forkDocument(modelIDepth1.document, {
              modelRoot: modelIDepth1.modelRoot,
              revisionId: 'REVISION-ID',
              editValues: true,
              modelMapping: {
                'model-h': 'aa6fe309-deef-4211-802c-dbc0f2ba16ed',
              },
            })
          ).toMatchSnapshot();
        });
      });
      describe('test model-h depth 2 - with field value at all depths', () => {
        test('Fork template, should only contain one model at each level', () => {
          expect(
            forkDocument(modelIDepth2.document, {
              modelRoot: modelIDepth2.modelRoot,
              revisionId: 'REVISION-ID',
              removeDefaultValues: true,
              modelMapping: {
                'model-h': 'aa6fe309-deef-4211-802c-dbc0f2ba16ed',
                'model-i': '915106fd-f663-4e55-a727-8253e251c62d',
              },
            })
          ).toMatchSnapshot();
        });
        test('Fork values - should only contain all models, with values but no revises', () => {
          expect(
            forkDocument(modelIDepth2.document, {
              modelRoot: modelIDepth2.modelRoot,
              revisionId: 'REVISION-ID',
              removeValues: false,
              modelMapping: {
                'model-h': 'aa6fe309-deef-4211-802c-dbc0f2ba16ed',
                'model-i': '915106fd-f663-4e55-a727-8253e251c62d',
              },
            })
          ).toMatchSnapshot();
        });
        test('Edit values - should contain all models', () => {
          expect(
            forkDocument(modelIDepth2.document, {
              modelRoot: modelIDepth2.modelRoot,
              revisionId: 'REVISION-ID',
              editValues: true,
              modelMapping: {
                'model-h': 'aa6fe309-deef-4211-802c-dbc0f2ba16ed',
                'model-i': '915106fd-f663-4e55-a727-8253e251c62d',
              },
            })
          ).toMatchSnapshot();
        });
      });
      describe('test model-h depth 2 - with field value at different depths – invalid state', () => {
        test('Fork template, should only contain one model at each level', () => {
          expect(
            forkDocument(modelIDepth2.document, {
              modelRoot: modelIDepth2.modelRoot,
              revisionId: 'REVISION-ID',
              removeDefaultValues: true,
              modelMapping: {
                'model-h': 'aa6fe309-deef-4211-802c-dbc0f2ba16ed',
                'model-i': '7de07c37-6157-4d63-8097-d2d4a78b778f',
              },
            })
          ).toMatchSnapshot();
        });
        test('Fork values - should only contain all models, with values but no revises', () => {
          expect(
            forkDocument(modelIDepth2.document, {
              modelRoot: modelIDepth2.modelRoot,
              revisionId: 'REVISION-ID',
              removeValues: false,
              modelMapping: {
                'model-h': 'aa6fe309-deef-4211-802c-dbc0f2ba16ed',
                'model-i': '7de07c37-6157-4d63-8097-d2d4a78b778f',
              },
            })
          ).toMatchSnapshot();
        });
        test('Edit values - should contain all models', () => {
          expect(
            forkDocument(modelIDepth2.document, {
              modelRoot: modelIDepth2.modelRoot,
              revisionId: 'REVISION-ID',
              editValues: true,
              modelMapping: {
                'model-h': 'aa6fe309-deef-4211-802c-dbc0f2ba16ed',
                'model-i': '7de07c37-6157-4d63-8097-d2d4a78b778f',
              },
            })
          ).toMatchSnapshot();
        });
      });
    });

    // Documentation
    // - immutable based on model root
    // - Cloning first OR provided model id for forks
    // - Editing any using provided model id
    // - Fields above the model root

    // Based on missing features.
    test.todo('Test `editableAboveRoot` option should make fields above root immutable');
    test.todo('Test `preventAdditionsAdjacentToRoot` option should make entities at root immutable');

    // Based on coverage.
    test.todo('Filtering documents using filterDocumentGraph for immutable top half');
    test.todo('Allow multiple immutable top level documents');
    test.todo('Check error testing for 0 mutable documents');
    test.todo('Check that when a parent mutable document is removed, the child is too');
    test.todo('Check for when plugin does not exist for field, that it is filtered out');
    test.todo('Handling of parent branching and setting a new ID on the field as a result');
  });

  describe('Revision with revised field', () => {
    const multi = require('../../../fixtures/03-revisions/05-allow-multiple-transcriptions.json');
    test('Canonical revision should contain both types and filter out the empty', () => {
      const [main] = captureModelToRevisionList(multi, true);

      expect(main.document.properties.transcription).toHaveLength(2);
    });
    test('When forking a revision, only the canonical revisions should be used as a template (no revises)', () => {
      const [main] = captureModelToRevisionList(multi, true);

      expect(
        forkDocument(main.document, {
          modelRoot: main.modelRoot,
          revisionId: 'REVISION-ID',
          removeDefaultValues: true,
        }).properties.transcription
      ).toHaveLength(2);
    });

    test('Revising a revision that is not canonical should only return those fields with revises', () => {
      const [, second] = captureModelToRevisionList(multi, true);

      expect(
        forkDocument(second.document, {
          modelRoot: second.modelRoot,
          revisionId: 'REVISION-ID',
          removeDefaultValues: false,
          removeValues: false,
          addRevises: true, // <-- this will be the case when a revision is revised, this decides if its a new person, or editing of a person.
        }).properties.transcription[0].revises
      ).toEqual('2666cf79-ef2f-419f-a3f4-038216a89783');
    });
    test('There should be a way to create a new empty transcription using fork template', () => {
      const [main] = captureModelToRevisionList(multi, true);

      expect(
        forkDocument(main.document, {
          modelRoot: main.modelRoot,
          revisionId: 'REVISION-ID',
          removeDefaultValues: true,
          addRevises: false,
        }).properties.transcription
      ).toHaveLength(1);
    });
  });
});
