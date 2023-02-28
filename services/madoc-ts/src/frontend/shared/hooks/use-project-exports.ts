import { useMemo } from 'react';
import { SupportedExportResourceTypes } from '../../../extensions/project-export/types';
import { useOptionalApi } from './use-api';
import { useSite } from './use-site';

export function useProjectExports(type?: SupportedExportResourceTypes) {
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
