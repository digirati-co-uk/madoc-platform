import * as React from 'react';
import { ThemeProvider } from 'styled-components';
import { Button } from '../../atoms/Button';
import { CaptureModelProvider } from '../../core/capture-model-provider';
import { useNavigation } from '../../hooks/useNavigation';
import { defaultTheme } from '../../themes';
import { RoundedCard } from '../RoundedCard/RoundedCard';
import { Choice } from './Choice';

import simple from '../../../../../../../fixtures/simple.json';

const withSimpleCaptureModel = (Component: React.FC): React.FC => () => (
  <ThemeProvider theme={defaultTheme}>
    <CaptureModelProvider captureModel={simple as any}>
      <Component />
    </CaptureModelProvider>
  </ThemeProvider>
);

export default { title: 'Legacy/Choice' };

export const StaticExample: React.FC = () => (
  <ThemeProvider theme={defaultTheme}>
    <div style={{ background: '#FAFCFF', minHeight: '100vh' }}>
      <Choice
        choice={{
          id: '50bca69d-b01f-4f2c-aa9d-189b8d6dbf34',
          type: 'choice',
          description: 'This is the first of two choices.',
          label: 'Choice A',
          items: [
            {
              id: '01698929-fe2e-4976-869a-f565e9d2b8b7',
              type: 'model',
              label: 'Model A',
              description: 'Model A description',
              fields: ['field-a'],
              instructions: 'Instructions for crowdsourcing.',
            },
            {
              id: '895c69ac-5e45-4ea1-a6b5-7ec7fb141e0d',
              type: 'model',
              label: 'Model B',
              fields: ['field-b'],
            },
          ],
        }}
        onChoice={chose => console.log('choice', chose)}
      />
    </div>
  </ThemeProvider>
);

export const UsingHook: React.FC = withSimpleCaptureModel(() => {
  const [currentView, { pop, push, idStack }] = useNavigation();

  if (currentView.type !== 'choice') {
    return (
      <RoundedCard>
        <h3>
          We are on <strong>{currentView.label}</strong>
        </h3>
        <Button onClick={() => pop()}>go back</Button>
      </RoundedCard>
    );
  }

  return <Choice onChoice={push} choice={currentView} showBackButton={!!idStack.length} onBackButton={pop} />;
});
