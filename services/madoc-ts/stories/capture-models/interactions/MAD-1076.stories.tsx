import { CaptureModelTestHarness } from './CaptureModelTestHarness';
// @ts-ignore
import mad1076fixture from '../../../fixtures/96-jira/MAD-1076.json';

export default { title: 'Capture model interactions / MAD-1076 OCR saving' };

export const InvalidBaseRevisionError = CaptureModelTestHarness.story({
  // The problem here is something went wrong during saving and there is NO canonical value.
  // What we need to do is to take one of the revised values, nuke it, and then re-add it.
  captureModel: mad1076fixture,
  errorMessage: `Saving this model does not work. If you edit a word, and then save, and reselect the revision it will
    replace the entire line with the single word that was added. The selector will also be wrong. Something not right
    with the merging. However, this is just the revision - it does appear to show everything else correctly.
  `,
  target: {
    manifestUri: 'https://digirati-co-uk.github.io/wunder.json',
    canvasUri: 'https://digirati-co-uk.github.io/wunder/canvases/27',
  },
});
