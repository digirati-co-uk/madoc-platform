import { useQuery } from 'react-query';
import { useApi } from './use-api';

export function useApiCanvas(canvasId?: string | number, site = true, options: { plaintext?: boolean } = {}) {
  const api = useApi();
  return useQuery(
    ['api-canvas', { id: canvasId, site }],
    () => {
      if (!canvasId) {
        return undefined;
      }

      if (site) {
        return api.getSiteCanvas(Number(canvasId), options);
      }

      return api.getCanvasById(Number(canvasId));
    },
    { enabled: !!canvasId }
  );
}
