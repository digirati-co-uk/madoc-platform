import { useMemo } from 'react';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';

export function useManifestPageConfiguration() {
  const config = useSiteConfiguration();

  return useMemo(() => config.project?.manifestPageOptions || {}, [config.project]);
}
