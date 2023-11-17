import { useApi } from '../../shared/hooks/use-api';
import { useRouteContext } from './use-route-context';
import { usePaginatedQuery } from 'react-query';
import { useLocationQuery } from '../../shared/hooks/use-location-query';

export function useProjectUpdatesList() {
  const api = useApi();
  const { page = 1 } = useLocationQuery();
  const { projectId } = useRouteContext();

  return usePaginatedQuery(['site-project-update-list', { projectId, page }], async () => {
    if (projectId) {
      return api.getAllSiteProjectUpdates(projectId, page);
    }
  });
}
