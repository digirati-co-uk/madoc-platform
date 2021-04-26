import { useMemo } from 'react';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';

export function useModelPageConfiguration() {
  const config = useSiteConfiguration();

  return useMemo(() => config.project?.modelPageOptions || {}, [config.project]);
}
