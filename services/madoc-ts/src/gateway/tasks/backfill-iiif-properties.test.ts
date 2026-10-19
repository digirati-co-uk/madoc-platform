import { restorationProperties, restoreIIIFProperties } from './backfill-iiif-properties';
import { fetchAnnotationResource } from '../../iiif/fetch-annotation-page';
import { ApiClient } from '../api';

jest.mock('../../iiif/fetch-annotation-page', () => ({ fetchAnnotationResource: jest.fn() }));

test('backfill keeps extensions and supplementary pages while removing large painting bodies', () => {
  const page = { id: 'https://example.org/page', type: 'AnnotationPage' };
  const compact = restorationProperties({
    id: 'https://example.org/m',
    type: 'Manifest',
    custom: 'manifest',
    annotations: [page],
    items: [
      {
        id: 'https://example.org/c',
        type: 'Canvas',
        custom: 'canvas',
        annotations: [page],
        items: [{ payload: 'x'.repeat(11 * 1024 * 1024) }],
      },
    ],
  });
  expect(Buffer.byteLength(JSON.stringify(compact))).toBeLessThan(1024);
  expect(compact).toMatchObject({
    custom: 'manifest',
    annotations: [page],
    items: [{ custom: 'canvas', annotations: [page] }],
  });
});

test('backfill reads through the protected source fetcher', async () => {
  (fetchAnnotationResource as jest.Mock).mockResolvedValue(
    JSON.stringify({ id: 'https://example.org/m', type: 'Manifest' })
  );
  const api = { importIIIFProperties: jest.fn() };
  await restoreIIIFProperties(api as unknown as ApiClient, 12, 'https://example.org/m');
  expect(fetchAnnotationResource).toHaveBeenCalledWith('https://example.org/m', 100 * 1024 * 1024);
  expect(api.importIIIFProperties).toHaveBeenCalledWith(
    12,
    expect.objectContaining({ id: 'https://example.org/m' }),
    true
  );
});
