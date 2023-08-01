import React from 'react';

import { AvatarGeneratorFieldProps } from './AvatarGeneratorField';

export const AvatarGeneratorFieldPreview: React.FC<AvatarGeneratorFieldProps> = ({ value, inlineLabel }) => {
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
