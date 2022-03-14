/**
 * @jest-environment jsdom
 */

// @ts-ignore
// eslint-disable-next-line
if (global) { global.globalThis = global; } else { try { globalThis = typeof globalThis !== 'undefined' ? this : globalThis; } catch (e) {} }

import * as React from 'react';
import { captureModelToRevisionList } from '../../../src/frontend/shared/capture-models/helpers/capture-model-to-revision-list';
import { hydratePartialDocument } from '../../../src/frontend/shared/capture-models/helpers/hydrate-partial-document';
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

const GENERATED_ID = '[--------GENERATED-ID--------]';

generateId.mockImplementation(() => GENERATED_ID);

describe('hydratePartialDocument', () => {
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
    modelB1Field,
  ] = captureModelToRevisionList(captureModel, true);

  test('Addition of missing entity', () => {
    const newDocument = hydratePartialDocument(
      // @ts-ignore
      editModelAWithRoot.document.properties['model-a'][0],
      captureModel.document.properties['model-a'][0],
      {
        keepValues: true,
        markAsImmutable: false,
        clone: true,
      }
    );
    expect(newDocument).toHaveProperty(['properties', 'model-c']);
    expect(newDocument).toHaveProperty(['properties', 'model-c', 0, 'id'], GENERATED_ID);
    expect(newDocument).toHaveProperty(['properties', 'model-c', 0, 'properties', 'field-c']);
    expect(newDocument).toHaveProperty(['properties', 'model-c', 0, 'properties', 'field-c', 0, 'id'], GENERATED_ID);
  });

  test('Addition of missing field', () => {
    const newDocument = hydratePartialDocument(
      // @ts-ignore
      modelCNoModelRoot.document.properties['model-a'][0],
      captureModel.document.properties['model-a'][0],
      {
        keepValues: true,
        markAsImmutable: false,
        clone: true,
      }
    );

    // To have the original document
    expect(newDocument).toHaveProperty(['properties', 'model-c']);
    // And the missing field
    expect(newDocument).toHaveProperty(['properties', 'field-b']);
    expect(newDocument).toHaveProperty(['properties', 'field-b', 0, 'id'], GENERATED_ID);
  });

  test('Addition of 2nd depth field', () => {
    const newDocument = hydratePartialDocument(
      // @ts-ignore
      modelFDepth1.document.properties['model-f'][0],
      captureModel.document.properties['model-f'][0],
      {
        keepValues: true,
        markAsImmutable: false,
        clone: true,
      }
    );
    // model-f, model-g, field-f
    expect(newDocument).toHaveProperty(['properties', 'field-e']);
    expect(newDocument).toHaveProperty(['properties', 'field-e', 0, 'id'], GENERATED_ID);
  });

  test('Addition of 2nd depth entity', () => {
    const newDocument = hydratePartialDocument(
      // @ts-ignore
      modelB1Field.document.properties['model-b'][0],
      captureModel.document.properties['model-b'][0],
      {
        keepValues: true,
        markAsImmutable: false,
        clone: true,
      }
    );
    expect(newDocument).toHaveProperty(['properties', 'field-d']);
    expect(newDocument).toHaveProperty(['properties', 'field-d', 0, 'id'], GENERATED_ID);
    expect(newDocument).toHaveProperty(['properties', 'model-c', 0, 'properties', 'field-e']);
    expect(newDocument).toHaveProperty(['properties', 'model-c', 0, 'properties', 'field-e', 0, 'id'], GENERATED_ID);
  });

  test('Can skip hydrating the root', () => {
    const newDocument = hydratePartialDocument(
      // @ts-ignore
      modelB1Field.document,
      captureModel.document,
      {
        hydrateRoot: false,
        keepValues: true,
        markAsImmutable: false,
        clone: true,
      }
    );
    expect(newDocument).not.toHaveProperty(['properties', 'model-a']);
    expect(newDocument).not.toHaveProperty(['properties', 'model-h']);
  });

  test.todo('Error when property mismatch');
  test.todo('Error when no values in property from reference document');
});
