import { Store } from 'easy-peasy';
import React, { forwardRef, useCallback, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { Input } from './editor/atoms/Input';
import { RevisionsModel } from './editor/stores/revisions/index';
import { captureModelShorthand } from './helpers/capture-model-shorthand';
import { generateId } from './helpers/generate-id';
import { hydrateCaptureModel } from './helpers/hydrate-capture-model';
import { serialiseCaptureModel } from './helpers/serialise-capture-model';
import { CustomSubmitButton } from './new/components/CustomSubmitButton';
import { EditorSlots, ProfileConfig } from './new/components/EditorSlots';
import { RevisionOnChange } from './new/components/RevisionOnChange';
import { RevisionProviderWithFeatures } from './new/components/RevisionProviderWithFeatures';
import { createRevisionFromDocument } from '../utility/create-revision-from-document';
import { RevisionStoreReference } from './new/components/RevisionStoreReference';
import { CaptureModel } from './types/capture-model';
import { RevisionRequest } from './types/revision-request';
import { InputContainer, InputLabel } from '../form/Input';

export interface EditorShorthandCaptureModelProps {
  data?: any | undefined;
  template: any;
  fullDocument?: boolean;
  slotConfig?: ProfileConfig;
  saveLabel?: string;
  previewLabel?: string;
  immutableFields?: string[];
  onSave?: (revision: any) => Promise<void> | void;
  onPreview?: (revision: any) => Promise<void> | void;
  onChange?: (revision: RevisionRequest | null) => void;
  keepExtraFields?: boolean;
  structure?: CaptureModel['structure'];
  children?: any;
  enableSearch?: boolean;
  searchLabel?: string;
}

export interface EditorShorthandCaptureModelRef {
  getData(): any;
}

export const EditShorthandCaptureModel = forwardRef(
  (
    {
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
      enableSearch,
      searchLabel,
      onChange,
      children,
    }: EditorShorthandCaptureModelProps,
    ref: React.Ref<EditorShorthandCaptureModelRef>
  ) => {
    const [search, setSearch] = useState('');
    const revisionRef = useRef<{ store: Store<RevisionsModel> }>();
    useImperativeHandle(ref, () => ({
      getData() {
        const store = revisionRef.current?.store;
        if (store) {
          const revision = store.getState().currentRevision;
          if (revision) {
            return serialiseCaptureModel(revision.document);
          }
        }
      },
    }));

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
          translationNamespace: 'madoc',
        }}
        captureModel={rev.model}
        initialRevision={rev.revisionId}
        revision={rev.revisionId}
      >
        <RevisionStoreReference ref={revisionRef} />
        {onChange ? <RevisionOnChange onChange={onChange} /> : null}
        {enableSearch ? (
          <InputContainer wide>
            {searchLabel ? <InputLabel>{searchLabel}</InputLabel> : null}
            <Input type="text" value={search} placeholder={'Search...'} onChange={e => setSearch(e.target.value)} />
            <style>
              {search.length > 1
                ? `fieldset[data-field-id]:not(fieldset[aria-label*="${search}" i], fieldset[data-aria-description*="${search}" i], fieldset:has(input[type="checkbox"][aria-label*="${search}" i])) {display: none}`
                : null}
            </style>
          </InputContainer>
        ) : null}

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
  }
);

EditShorthandCaptureModel.displayName = 'EditShorthandCaptureModel';
