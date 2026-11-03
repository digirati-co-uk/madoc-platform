/** @jest-environment jsdom */
import { ExportFile } from '../../../src/extensions/project-export/server-export';
import { stringify as nodeStringify } from 'csv-stringify/sync';

// Jest uses CJS; execute the actual exported browser ESM bundle in an isolated
// context with no Node globals, instead of substituting the Node implementation.
jest.mock('csv-stringify/browser/esm/sync', () => {
  const source: string = require('fs').readFileSync(require.resolve('csv-stringify/browser/esm/sync'), 'utf-8');
  const context: { stringify?: (input: unknown, options: unknown) => string } = {};
  require('vm').runInNewContext(source.replace('export { stringify };', 'globalThis.stringify = stringify;'), context);
  return { stringify: context.stringify };
});

test('browser CSV works without Buffer and preserves server quoting, Unicode and file metadata', async () => {
  const input = [
    { name: 'Alice, "A"', value: 'one\ntwo', optional: null },
    { name: 'Cymraeg — ŵ', value: 'text', optional: false },
  ];
  const file = await ExportFile.csv(input, '/test.csv', { manifest: 2 });
  expect(file).toEqual({
    path: '/test.csv',
    text: true,
    metadata: { manifest: 2 },
    content: { type: 'text', value: nodeStringify(input, { header: true }), contentType: 'text/csv' },
  });
  expect((await ExportFile.csv([], '/empty.csv')).content.value).toBe('');
});
