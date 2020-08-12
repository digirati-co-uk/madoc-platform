import { useApi } from './use-api';
import { useQuery } from 'react-query';

export function useManifestProjects(manifestId?: string | number, projectId?: string | number) {
  const api = useApi();

  return useQuery(
    ['manifest-project', { id: manifestId, projectId }],
    async () => {
      if (projectId && api.isAuthorised()) {
        return { projects: [await api.getProject(projectId)] };
      }

      if (manifestId && api.isAuthorised()) {
        return api.getManifestProjects(Number(manifestId));
      }
      return undefined;
    },
    {
      refetchInterval: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
}
