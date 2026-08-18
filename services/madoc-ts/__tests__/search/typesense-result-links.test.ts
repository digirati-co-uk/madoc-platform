import { resolveTypesenseHitPrimaryLink } from '../../src/frontend/shared/hooks/use-typesense-site-autocomplete';

describe('Typesense result links', () => {
  test('links collection results to the collection instead of a representative manifest', () => {
    expect(
      resolveTypesenseHitPrimaryLink({
        resource_type: 'Collection',
        resource_id: 'urn:madoc:collection:2438',
        manifest_id: 'urn:madoc:manifest:669',
      })
    ).toBe('/collections/2438');
  });
});
