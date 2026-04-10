import React from 'react';
import { ReadOnlyFieldProps } from './ReadOnlyField';

export const ReadOnlyFieldPreview: React.FC<ReadOnlyFieldProps> = ({ value, previewInline }) => {
  if (!value) {
    if (previewInline) {
      return <span style={{ color: '#999', display: 'inline-block' }}>No value</span>;
    }
    return <div style={{ color: '#999' }}>No value</div>;
  }

  if (previewInline) {
    return (
      <span style={{ display: 'inline-block', minWidth: '100px', marginRight: '.3em', whiteSpace: 'pre-wrap' }}>
        {value}
      </span>
    );
  }

  return <div style={{ whiteSpace: 'pre-wrap', minWidth: '100px' }}>{value}</div>;
};
