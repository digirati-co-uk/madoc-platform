import { captureModelShorthand } from '../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { CaptureModel } from '../frontend/shared/capture-models/types/capture-model';

export function captureModelShorthandModifier(
  shorthand: Record<string, any>,
  cb: (doc: CaptureModel['document']) => void
): CaptureModel['document'] {
  const document = captureModelShorthand(shorthand);
  cb(document);
  return document;
}
