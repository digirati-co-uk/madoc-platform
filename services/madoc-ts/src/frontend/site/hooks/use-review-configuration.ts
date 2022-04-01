import { useMemo } from 'react';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';

export function useReviewConfiguration() {
  const config = useSiteConfiguration();

  return useMemo(() => config.project?.reviewOptions || {}, [config.project]);
}
