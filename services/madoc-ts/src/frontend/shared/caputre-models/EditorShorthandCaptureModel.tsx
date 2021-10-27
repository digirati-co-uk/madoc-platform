import { hydrateCompressedModel, serialiseCaptureModel } from '@capture-models/helpers';
import { RevisionRequest } from '@capture-models/types';
import React, { useCallback, useMemo } from 'react';
import { CustomSubmitButton } from './new/components/CustomSubmitButton';
import { EditorSlots } from './new/components/EditorSlots';
import { RevisionProviderWithFeatures } from './new/components/RevisionProviderWithFeatures';
import { createRevisionFromDocument } from '../utility/create-revision-from-document';
import { ButtonRow } from '../navigation/Button';

export const EditShorthandCaptureModel: React.FC<{
  data: any | undefined;
  template: any;
  saveLabel?: string;
  immutableFields?: string[];
  onSave: (revision: any) => Promise<void> | void;
}> = ({ data, onSave, template, saveLabel, immutableFields }) => {
  const saveRevision = useCallback(
    ({ revisionRequest }: { revisionRequest: RevisionRequest }) => {
      onSave(revisionRequest ? serialiseCaptureModel(revisionRequest.document) : null);
    },
    [onSave]
  );

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
    <RevisionProviderWithFeatures
      slotConfig={{
        editor: {
          allowEditing: true,
          immutableFields,
        },
        components: {
          SubmitButton: CustomSubmitButton,
        },
      }}
      features={{
        autosave: false,
        revisionEditMode: true,
      }}
      captureModel={rev.model}
      initialRevision={rev.revisionId}
      revision={rev.revisionId}
    >
      <div style={{ fontSize: '0.85em', maxWidth: 550 }}>
        <EditorSlots.TopLevelEditor />
      </div>

      <EditorSlots.SubmitButton afterSave={saveRevision}>{saveLabel}</EditorSlots.SubmitButton>
    </RevisionProviderWithFeatures>
  ) : null;
};
