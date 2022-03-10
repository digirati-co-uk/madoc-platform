import React, { useMemo, useState } from 'react';
import { RoundedCard } from './editor/components/RoundedCard/RoundedCard';
import { Revisions } from './editor/stores/revisions/index';
import { SingleRevision } from './SingleRevision';
import { RevisionRequest } from './types/revision-request';

export const SubmissionList: React.FC<{ submissions: RevisionRequest[] }> = ({ submissions }) => {
  const myUnpublished = useMemo(() => submissions.filter(rev => rev.revision.status === 'draft'), [submissions]);
  const mySubmitted = useMemo(() => submissions.filter(rev => rev.revision.status === 'submitted'), [submissions]);
  const unsavedIds = Revisions.useStoreState(s => s.unsavedRevisionIds);
  const selectRevision = Revisions.useStoreActions(a => a.selectRevision);
  const [showPending, setShowPending] = useState(false);

  if (submissions.length === 0 || (mySubmitted.length === 0 && myUnpublished.length === 0)) {
    return null;
  }

  return (
    <RoundedCard size="small">
      <h4>Your submissions</h4>
      {myUnpublished.length > 0 ? (
        <p>These are the submissions that you have created but not yet submitted for review or others to see.</p>
      ) : null}
      {myUnpublished.map((rev, idx) => (
        <SingleRevision key={idx} request={rev} unsavedIds={unsavedIds} selectRevision={selectRevision} />
      ))}
      {mySubmitted.length && !showPending ? (
        <p style={{ textAlign: 'center' }}>
          <a href="#" onClick={() => setShowPending(true)}>
            You have {mySubmitted.length} pending submission{mySubmitted.length > 1 && 's'}
          </a>
        </p>
      ) : null}
      {showPending ? (
        <>
          <a style={{ float: 'right' }} href="#" onClick={() => setShowPending(false)}>
            close
          </a>
          <h4>Awaiting review</h4>
          {mySubmitted.map((rev, idx) => (
            <SingleRevision key={idx} request={rev} unsavedIds={unsavedIds} selectRevision={selectRevision} />
          ))}
        </>
      ) : null}
    </RoundedCard>
  );
};
