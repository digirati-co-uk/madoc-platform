import { CaptureModelProvider } from './capture-model-provider';
import * as React from 'react';
import { useEffect } from 'react';
import { useNavigation } from './navigation';
import { useCurrentSelector } from './current-selector';
import { BoxSelectorProps } from '../selector-types/BoxSelector/BoxSelector';

const withSimpleCaptureModel = (Component: React.FC): React.FC => () => (
  <CaptureModelProvider captureModel={require('../../../../../../fixtures/simple.json')}>
    <Component />
  </CaptureModelProvider>
);

export default {
  title: 'Core/Current selector',
};

export const SimpleSelector: React.FC = withSimpleCaptureModel(() => {
  const {
    currentSelectorPath,
    currentSelector,
    updateSelector,
    confirmSelector,
    resetSelector,
    setCurrentSelector,
  } = useCurrentSelector();

  const { replacePath } = useNavigation();

  useEffect(() => {
    replacePath([0, 0]);
  }, [replacePath, setCurrentSelector]);

  if (!currentSelectorPath) {
    return (
      <div>
        <button onClick={() => setCurrentSelector([['name', 0]])}>Choose selector</button>
      </div>
    );
  }

  // @todo this is a general problem with the @types.
  const selectorState = currentSelector ? (currentSelector as BoxSelectorProps['state']) : null;

  return (
    <div>
      <ul>
        <li>
          <strong>Current path: </strong>
          {currentSelectorPath && currentSelectorPath.map((r: any) => `${r[0]}[${r[1]}]`)}
        </li>
        <li>
          <strong>Current selector: </strong>
          {selectorState &&
            `${selectorState.x}, ${selectorState.y}, ${selectorState.width},
              ${selectorState.height}`}
        </li>
        <button
          onClick={() =>
            updateSelector({
              x: Math.floor(Math.random() * 1000),
              y: Math.floor(Math.random() * 1000),
              width: Math.floor(Math.random() * 1000),
              height: Math.floor(Math.random() * 1000),
            })
          }
        >
          randomise
        </button>

        <button onClick={() => resetSelector()}>reset</button>
        <button onClick={() => confirmSelector()}>save</button>
      </ul>
    </div>
  );
});
