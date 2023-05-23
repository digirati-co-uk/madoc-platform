import React from 'react';
import { FieldSpecification } from '../../../frontend/shared/capture-models/types/field-types';
import { ManifestCanvasExplorer, ManifestCanvasExplorerProps } from './ManifestCanvasExplorer';
import { ManifestCanvasExplorerPreview } from './ManifestCanvasExplorer.preview';
import { registerField } from '../../../frontend/shared/capture-models/plugin-api/global-store';

declare module '../../../frontend/shared/capture-models/types/field-types' {
  export interface FieldTypeMap {
    'manifest-canvas-explorer': ManifestCanvasExplorerProps;
  }
}

export const specification: FieldSpecification<ManifestCanvasExplorerProps> = {
  label: 'Manifest canvas explorer',
  type: 'manifest-canvas-explorer' as const,
  description: 'Choose canvas from a site',
  Component: ManifestCanvasExplorer,
  defaultValue: null,
  allowMultiple: true,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './ManifestCanvasExplorer.editor')),
  TextPreview: ManifestCanvasExplorerPreview,
};

registerField(specification);

export default specification;
