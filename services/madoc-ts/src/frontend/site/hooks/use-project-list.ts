import { usePaginatedData } from '../../shared/hooks/use-data';
import { ProjectListLoader } from '../pages/loaders/project-list-loader';

export function useProjectList() {
  return usePaginatedData(ProjectListLoader);
}
