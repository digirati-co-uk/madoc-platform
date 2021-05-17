import { useStaticData } from '../../shared/hooks/use-data';
import { ManifestLoader } from '../pages/loaders/manifest-loader';
import { useRouteContext } from './use-route-context';

export function useManifest() {
  const { manifestId } = useRouteContext();
  return useStaticData(ManifestLoader, undefined, { enabled: !!manifestId });
}
