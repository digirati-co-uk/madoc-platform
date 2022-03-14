import React from 'react';

import { CheckboxListFieldProps } from './CheckboxFieldList';

export const CheckboxListFieldPreview: React.FC<CheckboxListFieldProps> = ({ value, options, previewList }) => {
  const keys = Object.keys(value || {});
  if (keys.length === 0) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  const values = (options || [])
    .map(opt => {
      return value[opt.value] ? opt.label : null;
    })
    .filter(r => r !== null);

  if (previewList) {
    return (
      <ul>
        {values.map((v, key) => {
          return <li key={key}>{v}</li>;
        })}
      </ul>
    );
  }

  return <>{values.join(', ')}</>;
};
