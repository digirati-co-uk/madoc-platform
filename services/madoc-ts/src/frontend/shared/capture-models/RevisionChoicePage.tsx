import { useChoiceRevisions } from './editor/hooks/useChoiceRevisions';
import { Revisions } from './editor/stores/revisions/index';
import { RevisionList } from './RevisionList';
import React from 'react';
import { StructureType } from './types/utility';

export const RevisionChoicePage: React.FC<{
  model: StructureType<'model'>;
  goBack?: () => void;
  allowEdits?: boolean;
  readOnly?: boolean;
}> = ({ model, goBack, allowEdits, readOnly }) => {
  const revisions = useChoiceRevisions(model.id);
  const selectRevision = Revisions.useStoreActions(a => a.selectRevision);
  const createRevision = Revisions.useStoreActions(a => a.createRevision);
  const unsavedIds = Revisions.useStoreState(s => s.unsavedRevisionIds);

  return (
    <RevisionList
      model={model}
      goBack={goBack}
      revisions={revisions}
      selectRevision={selectRevision}
      createRevision={createRevision}
      unsavedIds={unsavedIds}
      allowEdits={allowEdits}
    />
  );
};
