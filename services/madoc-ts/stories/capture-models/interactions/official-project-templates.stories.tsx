import { crowdsourcedTranscription } from '../../../src/extensions/projects/templates/crowdsourced-transcription';
import { customProject } from '../../../src/extensions/projects/templates/custom-project';
import { metadataSuggestions } from '../../../src/extensions/projects/templates/metadata-suggestions';
import { ocrCorrection } from '../../../src/extensions/projects/templates/ocr-correction';
import { CaptureModelTestHarness } from './CaptureModelTestHarness';

export default { title: 'Capture model interactions / Official project template' };

// cons(crowdsourcedTranscription);
// cons(customProject);
// cons(ocrCorrection);
// cons(metadataSuggestions);

export const CrowdsourcedTranscription = CaptureModelTestHarness.story({
  captureModel: crowdsourcedTranscription.captureModel,
});
