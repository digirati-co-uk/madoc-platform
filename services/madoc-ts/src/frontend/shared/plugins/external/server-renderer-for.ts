import React from 'react';
import { ApiClient } from '../../../../gateway/api';

export function serverRendererFor<TVariables = any, Data = any>(
  component: React.FC<any>,
  config: {
    getKey?: (params: any, query: any, pathname: string) => [string, TVariables];
    getData?: (key: string, vars: TVariables, api: ApiClient, pathname: string) => Promise<Data>;
  }
) {
  (component as any).getKey = config.getKey;
  (component as any).getData = config.getData;
}
