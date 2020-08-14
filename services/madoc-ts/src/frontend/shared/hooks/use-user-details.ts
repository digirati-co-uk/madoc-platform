import { useApi } from './use-api';
import { useQuery } from 'react-query';

export function useUserDetails() {
  const api = useApi();

  const { data } = useQuery('user-details', () => {
    return api.getUserDetails();
  });

  return data;
}
