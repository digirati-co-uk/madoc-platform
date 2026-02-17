/**
 * @jest-environment node
 */

import { useCaptureModelEditorApi } from '../../../src/frontend/shared/capture-models/new/hooks/use-capture-model-editor-api';

describe('useCaptureModelEditorApi export', () => {
  test('hook is exported', () => {
    expect(typeof useCaptureModelEditorApi).toEqual('function');
  });
});
