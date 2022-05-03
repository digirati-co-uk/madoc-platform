import React from 'react';
import { InternationalFieldProps } from './InternationalField';
import { LocaleString } from '../../../../components/LocaleString';

export const InternationalFieldPreview: React.FC<InternationalFieldProps> = ({ value, previewInline }) => {
  if (!value) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  return <LocaleString as={previewInline ? 'span' : 'div'}>{value}</LocaleString>;
};
