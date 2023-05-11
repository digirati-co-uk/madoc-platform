import React from 'react';
import { FieldSpecification } from '../../../frontend/shared/capture-models/types/field-types';
import { ProjectExplorer, ProjectExplorerProps } from './ProjectExplorer';
import { ProjectExplorerPreview } from './ProjectExplorer.preview';

declare module '../../../frontend/shared/capture-models/types/field-types' {
  export interface FieldTypeMap {
    'project-explorer': ProjectExplorerProps;
  }
}

export const specification: FieldSpecification<ProjectExplorerProps> = {
  label: 'Project explorer',
  type: 'project-explorer' as const,
  description: 'Choose project from a site',
  Component: ProjectExplorer,
  defaultValue: null,
  allowMultiple: true,
  required: false,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './ProjectExplorer.editor')),
  TextPreview: ProjectExplorerPreview,
};
