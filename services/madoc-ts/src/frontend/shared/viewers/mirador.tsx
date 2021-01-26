// @ts-nocheck
import React, { useEffect, useMemo } from 'react';
import { Provider } from 'react-redux';
import deepmerge from 'deepmerge';
import HotApp from 'mirador/dist/cjs/src/components/App';
import createStore from 'mirador/dist/cjs/src/state/createStore';
import { importConfig } from 'mirador/dist/cjs/src/state/actions/config';
import {
  filterValidPlugins,
  getConfigFromPlugins,
  getReducersFromPlugins,
  getSagasFromPlugins,
} from 'mirador/dist/cjs/src/extend/pluginPreprocessing';
import { miradorImageToolsPlugin } from 'mirador-image-tools';

const Mirador: React.FC<{ config: any; viewerConfig: any; maximised?: string }> = ({
  config = {},
  viewerConfig = miradorImageToolsPlugin,
}) => {
  const plugins = useMemo(() => filterValidPlugins(viewerConfig.plugins || []), [viewerConfig.plugins]);
  const store = useMemo(
    () => viewerConfig.store || createStore(getReducersFromPlugins(plugins), getSagasFromPlugins(plugins)),
    [plugins, viewerConfig.store]
  );

  useEffect(() => {
    store.dispatch(importConfig(deepmerge(getConfigFromPlugins(plugins), config)));
  }, []);

  return (
    <Provider store={store}>
      <HotApp plugins={plugins} dndManager={false} />
    </Provider>
  );
};

export default Mirador;
