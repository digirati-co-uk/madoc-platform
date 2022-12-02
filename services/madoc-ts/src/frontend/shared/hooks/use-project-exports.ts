import { useMemo } from 'react';
import { useOptionalApi } from './use-api';
import { useSite } from './use-site';

export function useProjectExports(type?: 'project' | 'manifest' | 'canvas') {
  const api = useOptionalApi();
  const site = useSite();
  const all = useMemo(() => (api ? api.projectExport.getAllDefinitions(site.id) : []), [api, site]);
  return useMemo(() => {
    if (type) {
      return all.filter(item => item.supportedTypes.indexOf(type) !== -1);
    }

    return all;
  }, [all, type]);
}
