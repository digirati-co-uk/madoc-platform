import { apiHooks } from './use-api-query';
import { useLocationQuery } from './use-location-query';

export function useCanvasSearchText(id?: number | string, queryParam = 'searchText'): string | undefined {
  const query = useLocationQuery();
  return query[queryParam];
}

export function useCanvasSearch(id?: number | string, queryParam = 'searchText') {
  const searchText = useCanvasSearchText(id, queryParam);
  const { data: search } = apiHooks.getSearchQuery(() =>
    searchText && id ? [{ fulltext: searchText }, 1, `urn:madoc:canvas:${id}`] : undefined
  );

  return [
    searchText,
    search &&
    search.results &&
    search.results.length &&
    search.results[0] &&
    search.results[0].hits &&
    search.results[0].hits.length &&
    search.results[0].hits[0]
      ? search.results[0].hits[0]
      : undefined,
  ] as const;
}
