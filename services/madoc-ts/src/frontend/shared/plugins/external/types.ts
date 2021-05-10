import React from 'react';
import { QueryResult } from 'react-query';
import { hooks } from '../hooks';
import { loaders } from '../loaders';

type UseDataHooks<T, Other> = T extends never
  ? Other
  : {
      useData: () => QueryResult<T>;
    } & Other;

export type PluginPageComponent<T = never> = React.FC<{
  hooks: typeof hooks;
  loader: UseDataHooks<T, typeof loaders>;
}>;
