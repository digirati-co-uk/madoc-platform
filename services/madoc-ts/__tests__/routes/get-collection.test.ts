/** @jest-environment node */
import type { TaggedTemplateLiteralInvocationType } from 'slonik';
import { getCollection } from '../../src/routes/iiif/collections/get-collection';
import { getCollectionDeletionSummary } from '../../src/routes/iiif/collections/delete-collection-summary';
import { deleteCollectionEndpoint } from '../../src/routes/iiif/collections/delete-collection';
import { getCollectionStructure } from '../../src/routes/iiif/collections/get-collection-structure';

jest.mock('../../src/gateway/api.server', () => ({ api: { asUser: jest.fn() } }));

const parentMetadata = {
  collection_id: 7,
  manifest_id: null,
  metadata_id: 70,
  is_manifest: false,
  resource_id: 7,
  key: 'label',
  value: 'Project resources',
  language: 'en',
  source: 'iiif',
  published: true,
};

function createContext() {
  return {
    params: { id: 7 },
    query: { type: 'collection', published: 'true', page: '4' },
    state: { jwt: { user: { id: 1 }, site: { id: 5 }, scope: ['site.admin'] } },
    connection: {
      maybeOne: jest.fn(async () => ({ total: 0 })),
      any: jest.fn(),
      query: jest.fn(),
    },
    response: { body: undefined },
  };
}

test('preserves the parent and an empty collection-only page when a project contains only manifests', async () => {
  const context = createContext();
  context.connection.any
    .mockImplementationOnce((query: TaggedTemplateLiteralInvocationType) => {
      expect(query.values).toContain('collection');
      return [parentMetadata];
    })
    .mockResolvedValueOnce([{ resource_id: 7, total: 1 }]);

  await getCollection(context as unknown as Parameters<typeof getCollection>[0], jest.fn());

  expect(context.response.body).toMatchObject({
    collection: { id: 7, label: { en: ['Project resources'] }, items: [], itemCount: 0 },
    pagination: { page: 1, totalResults: 0, totalPages: 1 },
  });
});

test('returns real collection children when they match the filter', async () => {
  const context = createContext();
  context.connection.maybeOne.mockResolvedValueOnce({ total: 1 });
  context.connection.any
    .mockResolvedValueOnce([
      { ...parentMetadata, manifest_id: 9 },
      {
        ...parentMetadata,
        manifest_id: 9,
        metadata_id: 90,
        is_manifest: true,
        resource_id: 9,
        resource_type: 'collection',
        value: 'Child collection',
      },
    ])
    .mockResolvedValueOnce([{ resource_id: 7, total: 2 }]);

  await getCollection(context as unknown as Parameters<typeof getCollection>[0], jest.fn());

  expect(context.response.body).toMatchObject({
    collection: { items: [{ id: 9, type: 'collection', label: { en: ['Child collection'] } }], itemCount: 1 },
    pagination: { page: 1, totalResults: 1, totalPages: 1 },
  });
});

test.each([
  ['deletion summary', getCollectionDeletionSummary],
  ['deletion', deleteCollectionEndpoint],
  ['structure read', getCollectionStructure],
] as const)('rejects a non-collection ID before collection %s', async (_, handler) => {
  const context = createContext();
  const lookup = jest.fn().mockResolvedValue(null);
  const request = { ...context, connection: { ...context.connection, maybeOne: lookup } };

  await expect(handler(request as unknown as Parameters<typeof handler>[0], jest.fn())).rejects.toMatchObject({
    status: 404,
  });
  expect(lookup).toHaveBeenCalledWith(
    expect.objectContaining({ sql: expect.stringContaining("resource_type = 'collection'"), values: [7, 5] })
  );
  expect(context.connection.any).not.toHaveBeenCalled();
  expect(context.connection.query).not.toHaveBeenCalled();
});
