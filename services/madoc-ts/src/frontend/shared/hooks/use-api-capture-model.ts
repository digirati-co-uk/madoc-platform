import { useQuery } from 'react-query';
import { useApi } from './use-api';

export function useApiCaptureModel(modelId?: string | null) {
  const api = useApi();
  return useQuery(
    ['api-capture-model', { id: modelId }],
    async () => {
      if (modelId) {
        return api.crowdsourcing.getCaptureModel(modelId);
      }
    },
    {
      enabled: !!modelId,
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchIntervalInBackground: false,
    }
  );
}
