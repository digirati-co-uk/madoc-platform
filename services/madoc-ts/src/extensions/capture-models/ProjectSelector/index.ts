import React from 'react';
import { FieldSpecification } from '../../../frontend/shared/capture-models/types/field-types';
import { ProjectSelector, ProjectSelectorProps } from './ProjectSelector';
import { ProjectSelectorPreview } from './ProjectSelector.preview';

declare module '../../../frontend/shared/capture-models/types/field-types' {
  export interface FieldTypeMap {
    'project-selector': ProjectSelectorProps;
  }
}

export const specification: FieldSpecification<ProjectSelectorProps> = {
  label: 'Project selector',
  type: 'project-selector' as const,
  description: 'Choose project from a site',
  Component: ProjectSelector,
  defaultValue: null,
  allowMultiple: true,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './ProjectSelector.editor')),
  TextPreview: ProjectSelectorPreview,
};
