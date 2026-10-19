import fetch from 'node-fetch';
import type { Response } from 'node-fetch';
import { fetchIiifResource } from '../../../src/gateway/tasks/fetch-iiif-resource';

jest.mock('node-fetch');

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;
beforeEach(() => jest.resetAllMocks());

test('retries a transient IIIF response', async () => {
  mockedFetch
    .mockResolvedValueOnce({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    } as unknown as Response)
    .mockResolvedValueOnce({ ok: true, text: async () => '{"type":"Manifest"}' } as unknown as Response);

  await expect(fetchIiifResource('https://example.org/manifest', { retryDelay: 0 })).resolves.toBe(
    '{"type":"Manifest"}'
  );
  expect(mockedFetch).toHaveBeenCalledTimes(2);
});

test('does not retry a missing source manifest', async () => {
  mockedFetch.mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' } as unknown as Response);
  await expect(fetchIiifResource('https://example.org/missing', { retryDelay: 0 })).rejects.toThrow('404');
  expect(mockedFetch).toHaveBeenCalledTimes(1);
});

test('retries a network timeout and retains the configured deadline', async () => {
  mockedFetch
    .mockRejectedValueOnce(new Error('network timeout'))
    .mockResolvedValueOnce({ ok: true, text: async () => '{}' } as unknown as Response);
  await expect(fetchIiifResource('https://example.org/slow', { timeout: 10, retryDelay: 0 })).resolves.toBe('{}');
  expect(mockedFetch).toHaveBeenCalledTimes(2);
  expect(mockedFetch).toHaveBeenLastCalledWith('https://example.org/slow', { timeout: 10 });
});
