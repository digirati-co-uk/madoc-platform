import { useStaticData } from '../../shared/hooks/use-data';
import { CollectionLoader } from '../pages/loaders/collection-loader';
import { useRouteContext } from './use-route-context';

export function useCollection() {
  const { collectionId } = useRouteContext();
  return useStaticData(CollectionLoader, undefined, { enabled: !!collectionId });
}
