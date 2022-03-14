import { CaptureModel } from '../types/capture-model';

export function resolveSubtreeWithIds(subtreePath: [string, string, boolean?][], document: CaptureModel['document']) {
  return subtreePath.reduce((acc, [term, id]) => {
    const propValue = acc.properties[term];
    const singleModel = (propValue as CaptureModel['document'][]).find(value => value.id === id);
    if (!propValue.length || !singleModel) {
      throw Error(`Invalid prop: ${term} with id ${id} in list ${subtreePath.join(',')}`);
    }
    return singleModel as CaptureModel['document'];
  }, document);
}
