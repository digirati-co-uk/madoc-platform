import React from 'react';
import { StructureType } from '../../../types/utility';
import { BackgroundSplash } from '../BackgroundSplash/BackgroundSplash';
import { RoundedCard } from '../RoundedCard/RoundedCard';

export const Choice: React.FC<{
  showBackButton?: boolean;
  onBackButton?: () => void;
  onChoice: (id: string) => void;
  choice: StructureType<'choice'>;
}> = ({ choice, onChoice, showBackButton, onBackButton, children }) => {
  return (
    <>
      {showBackButton && onBackButton ? <button onClick={onBackButton}>back</button> : null}
      <BackgroundSplash header={choice.label} description={choice.description}>
        {choice.items.map((item, idx) => (
          <RoundedCard key={idx} label={item.label} interactive onClick={() => onChoice(item.id)}>
            {item.description}
          </RoundedCard>
        ))}
        {children}
      </BackgroundSplash>
    </>
  );
};
