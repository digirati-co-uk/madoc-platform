import { CaptureModel } from '../capture-models/types/capture-model';

export function isEditingAnotherUsersRevision(captureModel?: CaptureModel, revisionId?: string, user?: { id: any }) {
  if (!captureModel || !revisionId || !user || !captureModel.revisions) {
    return false;
  }

  const revision = captureModel.revisions.find(rev => rev.id === revisionId);
  if (!revision || !revision.authors || revision.authors.length === 0) {
    return false;
  }

  const userUrn = typeof user.id === 'string' ? user.id : `urn:madoc:user:${user.id}`;

  return revision.authors.indexOf(userUrn) === -1;
}
