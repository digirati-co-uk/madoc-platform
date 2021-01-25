import { useApi, useOptionalApi } from './use-api';
import { useMemo } from 'react';

export function useCurrentUser(allowAnonymous?: false): { user: { name?: string; id: string }; scope: string[] };
export function useCurrentUser(allowAnonymous: true): { user?: { name?: string; id: string }; scope: string[] };
export function useCurrentUser(allowAnonymous = false): any {
  const api = useOptionalApi();

  return useMemo(() => {
    if (api && !api.getIsServer()) {
      const user = api.getCurrentUser();
      if (!allowAnonymous && !user) {
        throw new Error('User not found');
      }
      return user || { user: undefined };
    }
    return { user: undefined };
  }, [allowAnonymous, api]);
}
