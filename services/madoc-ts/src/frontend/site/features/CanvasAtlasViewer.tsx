import React from 'react';
import { blockEditorFor } from '../../../extensions/page-blocks/block-editor-react';
import { CanvasImageViewer } from './CanvasImageViewer';
import { CanvasViewer } from './CanvasViewer';

export const CanvasAtlasViewer: React.FC<{
  rendering?: 'webgl' | 'canvas';
  tabsTop?: boolean;
  borderColor?: string;
  tabsText?: boolean;
  sidebarHeading?: boolean;
}> = ({ rendering = 'canvas', tabsTop, borderColor, tabsText, sidebarHeading }) => {

  return (
    <CanvasViewer border={borderColor} sidebarHeading={sidebarHeading} tabsTop={tabsTop} tabsName={tabsText}>
      <CanvasImageViewer rendering={rendering} />
    </CanvasViewer>
  );
};

blockEditorFor(CanvasAtlasViewer, {
  type: 'CanvasAtlasViewer',
  label: 'Atlas canvas viewer + toolbar',
  editor: {
    rendering: {
      label: 'Rendering',
      description: 'Which rendering engine should be used for this viewer',
      type: 'dropdown-field',
      options: [
        { value: 'webgl', text: 'WebGL' },
        { value: 'canvas', text: 'Canvas' },
      ],
    },
    tabsTop: {
      label: 'Tabs position',
      type: 'checkbox-field',
      inlineLabel: 'display tabs on top',
    },
    borderColor: { label: 'Border color', type: 'color-field' },
    tabsText: {
      label: 'Tabs text',
      type: 'checkbox-field',
      inlineLabel: 'show button text for tabs',
    },
    sidebarHeading: {
      label: 'Sidebar heading',
      type: 'checkbox-field',
      inlineLabel: 'show heading text for sidebar',
    },
  },
  defaultProps: {
    rendering: 'webgl',
    tabsTop: false,
    borderColor: '',
    tabsText: false,
    sidebarHeading: false,
  },
  anyContext: ['canvas'],
  requiredContext: ['manifest', 'canvas'],
});
