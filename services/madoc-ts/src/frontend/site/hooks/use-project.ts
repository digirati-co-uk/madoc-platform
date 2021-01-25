import { useData } from '../../shared/hooks/use-data';
import { ProjectLoader } from '../pages/loaders/project-loader';

export function useProject() {
  return useData(ProjectLoader);
}
