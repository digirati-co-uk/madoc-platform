import React from 'react';
import { FieldSpecification } from '../../../frontend/shared/capture-models/types/field-types';
import { TopicExplorer, TopicExplorerProps } from './TopicExplorer';
import { TopicExplorerPreview } from './TopicExplorer.preview';

declare module '../../../frontend/shared/capture-models/types/field-types' {
  export interface FieldTypeMap {
    'topic-explorer': TopicExplorerProps;
  }
}

export const specification: FieldSpecification<TopicExplorerProps> = {
  label: 'Topic explorer',
  type: 'topic-explorer' as const,
  description: 'Choose a topic',
  Component: TopicExplorer,
  defaultValue: null,
  allowMultiple: true,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './TopicExplorer.editor')),
  TextPreview: TopicExplorerPreview,
};
