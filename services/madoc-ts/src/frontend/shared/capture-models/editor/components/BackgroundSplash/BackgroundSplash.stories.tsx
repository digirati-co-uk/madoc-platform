import React from 'react';
import { ThemeProvider } from 'styled-components';
import { BackgroundSplash } from './BackgroundSplash';
import { defaultTheme } from '../../themes';
import { RoundedCard } from '../RoundedCard/RoundedCard';
import { CardButton } from '../CardButton/CardButton';
import { BackBanner } from '../BackBanner/BackBanner';

export default { title: 'Legacy/Background Splash' };

const Container: React.FC = ({ children }) => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <div style={{ maxWidth: 1280, margin: 'auto' }}>
        <div style={{ display: 'flex' }}>
          <div style={{ width: '67%', display: 'flex', background: '#eee' }}>
            <div style={{ margin: 'auto' }}>- viewer -</div>
          </div>
          <div style={{ width: '33%' }}>{children}</div>
        </div>
      </div>
    </ThemeProvider>
  );
};

export const Default: React.FC = () => (
  <Container>
    <div style={{ background: '#FAFCFF', minHeight: '100vh' }}>
      <BackgroundSplash header="Choose what you want to tag">
        <RoundedCard label="Person">
          Move the red box to highlight one person, and enter information about them below. You can repeat this for as
          many people as you recognise.
        </RoundedCard>
        <CardButton size="large">Create new</CardButton>
      </BackgroundSplash>
    </div>
  </Container>
);

export const WithDescription: React.FC = () => (
  <Container>
    <div style={{ background: '#FAFCFF', minHeight: '100vh' }}>
      <BackgroundSplash
        header="Person"
        description="Move the red box to highlight one person, and enter information about them below. You can repeat this for as many people as you recognise."
      >
        <RoundedCard label="Person">
          Move the red box to highlight one person, and enter information about them below. You can repeat this for as
          many people as you recognise.
        </RoundedCard>
        <CardButton size="large">Create new</CardButton>
      </BackgroundSplash>
    </div>
  </Container>
);

export const WithInteractiveCards: React.FC = () => (
  <Container>
    <div style={{ background: '#FAFCFF', minHeight: '100vh' }}>
      <BackBanner>Some text at the top.</BackBanner>
      <BackgroundSplash header="Choose what you want to tag">
        <RoundedCard interactive label="Whole Photograph">
          Enter whatever information you have about this photograph
        </RoundedCard>
        <RoundedCard interactive label="Person">
          Move the red box to highlight one person, and enter information about them below. You can repeat this for as
          many people as you recognise.
        </RoundedCard>
        <RoundedCard interactive label="Tags">
          Tagging photographs will help people to search the collection. Please use tags/suggestions from the
          autocomplete list whenever possible. If you cannot find a matching suggestion, then enter your own tags in the
          additional tags box.
        </RoundedCard>
      </BackgroundSplash>
    </div>
  </Container>
);
