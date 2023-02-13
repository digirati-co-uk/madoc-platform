import { expect } from '@storybook/jest';
import { userEvent, within } from '@storybook/testing-library';
import { CaptureModelTestHarness, wait } from './CaptureModelTestHarness';
// @ts-ignore
import mad1200fixture1 from '../../../fixtures/96-jira/MAD-1200-1.json';
// @ts-ignore
import mad1200fixture2 from '../../../fixtures/96-jira/MAD-1200-2.json';
// @ts-ignore
import mad1200fixture3 from '../../../fixtures/96-jira/MAD-1200-3.json';
export default { title: 'Capture model interactions / MAD-1200' };

// Non interactive examples.
export const Fixture1 = CaptureModelTestHarness.story({
  captureModel: mad1200fixture1,
  target: {
    manifestUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/manifest',
    canvasUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/canvas/p1',
  },
});

export const Fixture2 = CaptureModelTestHarness.story({
  captureModel: mad1200fixture2,
  target: {
    manifestUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/manifest',
    canvasUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/canvas/p1',
  },
});
export const Fixture3 = CaptureModelTestHarness.story({
  captureModel: mad1200fixture3,
  target: {
    manifestUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/manifest',
    canvasUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/canvas/p1',
  },
});

export const DoubleModelExample = CaptureModelTestHarness.story({
  captureModel: mad1200fixture1,
  revision: mad1200fixture1.revisions[0].id,
  target: {
    manifestUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/manifest',
    canvasUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/canvas/p1',
  },
  warningMessage: `Ensure this model shows 2 regions`,
});
DoubleModelExample.play = async args => {
  const canvas = within(args.canvasElement);

  await CaptureModelTestHarness.waitForViewer(args);

  const computed = await CaptureModelTestHarness.getComputedRevision(args);

  expect(computed.document.properties['Vertaling & Transcriptie']).toHaveLength(2);

  const element = args.canvasElement.querySelector(`[data-entity-id="e60b0c30-230e-4bd3-b0aa-2963256c5dcd"]`);
  expect(element).not.toBeUndefined();

  const instances = element.querySelectorAll(`[data-instance-id]`);
  expect(instances).toHaveLength(2);
};

export const DoubleModelExampleNoRevision = CaptureModelTestHarness.story({
  captureModel: mad1200fixture1,
  target: {
    manifestUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/manifest',
    canvasUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/canvas/p1',
  },
  warningMessage: `Ensure this model has 2 regions, instead of just one`,
});
DoubleModelExampleNoRevision.play = async args => {
  await CaptureModelTestHarness.waitForViewer(args);

  const element = args.canvasElement.querySelector(`[data-entity-id="e60b0c30-230e-4bd3-b0aa-2963256c5dcd"]`);
  expect(element).not.toBeUndefined();

  const instances = element.querySelectorAll(`[data-instance-id]`);
  expect(instances).toHaveLength(2);
};

export const BrokenRevisionExample = CaptureModelTestHarness.story({
  captureModel: mad1200fixture2,
  target: {
    manifestUri: 'https://view.nls.uk/manifest/9713/97134412/manifest.json',
    canvasUri: 'https://view.nls.uk/manifest/9713/97134412/canvas/2',
  },
  revision: mad1200fixture2.revisions[0].id,
  errorMessage: `This model should show 1 region, instead of 2 when selected`,
});
BrokenRevisionExample.play = async args => {
  await CaptureModelTestHarness.waitForViewer(args);

  await wait(500);

  const element = args.canvasElement.querySelector(`[data-entity-id="a0844c53-ea68-4550-a5c9-f72492bbe517"]`);
  expect(element).not.toBeUndefined();

  const instances = args.canvasElement.querySelectorAll(`[data-entity-id]`);
  expect(instances).toHaveLength(1);
};

export const JestTestCase = CaptureModelTestHarness.story({
  captureModel: mad1200fixture3,
  target: {
    manifestUri: 'https://view.nls.uk/manifest/9713/97134412/manifest.json',
    canvasUri: 'https://view.nls.uk/manifest/9713/97134412/canvas/2',
  },
  // revision: mad1200fixture3.revisions[0].id,
  errorMessage: `This model should show 2 regions`,
});
JestTestCase.play = async args => {
  await CaptureModelTestHarness.waitForViewer(args);

  await wait(500);

  const instances = args.canvasElement.querySelectorAll(`[data-instance-id]`);
  expect(instances).toHaveLength(1);

  const images = instances[0].querySelectorAll('img');
  expect(images).toHaveLength(0);
};
export const JestTestCaseWithRevision = CaptureModelTestHarness.story({
  captureModel: mad1200fixture3,
  target: {
    manifestUri: 'https://view.nls.uk/manifest/9713/97134412/manifest.json',
    canvasUri: 'https://view.nls.uk/manifest/9713/97134412/canvas/2',
  },
  revision: mad1200fixture3.revisions[0].id,
  errorMessage: `This model should show 2 regions`,
});
JestTestCaseWithRevision.play = async args => {
  await CaptureModelTestHarness.waitForViewer(args);

  await wait(500);

  const instances = args.canvasElement.querySelectorAll(`[data-instance-id]`);
  expect(instances).toHaveLength(2);
};

export const NoRevisionExample = CaptureModelTestHarness.story({
  captureModel: mad1200fixture2,
  target: {
    manifestUri: 'https://view.nls.uk/manifest/9713/97134412/manifest.json',
    canvasUri: 'https://view.nls.uk/manifest/9713/97134412/canvas/2',
  },
  warningMessage: `Ensure this model shows only selects a single region correctly`,
});
NoRevisionExample.play = async args => {
  await CaptureModelTestHarness.waitForViewer(args);

  await wait(500);

  const instances = args.canvasElement.querySelectorAll(`[data-entity-id]`);
  expect(instances).toHaveLength(1);
};
