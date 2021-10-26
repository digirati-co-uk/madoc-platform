import { useMemo } from 'react';
import { useApi, useOptionalApi } from './use-api';
import { useSite } from './use-site';

export function useProjectTemplates() {
  const api = useOptionalApi();
  const site = useSite();

  return useMemo(() => (api ? api.projectTemplates.getAllDefinitions(site.id) : []), [api, site]);
}
