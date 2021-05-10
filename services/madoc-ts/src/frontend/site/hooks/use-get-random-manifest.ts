import { useMutation } from 'react-query';
import { useApi } from '../../shared/hooks/use-api';
import { useRouteContext } from './use-route-context';

export function useGetRandomManifest() {
  const { projectId, collectionId } = useRouteContext();
  const api = useApi();
  const [getRandomCanvas, randomCanvas] = useMutation(async () => {
    if (projectId) {
      try {
        return await api.randomlyAssignedManifest(projectId, {
          collectionId,
        });
      } catch (err) {
        return undefined;
      }
    }
  });

  const isRandomAvailable = !!projectId;

  return [getRandomCanvas, randomCanvas, isRandomAvailable] as const;
}
