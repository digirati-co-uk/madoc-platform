import React from 'react';
import { Revisions } from '@capture-models/editor';
import styled from 'styled-components';
import { TinyButton } from '../navigation/Button';
import { BaseField } from '@capture-models/types';

const NewInstanceContainer = styled.div`
  text-align: center;
  margin-bottom: 1em;
`;

export const NewFieldButtonInstance: React.FC<{ property: string; path: [string, string][]; field: BaseField }> = ({
  property,
  path,
  field,
}) => {
  const { createNewFieldInstance } = Revisions.useStoreActions(a => ({
    createNewFieldInstance: a.createNewFieldInstance,
  }));

  return (
    <NewInstanceContainer>
      <TinyButton onClick={() => createNewFieldInstance({ property, path })}>Add {field.label}</TinyButton>
    </NewInstanceContainer>
  );
};
