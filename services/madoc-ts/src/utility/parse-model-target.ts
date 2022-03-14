import { CaptureModel } from '../frontend/shared/capture-models/types/capture-model';
import { resolveUrn } from './resolve-urn';

export function parseModelTarget(inputTarget: CaptureModel['target']) {
  const target = (inputTarget || []).map(t => resolveUrn(t.id));
  const collection = target.find(item => item && item.type.toLowerCase() === 'collection');
  const manifest = target.find(item => item && item.type.toLowerCase() === 'manifest');
  const canvas = target.find(item => item && item.type.toLowerCase() === 'canvas');

  return { collection, manifest, canvas };
}
