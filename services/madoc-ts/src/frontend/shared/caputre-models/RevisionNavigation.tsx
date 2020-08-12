import { Revisions, useNavigation } from '@capture-models/editor';
import { useRefinement } from '@capture-models/plugin-api';
import { CaptureModel, ChoiceRefinement, RevisionRequest } from '@capture-models/types';
import React, { useMemo } from 'react';
import { RevisionChoicePage } from './RevisionChoicePage';
import { Choice } from './Choice';
import { RevisionTopLevel } from './RevisionTopLevel';
import { SubmissionList } from './SubmissionList';
import { useCurrentUser } from '../hooks/use-current-user';

export const RevisionNavigation: React.FC<{
  structure: CaptureModel['structure'];
  onSaveRevision: (req: RevisionRequest, status?: string) => Promise<void>;
}> = ({ structure, onSaveRevision }) => {
  const [currentView, { pop, push, idStack, goTo }] = useNavigation();
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const revisions = Revisions.useStoreState(s => s.revisions);
  const readMode = Revisions.useStoreState(s => s.currentRevisionReadMode);
  const { user } = useCurrentUser(true);
  const refinement = useRefinement<ChoiceRefinement>(
    'choice-navigation',
    { instance: currentView as any, property: '' },
    { currentRevisionId, structure }
  );

  const currentUsersRevisions = useMemo(() => {
    const keys = Object.keys(revisions);
    if (!user) {
      return [];
    }
    return keys.map(key => revisions[key]).filter(rev => (rev.revision.authors || []).indexOf(user.id) !== -1);
  }, [revisions, user]);

  if (!currentView) {
    return null;
  }

  if (refinement) {
    return refinement.refine(
      { instance: currentView, property: '' },
      { readOnly: readMode, currentRevisionId, pop: pop as any, push, idStack, goTo, structure, onSaveRevision }
    );
  }

  if (currentRevisionId) {
    return (
      <RevisionTopLevel
        onSaveRevision={onSaveRevision}
        instructions={
          currentView.type === 'model' && currentView.instructions ? currentView.instructions : currentView.description
        }
        readOnly={readMode}
      />
    );
  }

  if (currentView.type === 'model') {
    return <RevisionChoicePage goBack={() => pop()} model={currentView} />;
  }

  return (
    <Choice choice={currentView} onBackButton={() => pop()} onChoice={push} showBackButton={idStack.length > 0}>
      {currentUsersRevisions.length ? <SubmissionList submissions={currentUsersRevisions} /> : null}
    </Choice>
  );
};
