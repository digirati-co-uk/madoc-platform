import React, { useMemo } from 'react';
import { specification as mediaExplorer } from '../../../extensions/capture-models/MediaExplorer/index';
import { specification as projectExplorer } from '../../../extensions/capture-models/ProjectExplorer/index';
import { pluginStore } from '../capture-models/plugin-api/globals';
import { PluginStore } from '../capture-models/types/plugin-store';
import { PluginContext } from '../capture-models/plugin-api/context';

export const CustomEditorTypes: React.FC = ({ children }) => {
  const customStore: PluginStore = useMemo(() => {
    return {
      ...pluginStore,
      fields: {
        ...pluginStore.fields,
        // Custom fields.
        [mediaExplorer.type]: mediaExplorer,
        [projectExplorer.type]: projectExplorer,
      },
    };
  }, []);

  return <PluginContext.Provider value={customStore}>{children}</PluginContext.Provider>;
};
