import { usePaginatedQuery } from 'react-query';
import { useTopic } from '../../site/pages/loaders/topic-loader';
import { useApi } from './use-api';
import { useLocationQuery } from './use-location-query';

export function useTopicItems(slug: string) {
  const api = useApi();
  const query = useLocationQuery<{ fulltext?: string; facets?: string; page?: string }>();
  const page = query.page ? Number(query.page) : 1;
  const resp = usePaginatedQuery(
    ['topic-items', { id: slug, page }],
    async () => {
      return api.getSearchQuery({ ...query, facets: [{ type: 'entity', indexable_text: slug }] } as any, page);
    },
    { enabled: !!slug }
  );
  return [resp, { page, query }] as const;
}
