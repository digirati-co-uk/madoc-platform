import { captureModelShorthand } from './capture-model-shorthand';
import { hydrateCaptureModel } from './hydrate-capture-model';

export function hydrateCompressedModel<T = any>({ __meta__, ...json }: T & { __meta__: { [key: string]: string } }) {
  return hydrateCaptureModel(captureModelShorthand(__meta__), json);
}
