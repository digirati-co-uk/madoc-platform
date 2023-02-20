import { CaptureModelTestHarness } from './CaptureModelTestHarness';
// @ts-ignore
import fieldoverwritten from '../../../fixtures/97-bugs/field-overwritten.json';

export default {
  title: 'Capture model interactions / Field overwritten',
  component: CaptureModelTestHarness,
};

export const IDAMVPAlbuquerqueIndianSchoolYearbooksAndRelatedEphemera1931193237 = CaptureModelTestHarness.story({
  captureModel: fieldoverwritten,
  target: {
    manifestUri:
      'https://digirati-co-uk.github.io/ida-exported-data/iiif/manifest/ocr/_roll_santa-fe-indian-school-yearbooks_1961-1962_cvs-1-48/manifest.json',
    canvasUri:
      'https://presley.dlcs-ida.org/iiif/idatest01/_roll_santa-fe-indian-school-yearbooks_1961-1962_cvs-1-48/canvas/c2',
  },
  revision: 'cf355b2d-926f-4ac4-a525-9a812883ddde',
  errorMessage: `When two users start a contribution and one is submitted and another saved for draft, if in both contributions a field had no value and the reviewer adds a value the draft
  contribution inherits that value. Doesnt seem to affect if the value exists in the draft first`,
});
