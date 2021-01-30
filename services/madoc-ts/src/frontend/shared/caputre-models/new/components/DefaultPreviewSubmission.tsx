import React from 'react';
import { EditorSlots } from './EditorSlots';

export const DefaultPreviewSubmission: React.FC = () => {
  return (
    <EditorSlots.Provider config={{ allowEditing: false }}>
      <EditorSlots.TopLevelEditor />
    </EditorSlots.Provider>
  );
};
