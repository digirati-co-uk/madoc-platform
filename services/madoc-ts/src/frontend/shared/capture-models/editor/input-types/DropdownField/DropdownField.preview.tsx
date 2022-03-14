import React from 'react';

import { DropdownFieldProps } from './DropdownField';

export const DropdownFieldPreview: React.FC<DropdownFieldProps> = ({ value }) => {
  if (!value) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  return <>{value}</>;
};
