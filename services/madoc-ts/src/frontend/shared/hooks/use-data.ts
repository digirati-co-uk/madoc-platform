import { useMemo } from 'react';
import { InfiniteQueryConfig } from 'react-query/types/core/types';
import { EditorialContext } from '../../../types/schemas/site-page';
import { QueryComponent } from '../../types';
import {
  InfiniteQueryResult,
  PaginatedQueryResult,
  QueryConfig,
  QueryResult,
  useInfiniteQuery,
  usePaginatedQuery,
  useQuery,
  useQueryCache,
} from 'react-query';
import { useSlots } from '../page-blocks/slot-context';
import { useApi } from './use-api';
import { useLocation, useParams } from 'react-router-dom';
import { useLocationQuery } from './use-location-query';

export function usePrefetchData<Data = any, TKey = any, TVariables = any>(
  component: QueryComponent<Data, TKey, TVariables>
) {
  const api = useApi();
  const routeParams = useParams();
  const { context } = useSlots();
  const query = useLocationQuery();
  const { pathname } = useLocation();
  const cache = useQueryCache();
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

  async function prefetch(vars: Partial<TVariables>, slot?: EditorialContext) {
    const getKey = component.getKey;
    const getData = component.getData;
    if (!getKey || !getData) {
      return;
    }

    const [key, initialVars = {}] = component.getKey ? component.getKey(params, query, pathname) || [] : [];

    const newVars = Array.isArray(initialVars) ? vars || initialVars : { ...initialVars, ...vars };

    await Promise.all([
      cache.prefetchQuery([key, newVars] as any, (queryKey: any, queryVars: any) => {
        return getData(queryKey, queryVars, api, pathname);
      }),
      slot
        ? cache.prefetchQuery(['slot-request', slot], () => {
            return api.pageBlocks.requestSlots(slot);
          })
        : null,
    ]);
  }

  return prefetch;
}

export function useData<Data = any, TKey = any, TVariables = any>(
  component: QueryComponent<Data, TKey, TVariables>,
  vars: Partial<TVariables> = {},
  config?: QueryConfig<Data, any>
): QueryResult<Data> {
  const api = useApi();
  const routeParams = useParams();
  const { context } = useSlots();
  const query = useLocationQuery();
  const { pathname } = useLocation();

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

  const [key, initialVars = {}] = component.getKey ? component.getKey(params, query, pathname) || [] : [];

  const newVars = Array.isArray(initialVars) ? initialVars : { ...initialVars, ...vars };

  return useQuery(
    [key, newVars] as any,
    (queryKey: any, queryVars: any) => {
      if (component.getData) {
        return component.getData(queryKey, queryVars, api, pathname);
      }
      return undefined as any;
    },
    { refetchOnMount: false, cacheTime: 1000 * 60 * 60, ...(config || {}), useErrorBoundary: true }
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
  const { pathname } = useLocation();

  const [key, initialVars = {}] = component.getKey ? component.getKey(params, query, pathname) || [] : [];

  const newVars = Array.isArray(initialVars) ? initialVars : { ...initialVars, ...vars };

  return usePaginatedQuery(
    [key, newVars] as any,
    (queryKey: any, queryVars: any) => {
      if (component.getData) {
        return component.getData(queryKey, queryVars, api, pathname);
      }
      return undefined as any;
    },
    { ...(config || {}), useErrorBoundary: true }
  );
}

export function useInfiniteData<Data = any, TKey = any, TVariables = any>(
  component: QueryComponent<Data, TKey, TVariables>,
  vars: Partial<TVariables> = {},
  config?: InfiniteQueryConfig<Data>
): InfiniteQueryResult<Data> {
  const api = useApi();
  const params = useParams();
  const query = useLocationQuery();
  const { pathname } = useLocation();

  const [key, initialVars = {}] = component.getKey ? component.getKey(params, query, pathname) || [] : [];

  const newVars = Array.isArray(initialVars) ? initialVars : { ...initialVars, ...vars };

  const potentialReturn = useInfiniteQuery(
    [key, newVars] as any,
    (queryKey: any, queryVars: any, extraVars: any) => {
      const combinedVars: any = { ...(queryVars || {}), ...(extraVars || {}) };
      if (component.getData) {
        return component.getData(queryKey, combinedVars, api, pathname);
      }
      return undefined as any;
    },
    { ...(config || {}), useErrorBoundary: true, keepPreviousData: true }
  );

  if (potentialReturn.data && !Array.isArray(potentialReturn.data)) {
    potentialReturn.canFetchMore = true;
    const allPages = [potentialReturn.data];
    if (config?.getFetchMore) {
      potentialReturn.canFetchMore = typeof config.getFetchMore(potentialReturn.data, allPages) !== 'undefined';
    }
    potentialReturn.data = allPages;
  }

  return potentialReturn;
}
