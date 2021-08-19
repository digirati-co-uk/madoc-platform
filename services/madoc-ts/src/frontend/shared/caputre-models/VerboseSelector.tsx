import { RoundedCard } from '@capture-models/editor';
import { BaseSelector } from '@capture-models/types';
import React from 'react';
import { EntityInstance } from './EntityInstance';

type VerboseSelectorProps = {
  selector: BaseSelector;
  readOnly?: boolean;
  isTopLevel?: boolean;
};

export const VerboseSelector: React.FC<VerboseSelectorProps> = ({ selector, readOnly, isTopLevel }) => {
  return (
    <RoundedCard>
      <EntityInstance selectorId={selector.id} readOnly={readOnly} isTopLevel={isTopLevel} />
    </RoundedCard>
  );
};
