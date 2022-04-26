import { useRouteMatch } from 'react-router-dom';
import { apiHooks } from '../../shared/hooks/use-api-query';
import { useSiteConfiguration } from '../features/SiteConfigurationContext';
import { useProject } from './use-project';

export function useProjectManifests() {
  const { data: project } = useProject();
  const { isExact } = useRouteMatch();
  const {
    project: { hideCompletedResources },
  } = useSiteConfiguration();

  return apiHooks.getSiteCollection(
    () =>
      project
        ? [
            project.collection_id,
            hideCompletedResources
              ? {
                  type: 'manifest',
                  project_id: project.slug,
                  hide_status: '2,3',
                }
              : {
                  type: 'manifest',
                  project_id: project.slug,
                },
          ]
        : undefined,
    {
      forceFetchOnMount: true,
      enabled: isExact && project,
    }
  );
}
