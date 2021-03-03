import { isEmptyRevision } from '@capture-models/helpers';
import { RevisionRequest } from '@capture-models/types';
import { useMemo } from 'react';
import { useNavigation, Revisions } from '@capture-models/editor';
import { useUser } from '../../../hooks/use-site';

export function useRevisionList() {
  const user = useUser();
  const [currentView] = useNavigation();
  const revisionsMap = Revisions.useStoreState(s => s.revisions);
  const revisions: RevisionRequest[] = useMemo(
    () =>
      Object.keys(revisionsMap)
        .map(revId => revisionsMap[revId])
        .filter(rev =>
          currentView && currentView.type === 'model' ? rev.revision.structureId === currentView.id : true
        ),
    [currentView, revisionsMap]
  );

  const canonicalRevision = useMemo(
    () => revisions.filter(rev => rev.source === 'canonical').filter(rev => !isEmptyRevision(rev)),
    [revisions]
  );
  const myRevisions = useMemo(
    () =>
      user
        ? revisions.filter(
            rev =>
              rev.source !== 'canonical' && (rev.revision.authors || []).indexOf(`urn:madoc:user:${user.id}`) !== -1
          )
        : [],
    [revisions, user]
  );
  const otherPeoplesRevisions = useMemo(
    () =>
      user
        ? revisions.filter(
            rev =>
              rev.source !== 'canonical' && (rev.revision.authors || []).indexOf(`urn:madoc:user:${user.id}`) === -1
          )
        : [],
    [revisions, user]
  );
  const myAcceptedRevisions = useMemo(() => myRevisions.filter(rev => rev.revision.approved), [myRevisions]);
  const otherPeoplesAcceptedRevisions = useMemo(() => otherPeoplesRevisions.filter(rev => rev.revision.approved), [
    otherPeoplesRevisions,
  ]);
  const myUnpublished = useMemo(() => myRevisions.filter(rev => rev.revision.status === 'draft'), [myRevisions]);
  const mySubmitted = useMemo(() => myRevisions.filter(rev => rev.revision.status === 'submitted'), [myRevisions]);

  return {
    canonicalRevision,
    myRevisions,
    otherPeoplesRevisions,
    otherPeoplesAcceptedRevisions,
    myAcceptedRevisions,
    myUnpublished,
    mySubmitted,
  };
}
