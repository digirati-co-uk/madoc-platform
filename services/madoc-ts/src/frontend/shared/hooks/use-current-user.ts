import { useApi } from './use-api';
import { useMemo } from 'react';

export function useCurrentUser(allowAnonymous?: false): { user: { name?: string; id: string }; scope: string[] };
export function useCurrentUser(
  allowAnonymous: true
): undefined | { user?: { name?: string; id: string }; scope: string[] };
export function useCurrentUser(allowAnonymous = false): any {
  const api = useApi();

  return useMemo(() => {
    const user = api.getCurrentUser();
    if (!allowAnonymous && !user) {
      throw new Error('User not found');
    }
    return user;
  }, [allowAnonymous, api]);
}
