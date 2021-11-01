import { RoundedCard } from '@capture-models/editor';
import { BaseSelector } from '@capture-models/types';
import React from 'react';
import styled from 'styled-components';
import { EntityInstance } from './EntityInstance';

type VerboseSelectorProps = {
  selector: BaseSelector;
  readOnly?: boolean;
  isTopLevel?: boolean;
};

const SelectorContainer = styled.div`
  margin-bottom: 1em;
  padding: 1em;
  border-radius: 5px;
  background: #e8edff;

  button {
    box-shadow: none;
  }
`;

export const VerboseSelector: React.FC<VerboseSelectorProps> = ({ selector, readOnly, isTopLevel }) => {
  return (
    <SelectorContainer>
      <EntityInstance selectorId={selector.id} readOnly={readOnly} isTopLevel={isTopLevel} />
    </SelectorContainer>
  );
};
