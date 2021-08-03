import { useMemo } from 'react';
import { ProjectTemplate } from '../../../extensions/projects/types';
import { useProjectTemplates } from './use-project-templates';

export function useProjectTemplate(name?: string): ProjectTemplate | undefined {
  const templates = useProjectTemplates();

  return useMemo(() => (name ? templates.find(t => t.type === name) : undefined), [name, templates]);
}
