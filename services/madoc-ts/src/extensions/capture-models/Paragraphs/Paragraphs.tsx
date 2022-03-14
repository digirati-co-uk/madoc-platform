import React from 'react';
import { BaseField } from '../../../frontend/shared/capture-models/types/field-types';
import { TableEmpty } from '../../../frontend/shared/layout/Table';

export interface ParagraphsProps extends BaseField {
  id: string;
  type: 'madoc-paragraphs';
  value: string;
}

export const Paragraphs = () => {
  return <TableEmpty>No OCR data available</TableEmpty>;
};
