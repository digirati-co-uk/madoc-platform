import React from 'react';
import { Tag } from '../../atoms/Tag';
import { AutocompleteFieldProps } from './AutocompleteField';
import styled from 'styled-components';

const AutoCompleteFieldWrapper = styled.div`
  display: inline-flex;

  a {
    white-space: nowrap;
    text-after-overflow: elipsis;
  }
`;
export const AutocompleteFieldPreview: React.FC<AutocompleteFieldProps> = ({ value }) => {
  if (!value) {
    return <span style={{ color: '#999' }}>No value</span>;
  }

  return (
    <AutoCompleteFieldWrapper>
      <strong style={{ lineHeight: '1.8em', verticalAlign: 'middle' }}>{value.label}</strong>
      {value.resource_class ? <Tag style={{ margin: '0 10px 0 10px' }}>{value.resource_class}</Tag> : null}
      <a href={value.uri}>{value.uri}</a>
    </AutoCompleteFieldWrapper>
  );
};
