import fetch from 'node-fetch';
import type { Response } from 'node-fetch';
import { fetchIiifResource } from '../../../src/gateway/tasks/fetch-iiif-resource';

jest.mock('node-fetch');

const mockedFetch = fetch as jest.MockedFunction<typeof fetch>;

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
