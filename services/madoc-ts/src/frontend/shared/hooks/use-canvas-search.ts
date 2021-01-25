import { apiHooks } from './use-api-query';
import { useLocationQuery } from './use-location-query';

export function useCanvasSearch(id?: number | string, queryParam = 'searchText') {
  const query = useLocationQuery();
  const searchText = query[queryParam];
  const { data: search } = apiHooks.searchQuery(() =>
    searchText && id ? [{ fulltext: searchText }, 1, `urn:madoc:canvas:${id}`] : undefined
  );

  return [
    searchText,
    search && search.results && search.results.length && search.results[0].hits[0]
      ? search.results[0].hits[0]
      : undefined,
  ];
}
