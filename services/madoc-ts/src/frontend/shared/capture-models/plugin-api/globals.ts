import { PluginStore } from '../types/plugin-store';

declare global {
  // @ts-ignore
  export let $$captureModelGlobalStore: PluginStore;
}

const bootstrapGlobalStore: () => PluginStore = () => {
  const globalVar = globalThis as any;

  if (!globalVar.$$captureModelGlobalStore) {
    globalVar.$$captureModelGlobalStore = {
      fields: {},
      contentTypes: {},
      selectors: {},
      refinements: [],
    };
  }

  return globalVar.$$captureModelGlobalStore;
};

export const pluginStore = bootstrapGlobalStore();
