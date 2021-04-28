import { QueryConfig } from 'react-query';
import { usePaginatedData } from '../../shared/hooks/use-data';
import { CollectionLoader } from '../pages/loaders/collection-loader';
import { useRouteContext } from './use-route-context';

export function usePaginatedCollection(config: QueryConfig<any> = {}) {
  const { collectionId } = useRouteContext();
  return usePaginatedData(CollectionLoader, undefined, {
    enabled: !!collectionId,
    ...config,
  });
}
