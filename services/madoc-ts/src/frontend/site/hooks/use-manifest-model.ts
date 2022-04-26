import { apiHooks } from '../../shared/hooks/use-api-query';
import { useRouteContext } from './use-route-context';

export function useManifestModel() {
  const { projectId, manifestId } = useRouteContext();
  return apiHooks.getSiteProjectManifestModel(() => (projectId && manifestId ? [projectId, manifestId] : undefined), {
    refetchOnMount: true,
    enabled: manifestId && projectId,
  });
}
