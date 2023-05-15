import React from 'react';
import { FieldSpecification } from '../../../frontend/shared/capture-models/types/field-types';
import { CanvasExplorer, CanvasExplorerProps } from './CanvasExplorer';
import { CanvasExplorerPreview } from './CanvasExplorer.preview';

declare module '../../../frontend/shared/capture-models/types/field-types' {
  export interface FieldTypeMap {
    'canvas-explorer': CanvasExplorerProps;
  }
}

export const specification: FieldSpecification<CanvasExplorerProps> = {
  label: 'Canvas explorer',
  type: 'canvas-explorer' as const,
  description: 'Choose canvas from a site',
  Component: CanvasExplorer,
  defaultValue: null,
  allowMultiple: true,
  required: false,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './CanvasExplorer.editor')),
  TextPreview: CanvasExplorerPreview,
};
