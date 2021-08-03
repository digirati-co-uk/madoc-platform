import React from 'react';
import { ApiClient } from '../../../../gateway/api';
import { MadocTheme } from '../../../themes/definitions/types';
import { AdditionalHooks } from '../../hooks/use-api-query';

export function serverRendererFor<TVariables = any, Data = any>(
  component: React.FC<any>,
  config: {
    getKey?: (params: any, query: any, pathname: string) => [string, TVariables];
    getData?: (key: string, vars: TVariables, api: ApiClient, pathname: string) => Promise<Data>;
    hooks?: AdditionalHooks[];
    theme?: { name: string } & Partial<MadocTheme>;
  }
) {
  (component as any).getKey = config.getKey;
  (component as any).getData = config.getData;
  (component as any).hooks = config.hooks;
  (component as any).theme = config.theme;
}
