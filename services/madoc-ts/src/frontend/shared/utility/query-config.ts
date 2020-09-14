import { ReactQueryConfig } from 'react-query';

export const queryConfig: ReactQueryConfig = {
  queries: {
    staleTime: 5 * 60 * 1000,
  },
};
