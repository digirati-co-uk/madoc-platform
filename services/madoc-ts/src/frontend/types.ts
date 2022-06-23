import React from 'react';
import { RouteObject } from 'react-router-dom';
import { ApiClient } from '../gateway/api';
import { AdditionalHooks } from './shared/hooks/use-api-query';
import { MadocTheme } from './themes/definitions/types';

export type CreateRouteType = {
  routes: RouteObject[];
  baseRoute: RouteObject;
  fallback: RouteObject;
};

export type UniversalComponent<
  Definition extends {
    data?: any;
    query?: any;
    params?: any;
    variables?: any;
    context?: any;
  }
> = React.FC & {
  getData?: (
    key: string,
    vars: Definition['variables'],
    api: ApiClient,
    pathname: string
  ) => Promise<Definition['data']>;
  getKey?: (
    params: Definition['params'],
    query: Definition['query'],
    pathname: string
  ) => [string, Definition['variables']];
  hooks?: AdditionalHooks<Definition['params'], Definition['query']>[];
  theme?: { name: string } & Partial<MadocTheme>;
};

export type QueryComponent<Data = any, TKey = any, TVariables = any, Params = any, Query = any> = React.FC<any> & {
  getKey?: (params: Params, query: Query, pathname: string) => [TKey, TVariables];
  getData?: (key: TKey, vars: TVariables, api: ApiClient, pathname: string) => Promise<Data>;
  hooks?: AdditionalHooks<Params, Query>[];
  theme?: { name: string } & Partial<MadocTheme>;
};
