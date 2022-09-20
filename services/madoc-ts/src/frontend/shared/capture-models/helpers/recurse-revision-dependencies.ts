import { CaptureModel } from '../types/capture-model';

export function recurseRevisionDependencies(revisionId: string, revisions: CaptureModel['revisions']): string[] {
  if (!revisions) {
    return [revisionId];
  }

  const rev = revisions.find(r => r.id === revisionId);

  if (!rev) {
    return [revisionId];
  }

  if (rev.revises) {
    return [revisionId, ...recurseRevisionDependencies(rev.revises, revisions)];
  }

  return [revisionId];
}
