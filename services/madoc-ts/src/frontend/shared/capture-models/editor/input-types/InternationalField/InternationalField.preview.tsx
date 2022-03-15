import React from 'react';
import { InternationalFieldProps } from './InternationalField';
import { LocaleString } from '../../../../components/LocaleString';

export const InternationalFieldPreview: React.FC<InternationalFieldProps> = ({ value }) => {
  if (!value) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  return (
    <div>
      <LocaleString>{value}</LocaleString>
    </div>
  );
};
