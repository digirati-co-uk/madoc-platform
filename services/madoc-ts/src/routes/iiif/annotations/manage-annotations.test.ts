import { updateAnnotation, importProperties } from './manage-annotations';
import { api } from '../../../gateway/api.server';
import { getAnnotationPage, insertAnnotationPage, requireIIIFResource, preserveIIIFProperties } from '../../../repository/iiif-annotations';
import { enqueueAnnotationPages } from '../../../iiif/queue-annotation-pages';

jest.mock('../../../gateway/api.server', () => ({ api: { asUser: jest.fn() } }));
jest.mock('../../../repository/iiif-annotations', () => ({
  getAnnotationPage: jest.fn(),
  insertAnnotationPage: jest.fn(),
  requireIIIFResource: jest.fn(),
  invalidateIIIF: jest.fn(),
  preserveIIIFProperties: jest.fn(),
}));
jest.mock('../../../iiif/queue-annotation-pages', () => ({ enqueueAnnotationPages: jest.fn() }));
jest.mock('../../../utility/user-with-scope', () => ({
  userWithScope: () => ({ siteId: 1, id: 1 }),
}));

beforeEach(() => jest.clearAllMocks());

test.each([null, { id: 6, properties: { deleted: true } }])('replacing an external URL preserves its tombstone and permits a previously removed destination (%p)', async duplicate => {
  const previous = {
    id: 5,
    resource_id: 12,
    uri: 'https://example.org/original',
    label: 'Original',
    source: 'iiif',
    properties: { mode: 'external', generation: 3, position: 0, status: 'ready' },
  };
  const updated = {
    ...previous,
    uri: 'https://example.org/replacement',
    properties: { ...previous.properties, generation: 4 },
  };
  (requireIIIFResource as jest.Mock).mockResolvedValue({ resource_type: 'canvas' });
  (getAnnotationPage as jest.Mock).mockResolvedValueOnce(previous).mockResolvedValueOnce(updated);
  (api.asUser as jest.Mock).mockReturnValue({ indexCanvas: jest.fn() });
  const connection = { query: jest.fn(), maybeOne: jest.fn().mockResolvedValue(duplicate) };
  const context = {
    params: { id: '12', pageId: '5' },
    requestBody: { mode: 'external', url: updated.uri },
    disposableApis: [],
    connection: { transaction: async (fn: (value: typeof connection) => Promise<unknown>) => fn(connection) },
  };
  await updateAnnotation(context as unknown as Parameters<typeof updateAnnotation>[0], async () => {});
  expect(insertAnnotationPage).toHaveBeenCalledWith(
    connection,
    1,
    12,
    previous.uri,
    previous.label,
    expect.objectContaining({ deleted: true, edited: true, generation: 4 })
  );
  expect(enqueueAnnotationPages).toHaveBeenCalledWith(expect.anything(), [updated], 1, 1);
});

test('an unchanged backfill does not enqueue a search rebuild', async () => {
  (requireIIIFResource as jest.Mock).mockResolvedValue({ resource_type: 'canvas' });
  (preserveIIIFProperties as jest.Mock).mockResolvedValue({ pending: [], textChanged: false });
  const indexCanvas = jest.fn();
  (api.asUser as jest.Mock).mockReturnValue({ indexCanvas });
  const connection = {};
  const context = {
    params: { id: '12' }, requestBody: { resource: { custom: 'preserved' } }, disposableApis: [],
    connection: { transaction: async (fn: (value: typeof connection) => Promise<unknown>) => fn(connection) },
  };
  await importProperties(context as unknown as Parameters<typeof importProperties>[0], async () => {});
  expect(indexCanvas).not.toHaveBeenCalled();
});
