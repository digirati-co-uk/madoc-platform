import { useApi } from './use-api';
import { useQuery } from 'react-query';
import { useUser } from './use-site';

export function useUserDetails() {
  const api = useApi();
  const user = useUser();

  const { data } = useQuery(
    'user-details',
    () => {
      return api.getUserDetails();
    },
    { retry: false, enabled: !!user }
  );

  return data;
}
