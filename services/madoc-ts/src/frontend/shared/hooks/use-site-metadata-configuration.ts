import { useRouteContext } from '../../site/hooks/use-route-context';
import { apiHooks } from './use-api-query';

export function useSiteMetadataConfiguration({ enabled }: { enabled?: boolean } = {}) {
  const { projectId, collectionId } = useRouteContext();
  return apiHooks.getSiteMetadataConfiguration(() => [{ project_id: projectId, collection_id: collectionId }], {
    retry: false,
    refetchIntervalInBackground: false,
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled,
  });
}
