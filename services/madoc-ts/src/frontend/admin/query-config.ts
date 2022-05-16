import { ReactQueryConfig } from 'react-query';

export const queryConfig: ReactQueryConfig = {
  queries: {
    staleTime: 0,
    cacheTime: 1000 * 60 * 60,
    refetchOnMount: true,
  },
};
