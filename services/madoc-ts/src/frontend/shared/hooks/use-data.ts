import { useMemo } from 'react';
import { QueryComponent } from '../../types';
import { PaginatedQueryResult, QueryConfig, QueryResult, usePaginatedQuery, useQuery } from 'react-query';
import { useSlots } from '../page-blocks/slot-context';
import { useApi } from './use-api';
import { useParams } from 'react-router-dom';
import { useLocationQuery } from './use-location-query';

export function useData<Data = any, TKey = any, TVariables = any>(
  component: QueryComponent<Data, TKey, TVariables>,
  vars: Partial<TVariables> = {},
  config?: QueryConfig<Data, any>
): QueryResult<Data> {
  const api = useApi();
  const routeParams = useParams();
  const { context } = useSlots();
  const query = useLocationQuery();
  const params = useMemo(() => {
    const paramsToReturn: any = { ...routeParams };

    if (context.collection) {
      paramsToReturn.collectionId = `${context.collection}`;
    }

    if (context.manifest) {
      paramsToReturn.manifestId = `${context.manifest}`;
    }

    if (context.project) {
      paramsToReturn.slug = `${context.project}`;
    }

    if (context.canvas) {
      paramsToReturn.canvasId = `${context.canvas}`;
    }

    return paramsToReturn;
  }, [context, routeParams]);

  const [key, initialVars = {}] = component.getKey ? component.getKey(params, query) || [] : [];

  const newVars = Array.isArray(initialVars) ? initialVars : { ...initialVars, ...vars };

  return useQuery(
    [key, newVars] as any,
    (queryKey: any, queryVars: any) => {
      if (component.getData) {
        return component.getData(queryKey, queryVars, api);
      }
      return undefined as any;
    },
    { refetchOnMount: false, ...(config || {}), useErrorBoundary: true }
  );
}

export function useStaticData<Data = any, TKey = any, TVariables = any>(
  component: QueryComponent<Data, TKey, TVariables>,
  vars: Partial<TVariables> = {},
  config: QueryConfig<Data, any> = { queryKey: undefined }
): QueryResult<Data> {
  return useData<Data, TKey, TVariables>(component, vars, {
    refetchInterval: false,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchIntervalInBackground: false,
    ...config,
  });
}

export function usePaginatedData<Data = any, TKey = any, TVariables = any>(
  component: QueryComponent<Data, TKey, TVariables>,
  vars: Partial<TVariables> = {},
  config?: QueryConfig<Data>
): PaginatedQueryResult<Data> {
  const api = useApi();
  const params = useParams();
  const query = useLocationQuery();

  const [key, initialVars = {}] = component.getKey ? component.getKey(params, query) || [] : [];

  const newVars = Array.isArray(initialVars) ? initialVars : { ...initialVars, ...vars };

  return usePaginatedQuery(
    [key, newVars] as any,
    (queryKey: any, queryVars: any) => {
      if (component.getData) {
        return component.getData(queryKey, queryVars, api);
      }
      return undefined as any;
    },
    { ...(config || {}), useErrorBoundary: true }
  );
}
