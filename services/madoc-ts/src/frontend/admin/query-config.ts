import { ReactQueryConfig } from 'react-query';

export const queryConfig: ReactQueryConfig = {
  queries: {
    staleTime: 0,
    cacheTime: 0,
    refetchOnMount: true,
  },
};
