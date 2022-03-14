import React, { useMemo, useState } from 'react';
import { RevisionRequest } from '../../../types/revision-request';
import { RoundedCard } from '../RoundedCard/RoundedCard';
import { useTranslation } from 'react-i18next';

export const SubmissionList: React.FC<{
  submissions: RevisionRequest[];
  renderRevisions: (revisions: RevisionRequest[]) => React.ReactNode;
}> = ({ submissions, renderRevisions }) => {
  const { t } = useTranslation();
  const myUnpublished = useMemo(() => submissions.filter(rev => rev.revision.status === 'draft'), [submissions]);
  const mySubmitted = useMemo(() => submissions.filter(rev => rev.revision.status === 'submitted'), [submissions]);
  const [showPending, setShowPending] = useState(false);

  if (submissions.length === 0 || (mySubmitted.length === 0 && myUnpublished.length === 0)) {
    return null;
  }

  return (
    <RoundedCard size="small">
      <h4>{t('Your submissions')}</h4>
      {myUnpublished.length > 0 ? (
        <p>{t('These are the submissions that you have created but not yet submitted for review or others to see.')}</p>
      ) : null}
      {renderRevisions(myUnpublished)}
      {mySubmitted.length && !showPending ? (
        <p style={{ textAlign: 'center' }}>
          <a href="#" onClick={() => setShowPending(true)}>
            {t('You have {{count}} pending submissions', { count: mySubmitted.length })}
          </a>
        </p>
      ) : null}
      {showPending ? (
        <>
          <a style={{ float: 'right' }} href="#" onClick={() => setShowPending(false)}>
            {t('close')}
          </a>
          <h4>{t('Awaiting review')}</h4>
          {renderRevisions(mySubmitted)}
        </>
      ) : null}
    </RoundedCard>
  );
};
