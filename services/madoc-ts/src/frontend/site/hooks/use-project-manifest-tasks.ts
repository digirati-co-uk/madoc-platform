import { apiHooks } from '../../shared/hooks/use-api-query';
import { useRouteContext } from './use-route-context';

export function useProjectManifestTasks() {
  const { projectId, manifestId } = useRouteContext();
  return apiHooks.getSiteProjectManifestTasks(() => (projectId && manifestId ? [projectId, manifestId] : undefined));
}
