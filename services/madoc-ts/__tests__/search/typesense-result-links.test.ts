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

  test('links project results to the project outside project search context', () => {
    expect(
      resolveTypesenseHitPrimaryLink(
        {
          resource_type: 'Project',
          resource_id: 'urn:madoc:project:99',
        },
        'another-project'
      )
    ).toBe('/projects/99');
  });

  test('links global results inside the selected project', () => {
    expect(
      resolveTypesenseHitPrimaryLink(
        {
          resource_type: 'Canvas',
          resource_id: 'urn:madoc:canvas:123',
          manifest_id: 'urn:madoc:manifest:456',
        },
        '99'
      )
    ).toBe('/projects/99/manifests/456/c/123');
  });
});
