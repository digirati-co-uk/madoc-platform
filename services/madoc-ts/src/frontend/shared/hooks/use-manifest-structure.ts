import { useQuery } from 'react-query';
import { useApi } from './use-api';

export function useManifestStructure(manifestId?: string | number) {
  const api = useApi();

  return useQuery(
    ['manifest-structure', { id: manifestId }],
    async () => {
      if (manifestId) {
        const structure = await api.getSiteManifestStructure(Number(manifestId));

        return {
          ids: structure.items.map(item => item.id),
          items: structure.items,
        };
      }
      return undefined;
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
}
