import * as React from 'react';
import { CardDropdown } from './CardDropdown';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '../../themes';
import { BackgroundSplash } from '../BackgroundSplash/BackgroundSplash';

export default { title: 'Legacy/Card dropdown' };

export const Simple: React.FC = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <BackgroundSplash header="Choose what you want to tag">
        <CardDropdown
          label="This is a dropdown"
          interactive
          cards={[{ label: 'Card 1' }, { label: 'Card 2' }, { label: 'Card 3' }]}
        >
          This is a card dropdown.
        </CardDropdown>
      </BackgroundSplash>
    </ThemeProvider>
  );
};
