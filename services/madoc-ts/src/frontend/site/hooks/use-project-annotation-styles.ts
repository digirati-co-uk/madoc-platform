import { useMemo } from 'react';
import { getDefaultAnnotationStyles } from '../../shared/capture-models/AnnotationStyleContext';
import { useProject } from './use-project';

export function useProjectAnnotationStyles() {
  const project = useProject();
  const projectTheme = project.data?.annotationTheme;

  return useMemo(() => Object.assign({}, getDefaultAnnotationStyles(), projectTheme || {}), [projectTheme]);
}
