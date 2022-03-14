import { CaptureModel, Contributor, Revision, Target } from './capture-model';

export type RevisionRequest = {
  captureModelId?: string;
  source: 'structure' | 'canonical' | 'unknown';
  modelRoot?: string[];
  document: CaptureModel['document'];
  revision: Revision;
  author?: Contributor;
  target?: Target[];
};
