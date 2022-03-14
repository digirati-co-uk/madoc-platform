import React, { useMemo } from 'react';
import { useNavigation } from './editor/hooks/useNavigation';
import { Revisions } from './editor/stores/revisions/index';
import { useRefinement } from './plugin-api/hooks/use-refinement';
import { RevisionChoicePage } from './RevisionChoicePage';
import { Choice } from './Choice';
import { RevisionTopLevel } from './RevisionTopLevel';
import { SubmissionList } from './SubmissionList';
import { useCurrentUser } from '../hooks/use-current-user';
import { CaptureModel } from './types/capture-model';
import { ChoiceRefinement } from './types/refinements';
import { RevisionRequest } from './types/revision-request';

export const RevisionNavigation: React.FC<{
  structure: CaptureModel['structure'];
  onSaveRevision: (req: RevisionRequest, status?: string) => Promise<void>;
  readOnly?: boolean;
  allUsers?: boolean;
  allowEdits?: boolean;
}> = ({ allUsers = false, structure, readOnly, allowEdits, onSaveRevision }) => {
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
    if (allUsers) {
      return keys.map(key => revisions[key]);
    }
    return keys.map(key => revisions[key]).filter(rev => (rev.revision.authors || []).indexOf(user.id) !== -1);
  }, [revisions, user]);

  if (!currentView) {
    return null;
  }

  if (refinement) {
    return refinement.refine({ instance: currentView, property: '' }, {
      readOnly: readOnly || readMode,
      currentRevisionId,
      pop: pop as any,
      push,
      idStack,
      goTo,
      structure,
      onSaveRevision,
      allowEdits,
    } as any);
  }

  if (currentRevisionId) {
    return (
      <RevisionTopLevel
        onSaveRevision={onSaveRevision}
        instructions={
          currentView.type === 'model' && currentView.instructions ? currentView.instructions : currentView.description
        }
        allowEdits={allowEdits}
        readOnly={readOnly || readMode}
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
