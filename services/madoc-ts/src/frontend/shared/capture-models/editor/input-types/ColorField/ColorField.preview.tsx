import React from 'react';
import { InputLabel } from '../../../../form/Input';
import { ColorFieldProps } from './ColorField';

export const ColorFieldPreview: React.FC<ColorFieldProps> = ({ value }) => {
  if (!value) {
    return <div style={{ color: '#999' }}>No value</div>;
  }

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ background: value, height: '2em', borderRadius: 5, width: '3em' }} />
      <div style={{ flex: 1, paddingLeft: '1em', alignSelf: 'center' }}>
        <InputLabel>{value}</InputLabel>
      </div>
    </div>
  );
};
