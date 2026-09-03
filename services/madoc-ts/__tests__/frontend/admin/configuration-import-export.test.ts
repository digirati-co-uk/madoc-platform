import {
  importConfiguration,
  serialiseConfiguration,
} from '../../../src/frontend/admin/components/ConfigurationImportExport';

describe('configuration import and export', () => {
  test('round-trips a partial configuration without clearing current values', () => {
    const current = {
      enableRegistrations: true,
      loginHeader: 'Current',
      projectPageOptions: { hideStatistics: false, hideSearchButton: false },
    };
    const exported = serialiseConfiguration('site', {
      loginHeader: 'Imported',
      projectPageOptions: { hideSearchButton: true },
    });

    expect(importConfiguration(exported, 'site', current)).toEqual({
      enableRegistrations: true,
      loginHeader: 'Imported',
      projectPageOptions: { hideStatistics: false, hideSearchButton: true },
    });
  });

  test('does not import template-immutable fields', () => {
    const current = { claimGranularity: 'canvas', randomCanvas: false };
    const exported = serialiseConfiguration('project', { claimGranularity: 'manifest', randomCanvas: true });

    expect(importConfiguration(exported, 'project', current, ['claimGranularity'])).toEqual({
      claimGranularity: 'canvas',
      randomCanvas: true,
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
