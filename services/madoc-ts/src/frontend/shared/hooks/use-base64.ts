import { useCallback } from 'react';
import { useApi, useOptionalApi } from './use-api';

export function useBase64() {
  const api = useOptionalApi();
  const decode = useCallback(
    (fragment: string) => {
      if (api && api.getIsServer()) {
        return new Buffer(fragment, 'base64').toString('utf-8');
      }

      return atob(fragment);
    },
    [api]
  );

  const encode = useCallback(
    (fragment: string) => {
      if (api && api.getIsServer()) {
        return new Buffer(fragment, 'utf-8').toString('base64');
      }

      return btoa(fragment);
    },
    [api]
  );

  return {
    decode,
    encode,
  };
}
