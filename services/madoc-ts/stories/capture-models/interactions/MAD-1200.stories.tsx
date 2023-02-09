import { CaptureModelTestHarness } from './CaptureModelTestHarness';
// @ts-ignore
import mad1200fixture1 from '../../../fixtures/96-jira/MAD-1200-1.json';
// @ts-ignore
import mad1200fixture2 from '../../../fixtures/96-jira/MAD-1200-2.json';
export default { title: 'Capture model interactions / MAD-1200' };

export const DoubleModelExample = CaptureModelTestHarness.story({
  captureModel: mad1200fixture1,
  revision: mad1200fixture1.revisions[0].id,
  target: {
    manifestUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/manifest',
    canvasUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/canvas/p1',
  },
  warningMessage: `Ensure this model shows 2 regions`,
});

export const DoubleModelExampleNoRevision = CaptureModelTestHarness.story({
  captureModel: mad1200fixture1,
  target: {
    manifestUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/manifest',
    canvasUri: 'https://www.omeka.ugent.be/manifests/iiif/2/2636/canvas/p1',
  },
  errorMessage: `This model should show 2 regions, instead of just one`,
});

export const BrokenRevisionExample = CaptureModelTestHarness.story({
  captureModel: mad1200fixture2,
  target: {
    manifestUri: 'https://view.nls.uk/manifest/9713/97134412/manifest.json',
    canvasUri: 'https://view.nls.uk/manifest/9713/97134412/canvas/2',
  },
  revision: mad1200fixture2.revisions[0].id,
  errorMessage: `This model should show 1 region, instead of 2 when selected`,
});

export const NoRevisionExample = CaptureModelTestHarness.story({
  captureModel: mad1200fixture2,
  target: {
    manifestUri: 'https://view.nls.uk/manifest/9713/97134412/manifest.json',
    canvasUri: 'https://view.nls.uk/manifest/9713/97134412/canvas/2',
  },
  warningMessage: `Ensure this model shows only selects a single region correctly`,
});
