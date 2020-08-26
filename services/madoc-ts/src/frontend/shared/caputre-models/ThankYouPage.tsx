import React from 'react';
import { CardButton, RoundedCard } from '@capture-models/editor';

export const ThankYouPage: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  return (
    <>
      <RoundedCard>Your contribution has been accepted.</RoundedCard>
      <CardButton onClick={onContinue}>Continue</CardButton>
    </>
  );
};
