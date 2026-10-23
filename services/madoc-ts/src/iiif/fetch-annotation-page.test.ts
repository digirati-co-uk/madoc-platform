import fetch from 'node-fetch';
import { lookup } from 'dns/promises';
import {
  fetchAnnotationResource,
  loadAnnotationPages,
  loadTextBodies,
  validateRemoteUrl,
} from './fetch-annotation-page';

jest.mock('node-fetch');
jest.mock('dns/promises', () => ({ lookup: jest.fn() }));
const mockFetch = fetch as jest.MockedFunction<typeof fetch>;
const mockLookup = lookup as jest.Mock;

test('retains fetched text when the body count limit is reached', async () => {
  mockFetch.mockResolvedValue(response('Plaintext'));
  const result = await loadTextBodies(
    {
      items: Array.from({ length: 101 }, (_, i) => ({
        motivation: 'supplementing',
        body: { id: `https://example.org/text/${i}`, type: 'Text', format: 'text/plain' },
      })),
    },
    'https://example.org/page'
  );
  expect(Object.keys(result.textBodies)).toHaveLength(100);
  expect(result.textError).toContain('limit');
  expect(mockFetch).toHaveBeenCalledTimes(100);
});
function response(body: unknown, status = 200, location?: string) {
  return {
    ok: status === 200,
    status,
    text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
    headers: { get: () => location },
    body: { destroy: jest.fn() },
  } as unknown as Awaited<ReturnType<typeof fetch>>;
}
beforeEach(() => {
  jest.resetAllMocks();
  mockLookup.mockResolvedValue([{ address: '93.184.216.34', family: 4 }]);
});

test.each([
  'file:///etc/passwd',
  'http://127.0.0.1/page',
  'http://[::1]/page',
  'http://[::ffff:127.0.0.1]/page',
  'http://169.254.169.254/latest',
  'http://10.0.0.1/page',
  'https://name:password@example.org/page',
])('rejects unsafe URL %s', url => {
  expect(() => validateRemoteUrl(url)).toThrow();
});

test('rejects private DNS results and redirects before requesting the private host', async () => {
  mockLookup.mockResolvedValueOnce([{ address: '192.168.1.1', family: 4 }]);
  await expect(fetchAnnotationResource('https://example.org/page')).rejects.toThrow('private');
  expect(mockFetch).not.toHaveBeenCalled();
  mockFetch.mockResolvedValueOnce(response('', 302, 'http://127.0.0.1/page'));
  await expect(fetchAnnotationResource('https://example.org/page')).rejects.toThrow('public');
  expect(mockFetch).toHaveBeenCalledTimes(1);
});

test('combines paginated pages and retains item order', async () => {
  const annotation = (id: string) => ({
    id,
    type: 'Annotation',
    target: 'https://example.org/canvas',
    motivation: 'commenting',
    body: { type: 'TextualBody', value: id },
  });
  mockFetch
    .mockResolvedValueOnce(
      response({
        id: 'https://example.org/page1',
        type: 'AnnotationPage',
        items: [annotation('a')],
        next: { id: './page2' },
      })
    )
    .mockResolvedValueOnce(
      response({ id: 'https://example.org/page2', type: 'AnnotationPage', items: [annotation('b')] })
    );
  const result = await loadAnnotationPages('https://example.org/page1');
  expect(result.page).toMatchObject({ items: [{ id: 'a' }, { id: 'b' }] });
  expect(result.page).not.toHaveProperty('next');
});

test('detects pagination cycles', async () => {
  mockFetch.mockResolvedValue(
    response({ id: 'https://example.org/page', type: 'AnnotationPage', items: [], next: 'https://example.org/page' })
  );
  await expect(loadAnnotationPages('https://example.org/page')).rejects.toThrow('cycle');
});

test('stores an external Wellcome page that omits items as an empty snapshot', async () => {
  const url = 'https://iiif.wellcomecollection.org/annotations/v3/b18035723/images';
  const document = {
    '@context': 'http://iiif.io/api/presentation/3/context.json',
    id: url,
    type: 'AnnotationPage',
  };
  mockFetch.mockResolvedValueOnce(response(document));
  const result = await loadAnnotationPages(url);
  expect(mockFetch).toHaveBeenCalledTimes(1);
  expect(mockFetch.mock.calls[0][0]).toBe(url);
  expect(result).toEqual({ page: { ...document, items: [] }, textBodies: {} });
});

test('follows pagination after a fetched page with no items', async () => {
  mockFetch.mockResolvedValueOnce(response({ type: 'AnnotationPage', next: './page2' })).mockResolvedValueOnce(
    response({
      type: 'AnnotationPage',
      items: [{ type: 'Annotation', target: 'https://example.org/canvas', body: { type: 'Image' } }],
    })
  );
  const result = await loadAnnotationPages('https://example.org/page1');
  expect(result.page).toMatchObject({ items: [{ type: 'Annotation', target: 'https://example.org/canvas' }] });
  expect(mockFetch.mock.calls[1][0]).toBe('https://example.org/page2');
});

test.each([null, {}, 'invalid'])('rejects malformed items on fetched pages: %p', async items => {
  mockFetch.mockResolvedValueOnce(response({ type: 'AnnotationPage', items }));
  await expect(loadAnnotationPages('https://example.org/page')).rejects.toThrow('items must be an array');
});

test('keeps a fetched annotation page when a remote plaintext body is unavailable', async () => {
  mockFetch
    .mockResolvedValueOnce(
      response({
        id: 'https://example.org/page',
        type: 'AnnotationPage',
        items: [
          {
            id: 'https://example.org/a',
            type: 'Annotation',
            target: 'https://example.org/c',
            motivation: 'supplementing',
            body: { id: 'https://example.org/text', type: 'Text', format: 'text/plain' },
          },
        ],
      })
    )
    .mockResolvedValueOnce(response('', 404));
  const result = await loadAnnotationPages('https://example.org/page');
  expect(result.page).toMatchObject({ items: [{ body: { id: 'https://example.org/text' } }] });
  expect(result.textError).toContain('404');
});
