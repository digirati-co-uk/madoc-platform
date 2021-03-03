import React from 'react';
import { registerField } from '@capture-models/plugin-api';
import { Paragraphs, ParagraphsProps } from './Paragraphs';
import { FieldSpecification } from '@capture-models/types';
import { ParagraphsPreview } from './Paragraphs.preview';

declare module '@capture-models/types' {
  export interface FieldTypeMap {
    'madoc-paragraphs': ParagraphsProps;
  }
}

const specification: FieldSpecification<ParagraphsProps> = {
  label: 'Edit OCR data',
  type: 'madoc-paragraphs',
  description: 'Dynamic paragraphs generated from OCR',
  Component: Paragraphs,
  defaultValue: '',
  allowMultiple: true,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './Paragraphs.editor')),
  TextPreview: ParagraphsPreview,
};

registerField(specification);

export default specification;
