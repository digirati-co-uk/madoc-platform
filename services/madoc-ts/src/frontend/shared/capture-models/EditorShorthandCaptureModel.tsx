import React, { useCallback, useMemo } from 'react';
import { captureModelShorthand } from './helpers/capture-model-shorthand';
import { generateId } from './helpers/generate-id';
import { hydrateCaptureModel } from './helpers/hydrate-capture-model';
import { serialiseCaptureModel } from './helpers/serialise-capture-model';
import { CustomSubmitButton } from './new/components/CustomSubmitButton';
import { EditorSlots, ProfileConfig } from './new/components/EditorSlots';
import { RevisionProviderWithFeatures } from './new/components/RevisionProviderWithFeatures';
import { createRevisionFromDocument } from '../utility/create-revision-from-document';
import { CaptureModel } from './types/capture-model';
import { RevisionRequest } from './types/revision-request';

export const EditShorthandCaptureModel: React.FC<{
  data?: any | undefined;
  template: any;
  fullDocument?: boolean;
  slotConfig?: ProfileConfig;
  saveLabel?: string;
  previewLabel?: string;
  immutableFields?: string[];
  onSave?: (revision: any) => Promise<void> | void;
  onPreview?: (revision: any) => Promise<void> | void;
  keepExtraFields?: boolean;
  structure?: CaptureModel['structure'];
  children?: any;
}> = ({
  data,
  onSave,
  onPreview,
  keepExtraFields,
  template,
  slotConfig: _slotConfig,
  saveLabel,
  previewLabel = 'Preview',
  fullDocument,
  immutableFields,
  structure,
  children,
}) => {
  const saveRevision = useCallback(
    ({ revisionRequest }: { revisionRequest: RevisionRequest }) => {
      if (onSave) {
        onSave(revisionRequest ? serialiseCaptureModel(revisionRequest.document) : null);
      }
    },
    [onSave]
  );
  const previewRevision = useCallback(
    ({ revisionRequest }: { revisionRequest: RevisionRequest }) => {
      if (onPreview) {
        onPreview(revisionRequest ? serialiseCaptureModel(revisionRequest.document) : null);
      }
    },
    [onPreview]
  );

  const rev = useMemo(() => {
    if (!data && !fullDocument) {
      return undefined;
    }

    const document = fullDocument
      ? data
        ? hydrateCaptureModel(template, data, { keepExtraFields })
        : template
      : hydrateCaptureModel(captureModelShorthand(template), data, { keepExtraFields });

    if (structure && fullDocument) {
      return {
        model: {
          id: generateId(),
          document,
          structure,
          revisions: [],
        },
        revisionId: undefined,
      };
    }

    return createRevisionFromDocument(document, { ignoreMultiple: true, structure });
  }, [data, fullDocument, keepExtraFields, template]);

  const slotConfigOverride = useMemo(() => {
    const overrides: any = _slotConfig || {};
    return {
      editor: {
        allowEditing: true,
        immutableFields,
        ...(overrides.editor || {}),
      },
      components: {
        SubmitButton: CustomSubmitButton,
        ...(overrides.components || {}),
      },
      ...overrides,
    };
  }, [_slotConfig, immutableFields]);

  return rev ? (
    <RevisionProviderWithFeatures
      slotConfig={slotConfigOverride}
      features={{
        autosave: false,
        revisionEditMode: true,
      }}
      captureModel={rev.model}
      initialRevision={rev.revisionId}
      revision={rev.revisionId}
    >
      <div style={{ fontSize: '0.85em', maxWidth: 550 }}>{children ? children : <EditorSlots.TopLevelEditor />}</div>

      <div style={{ display: 'flex' }}>
        {onSave ? <EditorSlots.SubmitButton afterSave={saveRevision}>{saveLabel}</EditorSlots.SubmitButton> : null}
        {onPreview ? (
          <div style={{ marginLeft: 10 }}>
            <EditorSlots.SubmitButton afterSave={previewRevision}>{previewLabel}</EditorSlots.SubmitButton>
          </div>
        ) : null}
      </div>
    </RevisionProviderWithFeatures>
  ) : null;
};
