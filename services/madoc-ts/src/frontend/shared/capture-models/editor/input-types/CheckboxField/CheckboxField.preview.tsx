import React from 'react';

import { CheckboxFieldProps } from './CheckboxField';

export const CheckboxFieldPreview: React.FC<CheckboxFieldProps> = ({ value, inlineLabel }) => {
  if (!value) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  const previewText = value ? <span>yes</span> : <span>no</span>;

  if (inlineLabel) {
    return (
      <span>
        {inlineLabel} ({previewText})
      </span>
    );
  }

  return previewText;
};
