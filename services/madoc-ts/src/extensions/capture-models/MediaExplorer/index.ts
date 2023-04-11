import React from 'react';
import { FieldSpecification } from '../../../frontend/shared/capture-models/types/field-types';
import { MediaExplorer, MediaExplorerProps } from './MediaExplorer';
import { MediaExplorerPreview } from './MediaExplorer.preview';
import { registerField } from '../../../frontend/shared/capture-models/plugin-api/global-store';

declare module '../../../frontend/shared/capture-models/types/field-types' {
  export interface FieldTypeMap {
    'madoc-media-explorer': MediaExplorerProps;
  }
}

export const specification: FieldSpecification<MediaExplorerProps> = {
  label: 'Media explorer',
  type: 'madoc-media-explorer' as const,
  description: 'Choose media from a site',
  Component: MediaExplorer,
  defaultValue: null,
  allowMultiple: true,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './MediaExplorer.editor')),
  TextPreview: MediaExplorerPreview,
};

registerField(specification);

export default specification;
