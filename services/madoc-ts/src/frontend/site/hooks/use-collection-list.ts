import { usePaginatedData } from '../../shared/hooks/use-data';
import { CollectionListLoader } from '../pages/loaders/collection-list-loader';

export function useCollectionList() {
  return usePaginatedData(CollectionListLoader);
}
