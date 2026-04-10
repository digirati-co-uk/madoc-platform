import { crowdsourcedTranscription } from '../../../src/extensions/projects/templates/crowdsourced-transcription';
import { customProject } from '../../../src/extensions/projects/templates/custom-project';
import { metadataSuggestions } from '../../../src/extensions/projects/templates/metadata-suggestions';
import { ocrCorrection } from '../../../src/extensions/projects/templates/ocr-correction';
import { CaptureModelTestHarness } from './CaptureModelTestHarness';

export default { title: 'Capture model interactions / Official project template', component: CaptureModelTestHarness };

// cons(crowdsourcedTranscription);
// cons(customProject);
// cons(ocrCorrection);
// cons(metadataSuggestions);

export const CrowdsourcedTranscription = {
  args: {
    captureModel: crowdsourcedTranscription.captureModel,
  },
};
