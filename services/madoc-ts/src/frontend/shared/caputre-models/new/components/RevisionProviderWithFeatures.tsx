import { Revisions } from '@capture-models/editor';
import React from 'react';
import { AutoSelectingRevision } from '../features/AutoSelectingRevision';
import { CorrectingRevisionSubtree } from '../features/CorrectingRevisionSubtree';
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
      {autoSelectingRevision ? <AutoSelectingRevision /> : null}
      <CorrectingRevisionSubtree />
      <EditorSlots.Provider config={editor} components={components}>
        {children}
      </EditorSlots.Provider>
    </Revisions.Provider>
  );
};
