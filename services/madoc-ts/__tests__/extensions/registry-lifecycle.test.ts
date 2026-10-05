import { RegistryExtension } from '../../src/extensions/registry-extension';

interface Definition {
  type: string;
  value: string;
}

class TestRegistry extends RegistryExtension<Definition> {
  constructor() {
    super({ registryName: 'lifecycle-test' });
  }
}

const emitter = RegistryExtension.emitter;

test('future registries replay current definitions without retaining superseded or removed plugin registrations', () => {
  const builtin = { type: 'example', value: 'builtin' };
  let historicalReads = 0;
  const historical = {
    get type() {
      historicalReads++;
      return 'example';
    },
    value: 'superseded',
  };
  const plugin = (pluginId: string, siteId: number, definition: Definition) => ({ pluginId, siteId, definition });
  emitter.emit('lifecycle-test', historical);
  emitter.emit('lifecycle-test', builtin);
  emitter.emit('plugin-lifecycle-test', plugin('first', 1, historical));
  emitter.emit('plugin-lifecycle-test', plugin('first', 1, { type: 'example', value: 'first' }));
  emitter.emit('plugin-lifecycle-test', plugin('second', 1, { type: 'example', value: 'second' }));
  emitter.emit('plugin-lifecycle-test', plugin('first', 2, { type: 'example', value: 'other site' }));
  historicalReads = 0;
  const current = new TestRegistry();
  expect(historicalReads).toBe(0);
  expect(current.getDefinition('example', 1).value).toBe('first');
  expect(current.getDefinition('example', 2).value).toBe('other site');
  expect(current.getDefinition('example', 3)).toBe(builtin);
  emitter.emit('remove-plugin-lifecycle-test', { type: 'example', pluginId: 'first', siteId: 1 });
  expect(current.getDefinition('example', 1).value).toBe('second');
  emitter.emit('plugin-lifecycle-test', plugin('first', 1, { type: 'example', value: 're-added' }));
  const subsequent = new TestRegistry();
  expect(subsequent.getDefinition('example', 1).value).toBe('second');
  emitter.emit('remove-plugin-lifecycle-test', { type: 'example', pluginId: 'second', siteId: 1 });
  expect(current.getDefinition('example', 1).value).toBe('re-added');
  emitter.emit('remove-plugin-lifecycle-test', { type: 'example', pluginId: 'first', siteId: 1 });
  emitter.emit('remove-plugin-lifecycle-test', { type: 'example', pluginId: 'first', siteId: 2 });
  const afterRemoval = new TestRegistry();
  expect(afterRemoval.getDefinition('example', 1)).toBe(builtin);
  expect(afterRemoval.pluginDefinitions).toEqual({});
  current.dispose();
  subsequent.dispose();
  afterRemoval.dispose();
  expect(emitter.all.get('lifecycle-test')).toEqual([]);
  expect(emitter.all.get('plugin-lifecycle-test')).toEqual([]);
  expect(emitter.all.get('remove-plugin-lifecycle-test')).toEqual([]);
});
