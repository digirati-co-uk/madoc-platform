import React from 'react';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '../../themes';
import { RoundedCard } from './RoundedCard';
import { CardButton } from '../CardButton/CardButton';

export default { title: 'Legacy/Rounded Card' };

export const Default: React.FC = () => (
  <div style={{ background: '#FAFCFF', minHeight: '100vh', boxSizing: 'border-box' }}>
    <RoundedCard label="Person">
      Move the red box to highlight one person, and enter information about them below. You can repeat this for as many
      people as you recognise.
    </RoundedCard>
    <CardButton size="large">Create new</CardButton>
  </div>
);

export const Interactive: React.FC = () => (
  <ThemeProvider theme={defaultTheme}>
    <div style={{ background: '#FAFCFF', minHeight: '100vh' }}>
      <RoundedCard label="Interactive example" interactive />
    </div>
  </ThemeProvider>
);

export const InteractiveRemove: React.FC = () => (
  <RoundedCard
    label="Interactive example"
    interactive
    onClick={() => alert('clicked')}
    onRemove={() => alert('remove')}
  />
);
