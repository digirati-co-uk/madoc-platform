import React from 'react';
import { CardButton } from './editor/components/CardButton/CardButton';
import { RoundedCard } from './editor/components/RoundedCard/RoundedCard';

export const ThankYouPage: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  return (
    <>
      <RoundedCard>Your contribution has been accepted.</RoundedCard>
      <CardButton onClick={onContinue}>Continue</CardButton>
    </>
  );
};
