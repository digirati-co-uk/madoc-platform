// @ts-nocheck
import React, { useEffect, useMemo, useRef } from 'react';
import { Provider } from 'react-redux';
import deepmerge from 'deepmerge';
import HotApp from 'mirador/dist/cjs/src/components/App';
import createStore from 'mirador/dist/cjs/src/state/createStore';
import { importConfig } from 'mirador/dist/cjs/src/state/actions/config';
import { setCanvas } from 'mirador/dist/cjs/src/state/actions/canvas';
import {
  filterValidPlugins,
  getConfigFromPlugins,
  getReducersFromPlugins,
  getSagasFromPlugins,
} from 'mirador/dist/cjs/src/extend/pluginPreprocessing';
import { miradorImageToolsPlugin } from 'mirador-image-tools';

const Mirador: React.FC<{
  config: any;
  viewerConfig: any;
  maximised?: string;
  canvasId?: string;
  onChangeCanvas?: (manifest: string, canvas: string) => void;
  onChangeManifest?: (manifest: string) => void;
}> = ({ config = {}, viewerConfig = miradorImageToolsPlugin, onChangeCanvas, onChangeManifest, canvasId }) => {
  const plugins = useMemo(() => filterValidPlugins(viewerConfig.plugins || []), [viewerConfig.plugins]);
  const store = useMemo(
    () => viewerConfig.store || createStore(getReducersFromPlugins(plugins), getSagasFromPlugins(plugins)),
    [plugins, viewerConfig.store]
  );
  const previousState = useRef();

  useEffect(() => {
    store.dispatch(importConfig(deepmerge(getConfigFromPlugins(plugins), config)));
  }, []);

  useEffect(() => {
    if (canvasId) {
      const state = store.getState();
      const newWindow = state.windows['window-1'];
      if (newWindow.canvasId !== canvasId) {
        store.dispatch(setCanvas('window-1', canvasId));
      }
    }
  }, [canvasId, store]);

  useEffect(() => {
    if (onChangeManifest || onChangeCanvas) {
      store.subscribe(function() {
        const state = store.getState();
        if (previousState.current) {
          const prevWindow = previousState.current.windows['window-1'];
          const newWindow = state.windows['window-1'];

          // Manifest changed.
          if (onChangeManifest && prevWindow.manifestId !== newWindow.manifestId) {
            onChangeManifest(newWindow.manifestId);
          }

          // Canvas changed.
          if (onChangeCanvas && prevWindow.canvasId !== newWindow.canvasId) {
            onChangeCanvas(newWindow.manifestId, newWindow.canvasId);
          }
        }
        previousState.current = state;
      });
    }
  }, [onChangeCanvas, onChangeManifest, store]);

  return (
    <Provider store={store}>
      <HotApp plugins={plugins} dndManager={false} />
    </Provider>
  );
};

export default Mirador;
