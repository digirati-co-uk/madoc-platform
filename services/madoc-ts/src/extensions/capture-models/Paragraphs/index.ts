import React from 'react';
import { registerField } from '../../../frontend/shared/capture-models/plugin-api/global-store';
import { FieldSpecification } from '../../../frontend/shared/capture-models/types/field-types';

import { Paragraphs, ParagraphsProps } from './Paragraphs';
import { ParagraphsPreview } from './Paragraphs.preview';

declare module '../../../frontend/shared/capture-models/types/field-types' {
  interface FieldTypeMap {
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
  required: false,
  defaultProps: {},
  Editor: React.lazy(() => import(/* webpackChunkName: "field-editors" */ './Paragraphs.editor')),
  TextPreview: ParagraphsPreview,
};

registerField(specification);

export default specification;
