import { usePaginatedQuery } from 'react-query';
import { useApi } from './use-api';
import { useSearchQuery } from '../../site/hooks/use-search-query';

export function useTopicItems(slug: string, topicType: string) {
  const api = useApi();

  const label = slug.replace(/-/g, '').toLowerCase();
  const { fulltext, appliedFacets, page } = useSearchQuery();
  const query = { fulltext: fulltext, facets: appliedFacets, page: page };

  const resp = usePaginatedQuery(
    ['topic-items', { id: slug, page }],
    async () => {
      return api.getSearchQuery(
        {
          ...query,
          facets: [{ type: 'entity', subtype: topicType, indexable_text: label }],
        } as any,
        page
      );
    },
    { enabled: !!slug }
  );
  return [resp, { page, query }] as const;
}
