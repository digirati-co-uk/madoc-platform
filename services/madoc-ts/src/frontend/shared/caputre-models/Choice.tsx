import React from 'react';
import { RoundedCard } from '@capture-models/editor';
import { StructureType } from '@capture-models/types';

export const Choice: React.FC<{
  showBackButton: boolean;
  onBackButton: () => void;
  onChoice: (id: string) => void;
  choice: StructureType<'choice'>;
}> = ({ choice, onChoice, showBackButton, onBackButton, children }) => {
  return (
    <>
      {showBackButton ? <button onClick={onBackButton}>back</button> : null}
      {choice.items.map((item, idx) => (
        <RoundedCard key={idx} label={item.label} interactive onClick={() => onChoice(item.id)}>
          {item.description}
        </RoundedCard>
      ))}
      {children}
    </>
  );
};
