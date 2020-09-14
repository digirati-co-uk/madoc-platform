import { useQuery } from 'react-query';
import { useApi } from './use-api';

export function useApiManifest(manifestId?: string | number, site = true) {
  const api = useApi();
  return useQuery(
    ['api-manifest', { id: manifestId, site }],
    async () => {
      if (!manifestId) {
        return undefined;
      }
      if (site) {
        return api.getSiteManifest(Number(manifestId));
      }
      return api.getManifestById(Number(manifestId));
    },
    { enabled: !!manifestId }
  );
}
