import { usePaginatedQuery } from 'react-query';
import { useTopic } from '../../site/pages/loaders/topic-loader';
import { useApi } from './use-api';
import { useLocationQuery } from './use-location-query';

export function useTopicItems() {
  const { data: topic } = useTopic();
  const api = useApi();
  const query = useLocationQuery<{ fulltext?: string; facets?: string; page?: string }>();
  const page = query.page ? Number(query.page) : 1;
  const resp = usePaginatedQuery(
    ['topic-items', { id: topic?.id, page }],
    async () => {
      return api.getSearchQuery({ ...query, facets: [{ type: 'entity', subtype: topic?.id }] } as any, page);
    },
    { enabled: !!topic }
  );
  return [resp, { page, query }] as const;
}
