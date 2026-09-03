import { TypesenseClient } from '../../src/search/typesense/typesense-client';

const originalApiKey = process.env.TYPESENSE_API_KEY;

afterEach(() => {
  jest.restoreAllMocks();
  if (originalApiKey) process.env.TYPESENSE_API_KEY = originalApiKey;
  else delete process.env.TYPESENSE_API_KEY;
});

function response(body: unknown, status = 200) {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
    text: async () => JSON.stringify(body),
  } as Response;
}

test('accepts a concurrent schema update after re-reading the collection', async () => {
  process.env.TYPESENSE_API_KEY = 'test-key';
  const fetchMock = jest
    .spyOn(global, 'fetch')
    .mockResolvedValueOnce(response({ fields: [] }))
    .mockResolvedValueOnce(response({ message: 'Field `project_facets` is already part of the schema' }, 400))
    .mockResolvedValueOnce(
      response({
        fields: [
          { name: 'manifest_ids' },
          { name: 'project_facets' },
          { name: 'collection_ids' },
          { name: 'metadata_.*' },
          { name: 'capture_model_.*' },
          { name: 'search_context' },
        ],
      })
    );

  await expect(new TypesenseClient().ensureSearchCollection('madoc_site_22')).resolves.toBeUndefined();
  expect(fetchMock).toHaveBeenCalledTimes(3);
});
