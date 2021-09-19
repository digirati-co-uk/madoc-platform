import { TinyButton } from '../navigation/Button';
import React from 'react';
import { Revisions } from '@capture-models/editor';
import { CaptureModel } from '@capture-models/types';
import styled from 'styled-components';

const NewInstanceContainer = styled.div`
  text-align: center;
  margin-bottom: 1em;
`;

export const NewEntityInstanceButton: React.FC<{
  property: string;
  entity: CaptureModel['document'];
  path: [string, string][];
}> = ({ property, entity, path }) => {
  const { createNewEntityInstance } = Revisions.useStoreActions(a => ({
    createNewEntityInstance: a.createNewEntityInstance,
  }));

  // path
  // revisionId
  // property

  return (
    <NewInstanceContainer>
      <TinyButton onClick={() => createNewEntityInstance({ property, path })}>Add {entity.label}</TinyButton>
    </NewInstanceContainer>
  );
};
