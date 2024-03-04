import { usePaginatedQuery } from 'react-query';
import { useApi } from './use-api';
import { useSearchQuery } from '../../site/hooks/use-search-query';
import { apiHooks } from './use-api-query';

export function useTopicItems(slug?: string) {
  const api = useApi();
  const { fulltext, appliedFacets, page } = useSearchQuery();
  const query = { fulltext: fulltext, facets: appliedFacets, page: page };

  const resp = usePaginatedQuery(
    ['topic-resource-items', { id: slug, page }],
    async () => {
      return api.getSearchQuery(
        {
          ...query,
          facets: [{ type: 'entity', group_id: slug }],
        } as any,
        page
      );
    },
    { enabled: !!slug }
  );
  return [resp, { page, query }] as const;
}
