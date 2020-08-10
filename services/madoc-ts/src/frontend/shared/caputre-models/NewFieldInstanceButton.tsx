import React from 'react';
import { Revisions } from '@capture-models/editor';
import styled from 'styled-components';
import { TinyButton } from '../atoms/Button';
import { BaseField } from '@capture-models/types';

const NewInstanceContainer = styled.div`
  text-align: center;
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
