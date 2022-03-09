import { captureModelShorthand } from '@capture-models/helpers';
import { CaptureModel } from '@capture-models/types';

export function captureModelShorthandModifier(
  shorthand: Record<string, any>,
  cb: (doc: CaptureModel['document']) => void
): CaptureModel['document'] {
  const document = captureModelShorthand(shorthand);
  cb(document);
  return document;
}
