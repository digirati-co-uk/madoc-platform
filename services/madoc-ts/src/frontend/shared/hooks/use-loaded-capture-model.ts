import { CanvasFull } from '../../../types/schemas/canvas-full';
import { CaptureModel } from '@capture-models/types';
import { useApi } from './use-api';
import { useQuery } from 'react-query';

export function useLoadedCaptureModel(modelId?: string, initialModel?: CaptureModel) {
  const api = useApi();
  const { data, status, refetch } = useQuery(
    ['model-preview', { id: modelId }],
    async () => {
      if (!modelId) {
        throw new Error('No model');
      }
      const captureModel = initialModel ? initialModel : await api.getCaptureModel(modelId);
      if (!captureModel.target || !captureModel.target[0]) {
        throw new Error('No target');
      }
      const target = captureModel.target.map(item => api.resolveUrn(item.id));
      const primaryTarget = captureModel ? target.find((t: any) => t.type.toLowerCase() === 'canvas') : undefined;

      if (!primaryTarget) {
        throw new Error('No valid target');
      }

      const { canvas } = await api.getSiteCanvas(primaryTarget.id);

      return { canvas, target, captureModel };
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: true,
      refetchIntervalInBackground: false,
    }
  );

  return [
    (data || ({} as any)) as { canvas?: CanvasFull; captureModel?: CaptureModel; target?: any },
    status,
    refetch,
  ] as const;
}
