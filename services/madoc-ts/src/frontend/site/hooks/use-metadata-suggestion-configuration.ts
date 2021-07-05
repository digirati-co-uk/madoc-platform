import { useMemo } from 'react';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';

export function useMetadataSuggestionConfiguration(): {
  collection: boolean;
  manifest: boolean;
  canvas: boolean;
} {
  const config = useSiteConfiguration();

  return useMemo(
    () => ({
      // Defaults.
      collection: false,
      manifest: false,
      canvas: false,

      ...(config.project?.metadataSuggestions || {}),
    }),
    [config.project]
  );
}
