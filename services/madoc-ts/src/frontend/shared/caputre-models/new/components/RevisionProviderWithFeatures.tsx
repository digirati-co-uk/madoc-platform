import { Revisions } from '@capture-models/editor';
import React from 'react';
import { AutosaveRevision } from '../features/AutosaveRevision';
import { AutoSelectingRevision } from '../features/AutoSelectingRevision';
import { CorrectingRevisionSubtree } from '../features/CorrectingRevisionSubtree';
import { SwitchEditMode } from '../features/SwitchEditMode';
import { SwitchFieldAfterRevises } from '../features/SwitchFieldAfterRevises';
import { EditorConfig, EditorRenderingConfig, EditorSlots } from './EditorSlots';

export const RevisionProviderWithFeatures: React.FC<{
  slotConfig?: {
    editor?: Partial<EditorConfig>;
    components?: Partial<EditorRenderingConfig>;
  };
  captureModel?: import('@capture-models/types').CaptureModel | undefined;
  initialRevision?: string | undefined;
  revision?: string | undefined;
  excludeStructures?: boolean | undefined;
  features?: {
    autoSelectingRevision?: boolean;
  };
}> = ({ slotConfig, children, revision, captureModel, excludeStructures, initialRevision, features }) => {
  const { autoSelectingRevision = true } = features || {};
  const { components, editor } = slotConfig || {};

  return (
    <Revisions.Provider
      key={captureModel?.id}
      revision={revision}
      captureModel={captureModel}
      excludeStructures={excludeStructures}
      initialRevision={initialRevision}
    >
      {/*<DebugRevisionSwitcher contributors={captureModel?.contributors} />*/}
      <AutosaveRevision />
      <SwitchFieldAfterRevises />
      <SwitchEditMode />
      {autoSelectingRevision ? <AutoSelectingRevision /> : null}
      <CorrectingRevisionSubtree />
      <EditorSlots.Provider config={editor} components={components}>
        {children}
      </EditorSlots.Provider>
    </Revisions.Provider>
  );
};
