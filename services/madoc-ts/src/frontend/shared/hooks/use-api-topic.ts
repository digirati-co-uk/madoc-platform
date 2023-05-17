import { useQuery } from 'react-query';
import { useApi } from './use-api';

export function useApiTopic(type?: string, slug?: string | null) {
  const api = useApi();
  return useQuery(
    ['api-topic', { type: type, slug: slug }],
    async () => {
      if (!type || !slug) {
        return undefined;
      }

      return api.getSiteTopic(type, slug);
    },
    { enabled: !!type || !!slug }
  );
}
