import React from 'react';
import { RevisionProviderWithFeatures } from '../../new/components/RevisionProviderWithFeatures';
import { Button } from '../atoms/Button';
import { Choice } from '../components/Choice/Choice';
import { CaptureModelProvider } from './capture-model-provider';
import { useNavigation as legacyUseNavigation } from './navigation';
import { ThemeProvider } from 'styled-components';
import { defaultTheme } from '../themes';
import { BackgroundSplash } from '../components/BackgroundSplash/BackgroundSplash';
import { RoundedCard } from '../components/RoundedCard/RoundedCard';
import { useNavigation } from '../hooks/useNavigation';

import simple from '../../../../../../fixtures/simple.json';

const withSimpleCaptureModel = (Component: React.FC): React.FC => () => (
  <ThemeProvider theme={defaultTheme}>
    <CaptureModelProvider captureModel={simple}>
      <Component />
    </CaptureModelProvider>
  </ThemeProvider>
);

export default {
  title: 'Core/Navigation',
};

// export const UsingComponent: React.FC = withSimpleCaptureModel(() => {
//   const [currentView, { pop, push, idStack }] = useNavigation(simple.structure);
//
//   if (currentView.type !== 'choice') {
//     return (
//       <RoundedCard>
//         <h3>
//           We are on <strong>{currentView.label}</strong>
//         </h3>
//         <Button onClick={pop}>go back</Button>
//       </RoundedCard>
//     );
//   }
//
//   return <Choice onChoice={push} choice={currentView} showBackButton={!!idStack.length} onBackButton={pop} />;
// });

export const LegacyHook: React.FC = withSimpleCaptureModel(() => {
  const { currentView, pushPath, currentPath, popPath } = legacyUseNavigation();

  if (!currentView) {
    return null;
  }

  return (
    <RevisionProviderWithFeatures>
      <ThemeProvider theme={defaultTheme}>
        {currentPath.length ? <button onClick={popPath}>back</button> : null}
        <BackgroundSplash header={currentView.label} description={currentView.description}>
          {currentView.type === 'choice' ? (
            currentView.items.map((item: any, idx: number) => (
              <RoundedCard label={item.label} interactive key={idx} onClick={() => pushPath(idx)}>
                {item.description}
              </RoundedCard>
            ))
          ) : (
            <RoundedCard>We are on a form!</RoundedCard>
          )}
        </BackgroundSplash>
      </ThemeProvider>
    </RevisionProviderWithFeatures>
  );
});
