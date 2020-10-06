import { ReactQueryConfig } from 'react-query';
import { NotFound } from '../../../utility/errors/not-found';

export const queryConfig: ReactQueryConfig = {
  queries: {
    staleTime: 5 * 60 * 1000,
    retry: (count, err) => {
      if (err instanceof NotFound) {
        return false;
      }
      return count < 5;
    },
  },
};
