import { apiHooks } from './use-api-query';
import { useUser } from './use-site';

export function useUserDetails() {
  const user = useUser();

  const { data } = apiHooks.getUserDetails(() => (user ? [] : undefined), { retry: false });

  return data;
}
