import { QueryComponent } from '../../types';
import { PaginatedQueryResult, QueryOptions, QueryResult, usePaginatedQuery, useQuery } from 'react-query';
import { useContext } from 'react';
import { useApi } from './use-api';
import { useParams } from 'react-router-dom';
import { useLocationQuery } from './use-location-query';
import { SSRContext } from '../components/SSRContext';

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

export function useStaticData<Data = any, TKey = any, TVariables = any>(
  component: QueryComponent<Data, TKey, TVariables>,
  vars: Partial<TVariables> = {},
  config: QueryOptions<Data> = {}
): QueryResult<Data> {
  return useData<Data, TKey, TVariables>(component, vars, {
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    ...config,
  });
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
