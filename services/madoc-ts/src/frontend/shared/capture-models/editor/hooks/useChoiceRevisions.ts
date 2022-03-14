import { useMemo } from 'react';
import { Revisions } from '../stores/revisions';

export const useChoiceRevisions = (choiceId: string) => {
  const revisions = Revisions.useStoreState(s => s.revisions);

  return useMemo(
    () =>
      Object.keys(revisions)
        .map(revId => revisions[revId])
        .filter(rev => rev.revision.structureId === choiceId),
    [choiceId, revisions]
  );
};
