import { PageBlockExtension } from '../../../extensions/page-blocks/extension';

export function registerBlocks(blockMap: any) {
  const keys = Object.keys(blockMap);
  for (const key of keys) {
    const definition = blockMap[key][Symbol.for('slot-model')];
    if (definition) {
      PageBlockExtension.register(definition);
    }
  }
}
