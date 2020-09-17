import { useQuery } from 'react-query';
import { useApi } from './use-api';

export function useApiCollection(collectionId?: string | number, site = true) {
  const api = useApi();
  return useQuery(
    ['api-collection', { id: collectionId, site }],
    async () => {
      if (!collectionId) {
        return undefined;
      }
      if (site) {
        return api.getSiteCollection(Number(collectionId));
      }
      return api.getCollectionById(Number(collectionId));
    },
    { enabled: !!collectionId }
  );
}
