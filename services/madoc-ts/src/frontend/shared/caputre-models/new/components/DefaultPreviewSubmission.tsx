import { Revisions } from '@capture-models/editor';
import React from 'react';
import { ViewDocument } from '../../inspector/ViewDocument';

export const DefaultPreviewSubmission: React.FC = () => {
  const currentRevision = Revisions.useStoreState(state => state.currentRevision);

  if (!currentRevision || !currentRevision.document) {
    return null;
  }

  return <ViewDocument document={currentRevision.document} padding={false} />;
};
