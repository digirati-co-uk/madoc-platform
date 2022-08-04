import { CaptureModel } from '../../types/capture-model';
import { Card } from '../atoms/Card';
import { CaptureModelProvider } from './capture-model-provider';
import * as React from 'react';
import { useCaptureModel } from './capture-model';
// @ts-ignore
import notes from './capture-model.md';

import model from '../../../../../../fixtures/simple.json';

const withSimpleCaptureModel = (Component: React.FC): React.FC => () => (
  <CaptureModelProvider captureModel={model}>
    <Component />
  </CaptureModelProvider>
);

export default {
  title: 'Core/Capture models',
  parameters: { notes },
};
export const Label: React.FC = withSimpleCaptureModel(() => {
  const { captureModel } = useCaptureModel();

  return (
    <Card style={{ margin: '50px auto', padding: 20, maxWidth: 500 }} fluid>
      <h1>{captureModel.structure.label}</h1>
    </Card>
  );
});
