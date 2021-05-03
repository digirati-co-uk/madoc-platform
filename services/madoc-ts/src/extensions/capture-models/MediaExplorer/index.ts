import { FieldSpecification } from '@capture-models/types';
import React from 'react';
import { MediaExplorer, MediaExplorerProps } from './MediaExplorer';
import { MediaExplorerPreview } from './MediaExplorer.preview';

declare module '@capture-models/types' {
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
