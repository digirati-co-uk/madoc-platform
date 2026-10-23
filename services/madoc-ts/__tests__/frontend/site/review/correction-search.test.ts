import type { CaptureModel } from '../../../../src/frontend/shared/capture-models/types/capture-model';
import {
  persistAndRefreshCorrection,
  refreshCorrectionSearch,
} from '../../../../src/frontend/site/pages/tasks/review-listing/correction-search';
import { saveValueCorrections } from '../../../../src/frontend/site/pages/tasks/review-listing/save-value-corrections';

function fixture(): CaptureModel {
  return {
    id: 'model',
    structure: { id: 'structure', type: 'model', label: 'Form', fields: ['title'] },
    revisions: [{ id: 'approved', status: 'accepted', approved: true, fields: ['title'] }],
    target: [{ type: 'Canvas', id: 'urn:madoc:canvas:66690' }],
    document: {
      id: 'document',
      type: 'entity',
      label: 'Document',
      properties: {
        title: [{ id: 'title', type: 'text-field', label: 'Title', revision: 'approved', value: 'Typo' }],
      },
    },
  };
}

const indexed = {
  typesense: { indexed: 1, collection: 'madoc_site_1', importResult: { failed: 0, total: 1 } },
  warnings: [],
};

describe('correction search refresh', () => {
  test('indexes every distinct affected canvas/manifest through typed requests without force or workflow mutations', async () => {
    const model = fixture();
    model.target!.push(
      { type: 'Canvas', id: 'urn:madoc:canvas:66690' },
      { type: 'Manifest', id: 'urn:madoc:manifest:2' },
      { type: 'Collection', id: 'urn:madoc:collection:3' }
    );
    const request = jest.fn().mockResolvedValue(indexed);
    await refreshCorrectionSearch({ request }, model);
    expect(request.mock.calls).toEqual([
      ['/api/madoc/iiif/canvases/66690/index', { method: 'POST' }],
      ['/api/madoc/iiif/manifests/2/index', { method: 'POST' }],
    ]);
  });

  test.each([
    { noSearch: true },
    { noSearch: true, reason: 'Manifest is not published', warnings: [], cleanup: {} },
    { typesense: null, warnings: [] },
    { noSearch: true, typesense: null, warnings: [] },
    indexed,
  ])('accepts successful results and intentional disabled/unpublished skips: %j', async response => {
    await expect(
      refreshCorrectionSearch({ request: jest.fn().mockResolvedValue(response) }, fixture())
    ).resolves.toBeUndefined();
  });

  test.each([
    { ...indexed, warnings: ['Typesense unavailable'] },
    { noSearch: true, warnings: ['Typesense cleanup failed'] },
    { typesense: { indexed: 1, importResult: { failed: 1, total: 1 } }, warnings: [] },
    { typesense: { indexed: 0, importResult: { failed: 0, total: 1 } }, warnings: [] },
    {},
  ])('rejects HTTP 200 warnings, failed/partial imports and missing results: %j', async response => {
    await expect(
      refreshCorrectionSearch({ request: jest.fn().mockResolvedValue(response) }, fixture())
    ).rejects.toThrow(/Search could not refresh/);
  });

  test('attempts other targets even when one request fails', async () => {
    const model = fixture();
    model.target!.push({ type: 'Manifest', id: 'urn:madoc:manifest:2' });
    const request = jest.fn().mockRejectedValueOnce(new Error('HTTP 503')).mockResolvedValue(indexed);
    await expect(refreshCorrectionSearch({ request }, model)).rejects.toThrow(/Search could not refresh/);
    expect(request).toHaveBeenCalledTimes(2);
  });

  test('records persistence before indexing; a search-only retry never writes the correction again', async () => {
    const baseline = fixture();
    const save = jest.fn().mockResolvedValue(undefined);
    let saved = false;
    const onPersisted = jest.fn((_model: CaptureModel) => {
      saved = true;
    });
    const request = jest.fn().mockImplementation(async () => {
      expect(saved).toBe(true);
      expect(save).toHaveBeenCalledTimes(1);
      return { ...indexed, warnings: ['Typesense unavailable'] };
    });
    const result = await persistAndRefreshCorrection({
      persist: () =>
        saveValueCorrections({
          baseline,
          revisionId: 'approved',
          changes: [{ kind: 'value', id: 'title', value: 'Corrected' }],
          loadFresh: async () => fixture(),
          save,
        }),
      onPersisted,
      refreshSearch: model => refreshCorrectionSearch({ request }, model),
    });
    expect(result).toEqual({ saved: true, searchRefreshed: false });
    expect(onPersisted).toHaveBeenCalledWith(save.mock.calls[0][0]);
    request.mockResolvedValue(indexed);
    await refreshCorrectionSearch({ request }, onPersisted.mock.calls[0][0]);
    expect(save).toHaveBeenCalledTimes(1);
    expect(onPersisted).toHaveBeenCalledTimes(1);
  });

  test('failed writes propagate and never trigger persisted state or indexing', async () => {
    const onPersisted = jest.fn();
    const refreshSearch = jest.fn();
    await expect(
      persistAndRefreshCorrection({
        persist: jest.fn().mockRejectedValue(new Error('PUT failed')),
        onPersisted,
        refreshSearch,
      })
    ).rejects.toThrow('PUT failed');
    expect(onPersisted).not.toHaveBeenCalled();
    expect(refreshSearch).not.toHaveBeenCalled();
  });

  test('reports saved and refreshed after successful indexing', async () => {
    const model = fixture();
    const onPersisted = jest.fn();
    const request = jest.fn().mockResolvedValue(indexed);
    await expect(
      persistAndRefreshCorrection({
        persist: async () => model,
        onPersisted,
        refreshSearch: corrected => refreshCorrectionSearch({ request }, corrected),
      })
    ).resolves.toEqual({ saved: true, searchRefreshed: true });
    expect(onPersisted).toHaveBeenCalledWith(model);
  });
});
