import React from 'react';
import { BorderFieldProps } from './BorderField';

export const BorderFieldPreview: React.FC<BorderFieldProps> = ({ value }) => {
  if (!value) {
    return <div style={{ color: '#999' }}>No value</div>;
  }

  const { color, size, sizeUnit, opacity, style } = value;

  return (
    <div style={{ display: 'flex' }}>
      <div style={{ background: color, height: '2em', borderRadius: 5, width: '3em', opacity }} />
      <div style={{ flex: 1, paddingLeft: '1em', alignSelf: 'center' }}>
        <pre style={{ margin: 0, padding: 0 }}>{`${size}${sizeUnit || 'px'} ${style || 'solid'} ${color} (${opacity *
          100}% opacity)`}</pre>
      </div>
    </div>
  );
};
