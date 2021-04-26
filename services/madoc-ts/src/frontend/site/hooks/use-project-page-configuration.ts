import { useMemo } from 'react';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';

export function useProjectPageConfiguration() {
  const config = useSiteConfiguration();

  return useMemo(() => config.project?.projectPageOptions || {}, [config.project]);
}
