import { Revisions, useChoiceRevisions } from '@capture-models/editor';
import { RevisionList } from './RevisionList';
import { StructureType } from '@capture-models/types';
import React from 'react';

export const RevisionChoicePage: React.FC<{ model: StructureType<'model'>; goBack?: () => void }> = ({
  model,
  goBack,
}) => {
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
    />
  );
};
