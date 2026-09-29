import React from 'react';

import { DropdownFieldProps } from './DropdownField';

export const DropdownFieldPreview: React.FC<DropdownFieldProps> = ({ value, options }) => {
  if (!value) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  return <>{options?.find(option => option.value === value)?.text || value}</>;
};
