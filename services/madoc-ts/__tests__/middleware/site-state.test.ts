import { siteState, siteStateAllowPrivate } from '../../src/middleware/site-state';
import { api } from '../../src/gateway/api.server';
import { cachedApiHelper } from '../../src/utility/cached-api-helper';

jest.mock('../../src/gateway/api.server', () => ({
  api: {
    asUser: jest.fn(),
  },
}));

jest.mock('../../src/utility/cached-api-helper', () => ({
  cachedApiHelper: jest.fn(),
}));

function createContext() {
  return {
    params: { slug: 'private-site' },
    state: {},
    siteManager: {
      getCachedSiteIdBySlug: jest.fn().mockResolvedValue({ id: 12, slug: 'private-site' }),
      getSiteBySlug: jest.fn().mockResolvedValue({ id: 12, slug: 'private-site' }),
      getLatestTermsId: jest.fn().mockResolvedValue(null),
    },
  } as unknown as Parameters<typeof siteState>[0];
}

describe('site-state middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses cached-site resolver in default mode', async () => {
    const dispose = jest.fn();
    const next = jest.fn().mockResolvedValue(undefined);
    const context = createContext();
    (api.asUser as jest.Mock).mockReturnValue({ dispose });
    (cachedApiHelper as jest.Mock).mockReturnValue('cached-api');

    await siteState(context, next);

    expect(context.siteManager.getCachedSiteIdBySlug).toHaveBeenCalledWith('private-site', undefined, false);
    expect(context.siteManager.getSiteBySlug).not.toHaveBeenCalled();
    expect(api.asUser).toHaveBeenCalledWith({ siteId: 12, userId: undefined }, { siteSlug: 'private-site' }, true);
    expect(cachedApiHelper).toHaveBeenCalledWith(context.state.siteApi, 12);
    expect(next).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  test('uses private-site resolver in allow-private mode', async () => {
    const dispose = jest.fn();
    const next = jest.fn().mockResolvedValue(undefined);
    const context = createContext();
    (api.asUser as jest.Mock).mockReturnValue({ dispose });
    (cachedApiHelper as jest.Mock).mockReturnValue('cached-api');

    await siteStateAllowPrivate(context, next);

    expect(context.siteManager.getSiteBySlug).toHaveBeenCalledWith('private-site');
    expect(context.siteManager.getCachedSiteIdBySlug).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(dispose).toHaveBeenCalledTimes(1);
  });

  test('reuses existing state without reloading site', async () => {
    const next = jest.fn().mockResolvedValue(undefined);
    const context = createContext();
    const existingApi = { dispose: jest.fn() };
    const existingState = context.state as Parameters<typeof siteState>[0]['state'];
    existingState.site = {
      id: 12,
      slug: 'private-site',
      title: 'Private site',
      is_public: false,
      created: new Date(),
      config: {
        enableRegistrations: true,
        registeredUserTranscriber: false,
        emailActivation: false,
        enableNotifications: false,
        autoPublishImport: false,
      },
    };
    existingState.siteApi = existingApi as unknown as Parameters<typeof siteState>[0]['state']['siteApi'];
    existingState.cachedApi = jest.fn() as unknown as Parameters<typeof siteState>[0]['state']['cachedApi'];

    await siteStateAllowPrivate(context, next);

    expect(context.siteManager.getSiteBySlug).not.toHaveBeenCalled();
    expect(context.siteManager.getCachedSiteIdBySlug).not.toHaveBeenCalled();
    expect(api.asUser).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledTimes(1);
    expect(existingApi.dispose).not.toHaveBeenCalled();
  });
});
