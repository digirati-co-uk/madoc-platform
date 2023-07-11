// Capture model shorthand editor - standalone.

import {
  createRevisionStore,
  revisionStore,
} from '../frontend/shared/capture-models/editor/stores/revisions/revisions-store';

import { captureModelRevisionStoreShorthand } from '../frontend/shared/capture-models/helpers/capture-model-revision-store-shorthand';
import { captureModelShorthand } from '../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { captureModelShorthandText } from '../frontend/shared/capture-models/helpers/capture-model-shorthand-text';
import { generateId } from '../frontend/shared/capture-models/helpers/generate-id';
import { hydrateCaptureModel } from '../frontend/shared/capture-models/helpers/hydrate-capture-model';
import { serialiseCaptureModel } from '../frontend/shared/capture-models/helpers/serialise-capture-model';
import { createRevisionFromDocument } from '../frontend/shared/utility/create-revision-from-document';
import { captureModelShorthandModifier } from '../utility/capture-model-shorthand-modifier';

// Exports.
export * from '../frontend/shared/capture-models/new/components/EditorSlots';
export * from '../frontend/shared/capture-models/editor/stores/revisions/revisions-provider';
export * from '../frontend/shared/capture-models/new/components/RevisionProviderWithFeatures';
export * from '../frontend/shared/capture-models/EditorShorthandCaptureModel';

export const utility = {
  revisionStore,
  hydrateCaptureModel,
  createRevisionStore,
  captureModelRevisionStoreShorthand,
  captureModelShorthandText,
  captureModelShorthandModifier,
  captureModelShorthand,
  serialiseCaptureModel,
  createRevisionFromDocument,
  generateId,
};
