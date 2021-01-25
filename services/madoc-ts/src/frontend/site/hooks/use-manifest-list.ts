import { usePaginatedData } from '../../shared/hooks/use-data';
import { ManifestListLoader } from '../pages/loaders/manifest-list-loader';

export function useManifestList() {
  return usePaginatedData(ManifestListLoader);
}
