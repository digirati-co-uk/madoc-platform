import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '../../themes';
import { BackgroundSplash } from '../BackgroundSplash/BackgroundSplash';
import { RoundedCard } from '../RoundedCard/RoundedCard';
import { CardButtonGroup } from './CardButtonGroup';
import { CardButton } from '../CardButton/CardButton';

export default { title: 'Legacy/Card button group' };

export const Simple: React.FC = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <BackgroundSplash header="Choose what you want to tag">
        <RoundedCard label="Large sized button" />
        <CardButtonGroup>
          <CardButton>Use as template</CardButton>
          <CardButton>Suggest edit</CardButton>
        </CardButtonGroup>
      </BackgroundSplash>
    </ThemeProvider>
  );
};
