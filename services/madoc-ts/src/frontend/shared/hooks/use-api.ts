import { createContext, useContext, useEffect, useState } from 'react';
import { ApiClient } from '../../../gateway/api';

export const ApiContext = createContext<ApiClient | undefined>(undefined);

export const useApi = () => {
  const api = useContext(ApiContext);

  if (!api) {
    // throw new Error();
  }

  return api;
};

export const useOptionalApi = () => {
  return useContext(ApiContext);
};

export function useIsApiRestarting(api: ApiClient) {
  const [isDown, setIsDown] = useState(false);

  useEffect(() => {
    return api.onError(() => {
      setIsDown(true);
    });
  }, [api]);

  useEffect(() => {
    return api.onErrorRecovery(() => {
      setIsDown(false);
    });
  }, [api]);

  return isDown;
}
