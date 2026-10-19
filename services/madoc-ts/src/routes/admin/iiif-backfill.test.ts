import { startIIIFBackfill, iiifBackfillStatus } from './iiif-backfill';
import { api } from '../../gateway/api.server';
import { systemRedis } from '../../utility/system-redis';

jest.mock('../../gateway/api.server', () => ({ api: { asUser: jest.fn() } }));
jest.mock('../../utility/system-redis', () => ({ systemRedis: jest.fn(), IIIF_BACKFILL_LATEST_KEY: 'latest' }));

function context(role: string) {
  const connection = {
    query: jest.fn(),
    one: jest.fn().mockResolvedValue({ total: 5, until_id: 100 }),
    transaction: jest.fn(),
  };
  connection.transaction.mockImplementation(action => action(connection));
  return {
    state: { jwt: { scope: ['site.admin'], user: { id: 1 }, site: { id: 1 } } },
    siteManager: { getUserById: jest.fn().mockResolvedValue({ role }) },
    connection,
    disposableApis: [],
    body: undefined as unknown,
    status: 0,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

test.each([startIIIFBackfill, iiifBackfillStatus])(
  'rejects a site administrator before accessing global state',
  async handler => {
    const ctx = context('site_admin');
    await expect(handler(ctx as unknown as Parameters<typeof handler>[0], async () => {})).rejects.toThrow();
    expect(systemRedis).not.toHaveBeenCalled();
    expect(ctx.connection.query).not.toHaveBeenCalled();
  }
);

test('a global administrator can start an all-sites task with a fixed resource boundary', async () => {
  const ctx = context('global_admin');
  const redis = { get: jest.fn().mockResolvedValue(null), set: jest.fn() };
  (systemRedis as jest.Mock).mockResolvedValue(redis);
  const newTask = jest.fn().mockResolvedValue({ id: 'task', status: 0 });
  (api.asUser as jest.Mock).mockReturnValue({ newTask });
  await startIIIFBackfill(ctx as unknown as Parameters<typeof startIIIFBackfill>[0], async () => {});
  expect(newTask).toHaveBeenCalledWith(
    expect.objectContaining({ state: expect.objectContaining({ total: 5, untilId: 100 }) })
  );
  expect(redis.set).toHaveBeenCalledWith('latest', JSON.stringify({ taskId: 'task', siteId: 1 }));
  expect(ctx.status).toBe(202);
});

test('an existing running task is returned rather than starting another run', async () => {
  const ctx = context('global_admin');
  const previous = { id: 'existing', status: 2 };
  (systemRedis as jest.Mock).mockResolvedValue({
    get: jest.fn().mockResolvedValue(JSON.stringify({ taskId: 'existing', siteId: 2 })),
  });
  const scoped = { getTask: jest.fn().mockResolvedValue(previous), newTask: jest.fn(), dispose: jest.fn() };
  (api.asUser as jest.Mock).mockReturnValue(scoped);
  await startIIIFBackfill(ctx as unknown as Parameters<typeof startIIIFBackfill>[0], async () => {});
  expect(ctx.body).toEqual(previous);
  expect(scoped.newTask).not.toHaveBeenCalled();
  expect(scoped.dispose).toHaveBeenCalled();
});
