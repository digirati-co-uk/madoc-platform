import { apiHooks } from '../../shared/hooks/use-api-query';
import { useRouteContext } from './use-route-context';

export function useProjectCanvasTasks() {
  const { projectId, canvasId } = useRouteContext();
  return apiHooks.getSiteProjectCanvasTasks(() => (projectId && canvasId ? [projectId, canvasId] : undefined));
}
