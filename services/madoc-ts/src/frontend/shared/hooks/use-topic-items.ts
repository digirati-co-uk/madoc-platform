import { usePaginatedQuery } from 'react-query';
import { useApi } from './use-api';
import { useSearchQuery } from '../../site/hooks/use-search-query';

export function useTopicItems(slug: string) {
  const api = useApi();

  const { fulltext, appliedFacets, page } = useSearchQuery();
  const query = { fulltext: fulltext, facets: appliedFacets, page: page };

  const resp = usePaginatedQuery(
    ['topic-items', { id: slug, page }],
    async () => {
      return api.getSearchQuery(
        {
          ...query,
          facets: [{ type: 'entity', indexable_text: slug }],
        } as any,
        page
      );
    },
    { enabled: !!slug }
  );
  return [resp, resp.isLoading] as const;
}
