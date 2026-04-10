import React from 'react';
import { DateFieldProps } from './DateField';

export const DateFieldPreview: React.FC<DateFieldProps> = ({ value }) => {
  if (!value) {
    return <div style={{ color: '#999' }}>No value</div>;
  }

  return <div style={{ minWidth: '100px' }}>{value}</div>;
};
