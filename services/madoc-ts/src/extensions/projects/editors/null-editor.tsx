import React from 'react';
import { EditorRenderingConfig } from '../../../frontend/shared/capture-models/new/components/EditorSlots';

export const nullEditor = {
  metadata: {
    label: 'Null editor',
  },

  editor: {
    sidebar: {
      enabled: true,
      components: {
        TopLevelEditor: () => <div>Top level</div>,
        SubmitButton: () => <div />,
      } as Partial<EditorRenderingConfig>,
    },
    viewer: {
      enabled: true,
      component: () => <div>Viewer</div>,
      controls: () => <div>controls</div>,
    },
  },
  // UI Elements.
};
