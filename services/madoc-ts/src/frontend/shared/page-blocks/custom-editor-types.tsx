import React, { useMemo } from 'react';
import { specification as collectionExplorer } from '../../../extensions/capture-models/CollectionExplorer/index';
import { specification as mediaExplorer } from '../../../extensions/capture-models/MediaExplorer/index';
import { specification as projectExplorer } from '../../../extensions/capture-models/ProjectExplorer/index';
import { specification as manifestCanvasExplorer } from '../../../extensions/capture-models/ManifestCanvasExplorer/index';
import { specification as topicItemExplorer } from '../../../extensions/capture-models/TopicItemExplorer/index';
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
        [collectionExplorer.type]: collectionExplorer,
        [manifestCanvasExplorer.type]: manifestCanvasExplorer,
        [topicItemExplorer.type]: topicItemExplorer,
      },
    };
  }, []);

  return <PluginContext.Provider value={customStore}>{children}</PluginContext.Provider>;
};
