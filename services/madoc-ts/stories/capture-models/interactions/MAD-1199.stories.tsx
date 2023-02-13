import { CaptureModelTestHarness } from './CaptureModelTestHarness';
// @ts-ignore
import mad1199fixture1 from '../../../fixtures/96-jira/MAD-1199-1-fixed.json';

export default { title: 'Capture model interactions / MAD-1199 invalid base revision' };

export const InvalidBaseRevisionError = CaptureModelTestHarness.story({
  // The problem here is something went wrong during saving and there is NO canonical value.
  // What we need to do is to take one of the revised values, nuke it, and then re-add it.
  captureModel: mad1199fixture1,
  errorMessage: `The error happens with the non-fixed base revision, the code 
  needs to be able to handle when there are fields without non-revised fields 
  (by nuking an existing one as a last resort). Unclear if this should happen
  on the server side, or just in the frontend to handle "corrupt" models`,
});
