import React from 'react';
import { EditorToolbar as OriginalEditorToolbar } from '../../../frontend/shared/atoms/EditorToolbar';

export type Props = {
  // Add props in here.
};

/**
 * @uxpincomponent
 */
function EditorToolbar(props: Props) {
  return <OriginalEditorToolbar {...props} />;
}

export default EditorToolbar;