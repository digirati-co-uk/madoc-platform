import React from 'react';
import { BackgroundSplash, CardButton, RoundedCard } from '@capture-models/editor';

export const ThankYouPage: React.FC<{ onContinue: () => void }> = ({ onContinue }) => {
  return (
    <BackgroundSplash header="Thanks for your contribution">
      <RoundedCard>Your contribution has been accepted.</RoundedCard>
      <CardButton onClick={onContinue}>Continue</CardButton>
    </BackgroundSplash>
  );
};

