import { CanvasFull } from '../../../types/canvas-full';
import { resolveUrn } from '../../../utility/resolve-urn';
import { CaptureModel } from '../capture-models/types/capture-model';
import { useApi } from './use-api';
import { useQuery } from 'react-query';

export function useLoadedCaptureModel(modelId?: string, initialModel?: CaptureModel, canvasId?: number) {
  const api = useApi();
  const { data, status, refetch } = useQuery(
    ['model-preview', { id: modelId, canvasId, modelId: initialModel?.id }],
    async () => {
      if (!modelId) {
        throw new Error('No model');
      }
      const captureModel = initialModel ? initialModel : await api.getCaptureModel(modelId);
      if ((!captureModel.target || !captureModel.target[0]) && !canvasId) {
        throw new Error('No target');
      }
      if (!captureModel.target) {
        if (!canvasId) {
          throw new Error('No target');
        }
        const { canvas } = await api.getSiteCanvas(canvasId);

        return {
          canvas,
          target: undefined,
          captureModel,
        };
      }
      const target = captureModel.target.map(item => resolveUrn(item.id));
      const primaryTarget = captureModel ? target.find((t: any) => t.type.toLowerCase() === 'canvas') : undefined;

      if (!primaryTarget) {
        throw new Error('No valid target');
      }

      const { canvas } = await api.getSiteCanvas(primaryTarget.id);

      return { canvas, target, captureModel };
    },
    {
      cacheTime: 0,
      staleTime: 0,
      refetchOnMount: true,
    }
  );

  return [
    (data || ({} as any)) as { canvas?: CanvasFull['canvas']; captureModel?: CaptureModel; target?: any },
    status,
    refetch,
  ] as const;
}
