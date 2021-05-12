import { Revisions } from '@capture-models/editor';
import React from 'react';
import { AutosaveRevision } from '../features/AutosaveRevision';
import { AutoSelectingRevision } from '../features/AutoSelectingRevision';
import { CorrectingRevisionSubtree } from '../features/CorrectingRevisionSubtree';
import { SwitchEditMode } from '../features/SwitchEditMode';
import { SwitchFieldAfterRevises } from '../features/SwitchFieldAfterRevises';
import { ContributorProvider } from './ContributorContext';
import { EditorConfig, EditorRenderingConfig, EditorSlots } from './EditorSlots';

export type RevisionProviderFeatures = {
  revisionEditMode?: boolean;
  autosave?: boolean;
  autoSelectingRevision?: boolean;
  directEdit?: boolean;
};

export const RevisionProviderWithFeatures: React.FC<{
  slotConfig?: {
    editor?: Partial<EditorConfig>;
    components?: Partial<EditorRenderingConfig>;
  };
  captureModel?: import('@capture-models/types').CaptureModel | undefined;
  initialRevision?: string | undefined;
  revision?: string | undefined;
  excludeStructures?: boolean | undefined;
  features?: RevisionProviderFeatures;
}> = ({ slotConfig, children, revision, captureModel, excludeStructures, initialRevision, features }) => {
  const { autoSelectingRevision = true, autosave = true, revisionEditMode = true, directEdit = false } = features || {};
  const { components, editor } = slotConfig || {};

  return (
    <ContributorProvider value={captureModel?.contributors || {}}>
      <Revisions.Provider
        key={captureModel?.id}
        revision={revision}
        captureModel={captureModel}
        excludeStructures={excludeStructures}
        initialRevision={initialRevision}
      >
        {/*<DebugRevisionSwitcher contributors={captureModel?.contributors} />*/}
        {autosave ? <AutosaveRevision minutes={2} /> : null}
        {revisionEditMode ? <SwitchFieldAfterRevises /> : null}
        {revisionEditMode ? <SwitchEditMode /> : null}
        {autoSelectingRevision ? <AutoSelectingRevision directEdit={directEdit} /> : null}
        <CorrectingRevisionSubtree />
        <EditorSlots.Provider config={editor} components={components}>
          {children}
        </EditorSlots.Provider>
      </Revisions.Provider>
    </ContributorProvider>
  );
};
