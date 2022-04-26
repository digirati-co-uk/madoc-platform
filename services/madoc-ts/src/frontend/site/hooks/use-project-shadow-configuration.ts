import { useMemo } from 'react';
import { ProjectConfiguration } from '../../../types/schemas/project-configuration';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';

type NotUndefined<T> = T extends undefined ? never : T;

type ShadowConfiguration = NotUndefined<Required<ProjectConfiguration['shadow']>>;

export function useProjectShadowConfiguration(): ShadowConfiguration {
  const config = useSiteConfiguration();

  return useMemo(
    () =>
      Object.assign(
        {
          showCaptureModelOnManifest: false,
        },
        config.project?.shadow || {}
      ),
    [config.project]
  );
}
