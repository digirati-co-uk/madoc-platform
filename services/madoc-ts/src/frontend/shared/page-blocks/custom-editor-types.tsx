import { PluginContext, pluginStore } from '@capture-models/plugin-api';
import { PluginStore } from '@capture-models/types';
import React, { useMemo } from 'react';
import { specification as mediaExplorer } from '../../../extensions/capture-models/MediaExplorer/index';

export const CustomEditorTypes: React.FC = ({ children }) => {
  const customStore: PluginStore = useMemo(() => {
    return {
      ...pluginStore,
      fields: {
        ...pluginStore.fields,
        // Custom fields.
        [mediaExplorer.type]: mediaExplorer,
      },
    };
  }, []);

  return <PluginContext.Provider value={customStore}>{children}</PluginContext.Provider>;
};
