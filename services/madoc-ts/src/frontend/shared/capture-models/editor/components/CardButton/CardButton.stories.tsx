import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '../../themes';
import { BackgroundSplash } from '../BackgroundSplash/BackgroundSplash';
import { RoundedCard } from '../RoundedCard/RoundedCard';
import { CardButton } from './CardButton';

export default { title: 'Legacy/Card button' };

export const Simple: React.FC = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <BackgroundSplash header="Choose what you want to tag">
        <RoundedCard label="Large sized button" />
        <CardButton size="large">Testing card button</CardButton>
        <RoundedCard label="Normal sized button" />
        <CardButton size="medium">Testing card button</CardButton>
        <RoundedCard label="Small sized button" />
        <CardButton size="small">Testing card button</CardButton>

        <RoundedCard label="Large inline button" />
        <CardButton inline size="large">
          Testing card button
        </CardButton>

        <RoundedCard label="Medium inline button" />
        <CardButton inline size="medium">
          Testing card button
        </CardButton>

        <RoundedCard label="Small inline button" />
        <CardButton inline size="small">
          Testing card button
        </CardButton>
      </BackgroundSplash>
    </ThemeProvider>
  );
};
