import React from 'react';
import { Revisions } from '../../editor/stores/revisions/index';
import { ViewDocument } from '../../inspector/ViewDocument';

export const DefaultPreviewSubmission: React.FC = () => {
  const currentRevision = Revisions.useStoreState(state => state.currentRevision);

  if (!currentRevision || !currentRevision.document) {
    return null;
  }

  return <ViewDocument document={currentRevision.document} padding={false} />;
};
