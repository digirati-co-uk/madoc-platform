import React from 'react';
import { Tag } from '../../atoms/Tag';
import { AutocompleteFieldProps } from './AutocompleteField';

export const AutocompleteFieldPreview: React.FC<AutocompleteFieldProps> = ({ value }) => {
  if (!value) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  return (
    <>
      <strong style={{ lineHeight: '1.8em', verticalAlign: 'middle' }}>{value.label}</strong>
      {value.resource_class ? <Tag style={{ float: 'right', marginLeft: 10 }}>{value.resource_class}</Tag> : null}
      <div>
        <a href={value.uri}>{value.uri}</a>
      </div>
    </>
  );
};
