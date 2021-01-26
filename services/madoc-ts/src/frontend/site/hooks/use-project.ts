import { useStaticData } from '../../shared/hooks/use-data';
import { ProjectLoader } from '../pages/loaders/project-loader';
import { useRouteContext } from './use-route-context';

export function useProject() {
  const { projectId } = useRouteContext();
  return useStaticData(ProjectLoader, undefined, { enabled: !!projectId });
}
