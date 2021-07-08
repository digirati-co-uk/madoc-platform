import { useMemo } from 'react';
import { useApi } from './use-api';
import { useSite } from './use-site';

export function useProjectTemplates() {
  const api = useApi();
  const site = useSite();

  return useMemo(() => api.projectTemplates.getAllDefinitions(site.id), [api, site]);
}
