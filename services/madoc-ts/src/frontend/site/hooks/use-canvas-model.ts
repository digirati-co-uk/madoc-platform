import { apiHooks } from '../../shared/hooks/use-api-query';
import { useRouteContext } from './use-route-context';

export function useCanvasModel() {
  const { projectId, canvasId } = useRouteContext();
  return apiHooks.getSiteProjectCanvasModel(() => (projectId && canvasId ? [projectId, canvasId] : undefined), {
    refetchOnMount: true,
    enabled: canvasId && projectId,
    cacheTime: 0,
  });
}
