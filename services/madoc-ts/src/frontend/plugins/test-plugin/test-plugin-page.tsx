import React from 'react';
import { serverRendererFor } from '../../shared/plugins/external/server-renderer-for';
import { PluginPageComponent } from '../../shared/plugins/external/types';

export const TestPluginPage: PluginPageComponent<{ test: string }> = ({ hooks, loader }) => {
  const { Button } = hooks.useAtoms();
  const { data } = loader.useData();

  return (
    <div>
      <Button>Test button</Button>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

serverRendererFor(TestPluginPage, {
  getKey: (params: { test: string }, query: { page?: number }, pathname) => {
    return ['test', { shouldFindThis: 'testing' }];
  },
  getData: async (key, vars, api, pathname) => {
    return { test: 'testing' };
  },
});
