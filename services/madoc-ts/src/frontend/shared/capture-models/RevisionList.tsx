import React from 'react';
import { CardButton } from './editor/components/CardButton/CardButton';
import { CardButtonGroup } from './editor/components/CardButtonGroup/CardButtonGroup';
import { RoundedCard } from './editor/components/RoundedCard/RoundedCard';
import { isEmptyRevision } from './helpers/is-empty-revision';
import { useRefinement } from './plugin-api/hooks/use-refinement';
import { SingleRevision } from './SingleRevision';
import { SubmissionList } from './SubmissionList';
import { useCurrentUser } from '../hooks/use-current-user';
import { RevisionListRefinement } from './types/refinements';
import { RevisionRequest } from './types/revision-request';
import { StructureType } from './types/utility';

export type RevisionListProps = {
  model: StructureType<'model'>;
  revisions: RevisionRequest[];
  unsavedIds?: string[];
  goBack?: () => void;
  selectRevision: (options: { revisionId: string; readMode?: boolean }) => void;
  createRevision: (options: {
    revisionId: string;
    cloneMode: string;
    readMode?: boolean;
    modelMapping?: { [key: string]: string };
  }) => void;
  allowEdits?: boolean;
  readonly?: boolean;
};

export const RevisionList: React.FC<RevisionListProps> = ({
  model,
  goBack,
  revisions,
  selectRevision,
  createRevision,
  unsavedIds = [],
  allowEdits = true,
  readonly,
}) => {
  const { user } = useCurrentUser(true);
  const refinement = useRefinement<RevisionListRefinement>(
    'revision-list',
    { instance: model, property: '' },
    {
      revisions,
    }
  );

  if (refinement) {
    return refinement.refine({ instance: model, property: '' }, {
      revisions,
      selectRevision,
      createRevision,
      goBack,
      allowEdits,
      readonly,
    } as any);
  }

  // SECTIONS
  // ========
  // Canonical (source)
  // My revisions (authors)
  // - Revisions of canonical
  // - Additions
  // Other peoples revisions (admin only)

  // DATA
  // ======
  // Label - revision.label
  // Status - revision.status
  // Creator - revision.authors
  // Approved or not - revision.approved
  // Preview (refineable) - revision.document

  const canonicalRevision = revisions.filter(rev => rev.source === 'canonical').filter(rev => !isEmptyRevision(rev));
  const myRevisions = user ? revisions.filter(rev => (rev.revision.authors || []).indexOf(user.id) !== -1) : [];
  // const otherPeoplesRevisions = revisions.filter(rev => (rev.revision.authors || []).indexOf(user.user.id) === -1);
  // const myAcceptedRevisions = myRevisions.filter(rev => rev.revision.approved);
  // const otherPeoplesAcceptedRevisions = otherPeoplesRevisions.filter(rev => rev.revision.approved);
  // const myUnpublished = myRevisions.filter(rev => rev.revision.status === 'draft');
  // const mySubmitted = myRevisions.filter(rev => rev.revision.status === 'submitted');

  return (
    <>
      {canonicalRevision.length === 0 ? <RoundedCard>Nothing submitted yet</RoundedCard> : null}
      {canonicalRevision.map((rev, idx) => (
        <SingleRevision key={idx} request={rev} unsavedIds={unsavedIds} selectRevision={selectRevision} />
      ))}
      {myRevisions.length > 0 ? <SubmissionList submissions={myRevisions} /> : null}
      {model.instructions ? <RoundedCard>{model.instructions}</RoundedCard> : null}
      <CardButtonGroup>
        {goBack ? <CardButton onClick={goBack}>Back to choices</CardButton> : null}
        {allowEdits ? (
          <CardButton onClick={() => createRevision({ revisionId: model.id, cloneMode: 'FORK_INSTANCE' })}>
            Create new
          </CardButton>
        ) : null}
      </CardButtonGroup>
    </>
  );
};
