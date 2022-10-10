import { blockEditorFor } from '../../../../extensions/page-blocks/block-editor-react';
import React from 'react';
import { Button } from '../../custom-components/Button/Button';

export function FeedbackBtn() {
  return <Button> Something not quite right? Send us feedback</Button>;
}

blockEditorFor(FeedbackBtn, {
  type: 'feedback-button',
  label: 'Feedback Button',
  defaultProps: {},
  editor: {},
});
