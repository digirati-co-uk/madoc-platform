import { QueryComponent, UniversalRoute } from '../types';
import React, { useContext, useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { SSRContext } from './index';
import { parse } from 'query-string';
import { ApiClient } from '../../gateway/api';
import { PaginatedQueryResult, QueryOptions, QueryResult, usePaginatedQuery, useQuery } from 'react-query';
import { useApi } from './hooks/use-api';


export function createUniversalComponent<
  Definition extends { query: any; params: any; variables: any; data: any },
  GetData = (key: string, vars: Definition['variables'], api: ApiClient) => Promise<Definition['data']>,
  GetKey = (params: Definition['params'], query: Definition['query']) => [string, Definition['variables']]
>(
  Component: React.FC<{ route: UniversalRoute }>,
  options: {
    getKey?: GetKey;
    getData?: GetData;
  }
): QueryComponent<Definition['data'], string, Definition['variables'], Definition['params'], Definition['query']> {
  const ReturnComponent: any = Component;
  ReturnComponent.displayName = 'PageComponent';
  ReturnComponent.getKey = options.getKey;
  ReturnComponent.getData = options.getData;
  return ReturnComponent;
}

export function useLocationQuery<T = any>() {
  const location = useLocation();

  return useMemo(() => {
    return (location.search ? parse(location.search) : {}) as any;
  }, [location]) as T;
}

function getSsrData(ssr: any, inputKey: any, inputVars: any, config: any) {
  if (!ssr || !inputKey) {
    return config || {};
  }

  const hash = JSON.stringify({ key: inputKey, vars: inputVars });

  if (ssr[hash]) {
    const { data } = ssr[hash];
    return {
      initialData: data,
      ...(config || {}),
    };
  }

  return config || {};
}

export function useData<Data = any, TKey = any, TVariables = any>(
  component: QueryComponent<Data, TKey, TVariables>,
  vars: Partial<TVariables> = {},
  config?: QueryOptions<Data>
): QueryResult<Data> {
  const ssr = useContext(SSRContext);
  const api = useApi();
  const params = useParams();
  const query = useLocationQuery();

  const [key, initialVars = {}] = component.getKey ? component.getKey(params, query) || [] : [];

  const newVars = { ...initialVars, ...vars };

  return useQuery(
    [key, newVars] as any,
    [api],
    component.getData ? (component.getData as any) : () => null,
    getSsrData(ssr, key, newVars, config)
  );
}

export function usePaginatedData<Data = any, TKey = any, TVariables = any>(
  component: QueryComponent<Data, TKey, TVariables>,
  vars: Partial<TVariables> = {},
  config?: QueryOptions<Data>
): PaginatedQueryResult<Data> {
  const ssr = useContext(SSRContext);
  const api = useApi();
  const params = useParams();
  const query = useLocationQuery();

  const [key, initialVars = {}] = component.getKey ? component.getKey(params, query) || [] : [];

  const newVars = { ...initialVars, ...vars };

  return usePaginatedQuery(
    [key, newVars] as any,
    [api],
    component.getData ? (component.getData as any) : () => null,
    getSsrData(ssr, key, newVars, config)
  );
}
