import React from 'react';
import { Tag } from '../../atoms/Tag';
import { AutocompleteFieldProps } from './AutocompleteField';
import styled from 'styled-components';
import { LinkIcon } from '../../../../icons/LinkIcon';

const AutoCompleteFieldWrapper = styled.div`
  display: inline-flex;
  a {
    font-size: 1.5em;
    :hover {
      svg {
        fill: #4265e9;
      }
    }
  }
  strong {
    vertical-align: middle;
    line-height: 1.8em;
    white-space: nowrap;
  }
`;

export const AutocompleteFieldPreview: React.FC<AutocompleteFieldProps> = ({ value }) => {
  if (!value) {
    return <span style={{ color: '#999', whiteSpace: 'nowrap' }}>No value</span>;
  }

  return (
    <AutoCompleteFieldWrapper>
      <strong>{value.label}</strong>
      {value.resource_class ? <Tag style={{ margin: '0 10px 0 10px' }}>{value.resource_class}</Tag> : null}
      <a href={value.uri}>
        <LinkIcon />
      </a>
    </AutoCompleteFieldWrapper>
  );
};
