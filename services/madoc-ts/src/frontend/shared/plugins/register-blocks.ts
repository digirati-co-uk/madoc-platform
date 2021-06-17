import { reactBlockEmitter } from '../../../extensions/page-blocks/block-editor-react';

export function registerBlocks(blockMap: any) {
  const keys = Object.keys(blockMap);
  for (const key of keys) {
    const definition = blockMap[key][Symbol.for('slot-model')];
    if (definition) {
      reactBlockEmitter.emit('block', definition);
    }
  }
}
