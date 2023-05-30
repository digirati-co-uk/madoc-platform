import React from 'react';
import { FieldSpecification } from '../../../frontend/shared/capture-models/types/field-types';
import { TopicItemExplorer, TopicItemExplorerProps } from './TopicItemExplorer';
import { TopicItemExplorerPreview } from './TopicItemExplorer.preview';

declare module '../../../frontend/shared/capture-models/types/field-types' {
  export interface FieldTypeMap {
    'topic-item-explorer': TopicItemExplorerProps;
  }
}

export const specification: FieldSpecification<TopicItemExplorerProps> = {
  label: 'Topic item explorer',
  type: 'topic-item-explorer' as const,
  description: 'Choose item from this topic',
  Component: TopicItemExplorer,
  defaultValue: null,
  allowMultiple: true,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './TopicItemExplorer.editor')),
  TextPreview: TopicItemExplorerPreview,
};
