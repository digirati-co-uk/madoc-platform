import { jobHandler, createTask, backfillResource } from './backfill-all-iiif-properties';
import { restoreIIIFProperties } from './backfill-iiif-properties';
import { systemRedis } from '../../utility/system-redis';
import { createPostgresPool } from '../../database/create-postgres-pool';
import { ApiClient } from '../api';

jest.mock('./backfill-iiif-properties', () => ({ restoreIIIFProperties: jest.fn() }));
jest.mock('../../utility/system-redis', () => ({ systemRedis: jest.fn(), IIIF_BACKFILL_LATEST_KEY: 'latest' }));
jest.mock('../../database/create-postgres-pool', () => ({ createPostgresPool: jest.fn() }));

const restore = restoreIIIFProperties as jest.Mock;
beforeEach(() => {
  jest.clearAllMocks();
});

test('scopes each manifest to its own site and disposes the API after failure', async () => {
  const scoped = { dispose: jest.fn() };
  const api = { asUser: jest.fn().mockReturnValue(scoped) };
  restore.mockRejectedValueOnce(new Error('Unavailable source'));
  await expect(
    backfillResource(
      api as unknown as ApiClient,
      { id: 1, site_id: 7, resource_id: 12, source: 'https://example.org/m' },
      3
    )
  ).rejects.toThrow('Unavailable');
  expect(api.asUser).toHaveBeenCalledWith({ siteId: 7, userId: 3 }, {}, true);
  expect(scoped.dispose).toHaveBeenCalled();
  expect(
    await backfillResource(api as unknown as ApiClient, { id: 2, site_id: 7, resource_id: 13, source: 'urn:local' }, 3)
  ).toBe('skipped');
});

test('continues after one failed source, reports failures, and skips local resources', async () => {
  const state = createTask(1, 3, 30);
  (systemRedis as jest.Mock).mockResolvedValue({
    get: jest.fn().mockResolvedValue(JSON.stringify({ taskId: 'root' })),
  });
  (createPostgresPool as jest.Mock).mockReturnValue({
    any: jest
      .fn()
      .mockResolvedValueOnce([
        { id: 10, site_id: 1, resource_id: 11, source: 'https://example.org/fail' },
        { id: 20, site_id: 2, resource_id: 22, source: 'urn:local' },
        { id: 30, site_id: 2, resource_id: 33, source: 'https://example.org/success' },
      ])
      .mockResolvedValueOnce([]),
  });
  restore.mockRejectedValueOnce(new Error('Unavailable')).mockResolvedValueOnce(undefined);
  const scoped = { dispose: jest.fn() };
  const api = {
    acceptTask: jest.fn().mockResolvedValue(state),
    updateTask: jest.fn(),
    asUser: jest.fn().mockReturnValue(scoped),
  };
  await jobHandler('created', 'root', api as unknown as ApiClient);
  expect(api.updateTask).toHaveBeenLastCalledWith(
    'root',
    expect.objectContaining({
      status: -1,
      state: expect.objectContaining({
        processed: 3,
        queued: 1,
        skipped: 1,
        failed: 1,
        failures: [{ siteId: 1, resourceId: 11, error: 'Unavailable' }],
      }),
    })
  );
  expect(scoped.dispose).toHaveBeenCalledTimes(2);
});

test('generic task creation cannot bypass global-admin authorization', async () => {
  (systemRedis as jest.Mock).mockResolvedValue({
    get: jest.fn().mockResolvedValue(JSON.stringify({ taskId: 'authorized' })),
  });
  const api = { acceptTask: jest.fn() };
  await expect(jobHandler('created', 'forged', api as unknown as ApiClient)).rejects.toThrow('global administrator');
  expect(api.acceptTask).not.toHaveBeenCalled();
});
