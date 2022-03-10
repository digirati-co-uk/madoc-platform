import React from 'react';
import { TextFieldProps } from './TextField';

export const TextFieldPreview: React.FC<TextFieldProps> = ({ value, previewInline }) => {
  if (!value) {
    if (previewInline) {
      return <span style={{ color: '#999', display: 'inline-block' }}>No value</span>;
    }
    return <div style={{ color: '#999' }}>No value</div>;
  }

  if (previewInline) {
    return <span style={{ display: 'inline-block', marginRight: '.3em' }}>{value}</span>;
  }

  return <div>{value}</div>;
};
