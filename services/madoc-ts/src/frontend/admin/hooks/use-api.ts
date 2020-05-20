import { createContext, useContext } from 'react';
import { ApiClient } from '../../../gateway/api';

export const ApiContext = createContext<ApiClient | undefined>(undefined);

export const useApi = () => {
  const api = useContext(ApiContext);

  if (!api) {
    throw new Error();
  }

  return api;
};
