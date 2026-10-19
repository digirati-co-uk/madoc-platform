import { AnalyticsRepository } from '../repository/analytics-repository';
import { getAnalytics, recordPageView } from './analytics';

jest.mock('../repository/analytics-repository');
const report = jest.fn().mockResolvedValue({ totals: {} });
const record = jest.fn().mockResolvedValue(undefined);

function context(scope: string[] = ['site.admin'], role = 'admin') {
  return {
    state: { jwt: { user: { id: 7, service: false }, site: { id: 3 }, scope } },
    params: { slug: 'test' },
    query: {},
    requestBody: {},
    host: 'madoc.local',
    get: jest.fn((header: string): string => (header === 'origin' ? 'https://madoc.local' : '')),
    set: jest.fn(),
    connection: { maybeOne: jest.fn() },
    siteManager: {
      getUserById: jest.fn().mockResolvedValue({ role }),
      getCachedSiteIdBySlug: jest.fn().mockResolvedValue({ id: 3 }),
    },
  };
}

type AnalyticsContext = Parameters<typeof getAnalytics>[0];
const next = async () => undefined;

beforeEach(() => {
  jest.clearAllMocks();
  (AnalyticsRepository as jest.Mock).mockImplementation(() => ({ report, recordPageView: record }));
});

test('reporting requires a signed-in site admin', async () => {
  const anonymous = { ...context(), state: {} };
  await expect(getAnalytics(anonymous as unknown as AnalyticsContext, next)).rejects.toThrow();
  await expect(getAnalytics(context(['models.contribute']) as unknown as AnalyticsContext, next)).rejects.toThrow();
  expect(report).not.toHaveBeenCalled();
});

test('site reports derive their tenant from the verified token, never the query', async () => {
  const ctx = { ...context(), query: { siteId: '999', days: '7' } };
  await getAnalytics(ctx as unknown as AnalyticsContext, next);
  expect(report).toHaveBeenCalledWith(3, 7);
  expect(ctx.set).toHaveBeenCalledWith('Cache-Control', 'private, no-store');
});

test('only a verified global admin can request all sites', async () => {
  await expect(
    getAnalytics({ ...context(), query: { scope: 'all' } } as unknown as AnalyticsContext, next)
  ).rejects.toThrow();
  expect(report).not.toHaveBeenCalled();
  const global = { ...context(['site.admin'], 'global_admin'), query: { scope: 'all' } };
  await getAnalytics(global as unknown as AnalyticsContext, next);
  expect(global.siteManager.getUserById).toHaveBeenCalledWith(7);
  expect(report).toHaveBeenCalledWith(null, 30);
});

test.each([{ days: '0' }, { days: '366' }, { days: ['7', '365'] }, { scope: 'other' }])(
  'rejects invalid report query %j',
  async query => {
    await expect(getAnalytics({ ...context(), query } as unknown as AnalyticsContext, next)).rejects.toThrow();
    expect(report).not.toHaveBeenCalled();
  }
);

test('page views use trusted site and authentication status', async () => {
  await recordPageView(context() as unknown as AnalyticsContext, next);
  expect(record).toHaveBeenCalledWith(3, 0, true);
  await recordPageView({ ...context(), state: {} } as unknown as AnalyticsContext, next);
  expect(record).toHaveBeenCalledWith(3, 0, false);
});

test.each([
  undefined,
  null,
  [],
  { url: '/private' },
  { userId: 1 },
  { signedIn: true },
  { project: 1 },
  { project: '' },
  { project: '0' },
])('rejects raw event fields and invalid bodies %j', async requestBody => {
  await expect(recordPageView({ ...context(), requestBody } as unknown as AnalyticsContext, next)).rejects.toThrow();
  expect(record).not.toHaveBeenCalled();
});

test('rejects cross-origin traffic and mismatched site tokens', async () => {
  const foreign = context();
  foreign.get.mockImplementation(() => 'https://another.example');
  await expect(recordPageView(foreign as unknown as AnalyticsContext, next)).rejects.toThrow();
  const wrongSite = context();
  wrongSite.siteManager.getCachedSiteIdBySlug.mockResolvedValue({ id: 4 });
  await expect(recordPageView(wrongSite as unknown as AnalyticsContext, next)).rejects.toThrow();
  expect(record).not.toHaveBeenCalled();
});

test('resolves projects within the current site and rejects missing projects', async () => {
  const ctx = { ...context(), requestBody: { project: 'test-project' } };
  ctx.connection.maybeOne.mockResolvedValue(null);
  await expect(recordPageView(ctx as unknown as AnalyticsContext, next)).rejects.toThrow();
  expect(record).not.toHaveBeenCalled();
  ctx.connection.maybeOne.mockResolvedValue({ id: 18 });
  await recordPageView(ctx as unknown as AnalyticsContext, next);
  expect(record).toHaveBeenCalledWith(3, 18, true);
  expect(ctx.connection.maybeOne.mock.calls[0][0].values).toEqual([3, 'test-project']);
});
