import { useSiteConfiguration } from '../features/SiteConfigurationContext';

export function useActivityStreamConfig(): {
  manifest: boolean;
  canvas: boolean;
  curated: boolean;
  published: boolean;
} {
  const config = useSiteConfiguration();

  const baseConfig = config.project?.activityStreams || {};

  return {
    published: false,
    canvas: false,
    curated: true,
    manifest: true,
    ...baseConfig,
  };
}
