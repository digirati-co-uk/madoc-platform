import React from 'react';
import { DefaultInlineProperties } from './DefaultInlineProperties';
import { EditorRenderingConfig } from './EditorSlots';

export const SegmentationInlineProperties: EditorRenderingConfig['InlineProperties'] = props => {
  if (props.type === 'field' && !props.hasSelector) {
    return null;
  }

  return <DefaultInlineProperties {...props} />;
};
