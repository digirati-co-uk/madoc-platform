import React from 'react';
import { FieldSpecification } from '../../../frontend/shared/capture-models/types/field-types';
import { CollectionExplorer, CollectionExplorerProps } from './CollectionExplorer';
import { CollectionExplorerPreview } from './CollectionExplorer.preview';

declare module '../../../frontend/shared/capture-models/types/field-types' {
  export interface FieldTypeMap {
    'collection-explorer': CollectionExplorerProps;
  }
}

export const specification: FieldSpecification<CollectionExplorerProps> = {
  label: 'Collection explorer',
  type: 'collection-explorer' as const,
  description: 'Choose collection from a site',
  Component: CollectionExplorer,
  defaultValue: null,
  allowMultiple: true,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './CollectionExplorer.editor')),
  TextPreview: CollectionExplorerPreview,
};
