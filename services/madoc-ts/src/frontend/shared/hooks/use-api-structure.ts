import { useQuery } from 'react-query';
import { useApi } from './use-api';

export function useApiStructure(resourceId?: string | number, type = 'collection', site = false) {
  const api = useApi();
  return useQuery(
    ['api-structure', { id: resourceId, type }],
    () => {
      if (type === 'collection') {
        return api.getCollectionStructure(Number(resourceId));
      }
      if (site) {
        return api.getSiteManifestStructure(Number(resourceId));
      }
      return api.getManifestStructure(Number(resourceId));
    },
    { enabled: !!resourceId }
  );
}
