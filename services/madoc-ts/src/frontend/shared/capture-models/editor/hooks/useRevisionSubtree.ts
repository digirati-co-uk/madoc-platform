import { Revisions } from '../stores/revisions/index';

function useRevisionSubtree() {
  return Revisions.useStoreState(s => {
    return { currentEntity: s.revisionSubtree, currentField: s.revisionSubtreeField };
  });
}
