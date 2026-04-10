import { createInternalAwareFetchJson } from '../../src/gateway/internal-fetch-json';

describe('internal-aware fetch json', () => {
  test('uses internal runner for local madoc routes', async () => {
    const networkFetcher = jest.fn();
    const runner = jest.fn().mockResolvedValue({
      status: 200,
      headers: {
        'content-type': 'application/json',
      },
      body: Buffer.from(JSON.stringify({ ok: true })),
    });

    const fetcher = createInternalAwareFetchJson({
      isEnabled: () => true,
      networkFetcher: networkFetcher as any,
      getRunner: () => runner,
    });

    const response = await fetcher<{ ok: boolean }>('http://gateway', '/api/madoc/projects/1', {
      method: 'POST',
      body: {
        label: 'Test',
      },
      jwt: 'test-jwt',
      asUser: {
        userId: 22,
        siteId: 4,
        userName: 'Test user',
      },
    });

    expect(response).toEqual({
      error: false,
      status: 200,
      data: { ok: true },
    });
    expect(networkFetcher).not.toHaveBeenCalled();

    expect(runner).toHaveBeenCalledTimes(1);
    expect(runner).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'POST',
        path: '/api/madoc/projects/1',
        body: JSON.stringify({ label: 'Test' }),
        headers: expect.objectContaining({
          accept: 'application/json',
          authorization: 'Bearer test-jwt',
          'content-type': 'application/json',
          'x-madoc-site-id': '4',
          'x-madoc-user-id': '22',
          'x-madoc-user-name': 'Test user',
          'x-madoc-subrequest-depth': '1',
        }),
      })
    );
  });

  test('falls back to network for non-local routes', async () => {
    const networkFetcher = jest.fn().mockResolvedValue({
      error: false,
      status: 200,
      data: { from: 'network' },
    });
    const runner = jest.fn();
    const fetcher = createInternalAwareFetchJson({
      isEnabled: () => true,
      networkFetcher: networkFetcher as any,
      getRunner: () => runner,
    });

    const response = await fetcher('http://gateway', '/api/search/search?q=hello', {
      method: 'GET',
      jwt: 'test-jwt',
    });

    expect(response).toEqual({
      error: false,
      status: 200,
      data: { from: 'network' },
    });
    expect(networkFetcher).toHaveBeenCalledTimes(1);
    expect(runner).not.toHaveBeenCalled();
  });

  test('blocks internal recursion when max depth is reached', async () => {
    const networkFetcher = jest.fn();
    const runner = jest.fn();
    const fetcher = createInternalAwareFetchJson({
      isEnabled: () => true,
      maxDepth: 5,
      networkFetcher: networkFetcher as any,
      getRunner: () => runner,
      getCurrentContext: () =>
        ({
          request: {
            headers: {
              'x-madoc-subrequest-depth': '5',
            },
          },
        } as any),
    });

    const response = await fetcher('http://gateway', '/api/madoc/projects/1', {
      method: 'GET',
      jwt: 'test-jwt',
    });

    expect(response).toEqual({
      error: true,
      status: 508,
      data: {
        error: 'Exceeded max sub-request depth (5)',
      },
    });
    expect(runner).not.toHaveBeenCalled();
    expect(networkFetcher).not.toHaveBeenCalled();
  });
});
