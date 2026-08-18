import {
  importConfiguration,
  serialiseConfiguration,
} from '../../../src/frontend/admin/components/ConfigurationImportExport';

describe('configuration import and export', () => {
  test('round-trips a partial configuration without clearing current values', () => {
    const current = { enableRegistrations: true, loginHeader: 'Current' };
    const exported = serialiseConfiguration('site', { loginHeader: 'Imported' });

    expect(importConfiguration(exported, 'site', current)).toEqual({
      enableRegistrations: true,
      loginHeader: 'Imported',
    });
  });

  test.each([
    ['malformed JSON', '{'],
    ['an untagged object', '{}'],
    ['the wrong scope', serialiseConfiguration('global', {})],
    ['a non-object configuration', JSON.stringify({ type: 'madoc-configuration', scope: 'site', configuration: [] })],
  ])('rejects %s', (_label, contents) => {
    expect(() => importConfiguration(contents, 'site', {})).toThrow();
  });
});
