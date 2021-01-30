import { Revisions } from '@capture-models/editor';
import { hydrateCompressedModel } from '@capture-models/helpers';
import React, { useMemo } from 'react';
import { ViewDocument } from './ViewDocument';
import { createRevisionFromDocument } from '../utility/create-revision-from-document';

export const EditShorthandCaptureModel: React.FC<{
  data: any | undefined;
  template: any;
  onSave: (revision: any) => Promise<void> | void;
}> = ({ data, onSave, template }) => {
  const rev = useMemo(() => {
    if (!data) {
      return undefined;
    }
    const document = hydrateCompressedModel({
      __meta__: template as any,
      ...data,
    });

    return createRevisionFromDocument(document);
  }, [data, template]);

  return rev ? (
    <Revisions.Provider captureModel={rev.model} initialRevision={rev.revisionId}>
      <ViewDocument
        onSave={revision => {
          onSave(revision);
        }}
      />
    </Revisions.Provider>
  ) : null;
};
