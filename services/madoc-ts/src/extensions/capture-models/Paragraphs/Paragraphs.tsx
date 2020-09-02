import React from 'react';
import { BaseField } from '@capture-models/types';
import { TableEmpty } from '../../../frontend/shared/atoms/Table';

export interface ParagraphsProps extends BaseField {
  id: string;
  type: 'madoc-paragraphs';
  value: string;
}

export const Paragraphs = () => {
  return <TableEmpty>No OCR data available</TableEmpty>;
};
