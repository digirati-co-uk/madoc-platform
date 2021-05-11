import { useProject } from './use-project';

export function useProjectStatus() {
  const { data: project } = useProject();

  return {
    status: project?.status,
    isActive: project?.status === 1,
    isPreparing: project?.status === 4,
  };
}
