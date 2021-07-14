import { isEmptyRevision } from '@capture-models/helpers';
import { RevisionRequest } from '@capture-models/types';
import { useMemo } from 'react';
import { useNavigation, Revisions } from '@capture-models/editor';
import { useUser } from '../../../hooks/use-site';

export function revisionsMapToRevisionsList(
  revisionsMap: { [id: string]: RevisionRequest },
  currentView?: any
): RevisionRequest[] {
  return Object.keys(revisionsMap)
    .map(revId => revisionsMap[revId])
    .filter(rev => (currentView && currentView.type === 'model' ? rev.revision.structureId === currentView.id : true));
}

export function filterCanonicalRevisions(revisions: RevisionRequest[]): RevisionRequest[] {
  return revisions.filter(rev => rev.source === 'canonical').filter(rev => !isEmptyRevision(rev));
}

export function filterUserRevisions(revisions: RevisionRequest[], user?: { id: number }): RevisionRequest[] {
  return user
    ? revisions.filter(
        rev => rev.source !== 'canonical' && (rev.revision.authors || []).indexOf(`urn:madoc:user:${user.id}`) !== -1
      )
    : [];
}

export function filterOtherUsersRevisions(revisions: RevisionRequest[], user?: { id: number }): RevisionRequest[] {
  return user
    ? revisions.filter(
        rev => rev.source !== 'canonical' && (rev.revision.authors || []).indexOf(`urn:madoc:user:${user.id}`) === -1
      )
    : revisions.filter(rev => rev.source !== 'canonical');
}

export function useRevisionList({ filterCurrentView = true }: { filterCurrentView?: boolean } = {}) {
  const user = useUser();
  const [currentView] = useNavigation();
  const revisionsMap = Revisions.useStoreState(s => s.revisions);
  const revisions: RevisionRequest[] = useMemo(
    () => revisionsMapToRevisionsList(revisionsMap, filterCurrentView ? currentView : undefined),
    [currentView, filterCurrentView, revisionsMap]
  );

  const canonicalRevision = useMemo(() => filterCanonicalRevisions(revisions), [revisions]);
  const myRevisions = useMemo(() => filterUserRevisions(revisions, user), [revisions, user]);
  const otherPeoplesRevisions = useMemo(() => filterOtherUsersRevisions(revisions, user), [revisions, user]);
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
