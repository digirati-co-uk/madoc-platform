import { QueryConfig } from 'react-query';
import { ManifestFull } from '../../../types/schemas/manifest-full';
import { usePaginatedData, useStaticData } from '../../shared/hooks/use-data';
import { ManifestLoader } from '../pages/loaders/manifest-loader';
import { useRouteContext } from './use-route-context';

export function useManifest(config?: QueryConfig<any>) {
  const { manifestId } = useRouteContext();
  return useStaticData<ManifestFull>(ManifestLoader, undefined, {
    enabled: !!manifestId,
    keepPreviousData: true,
    ...(config || {}),
  });
}

export function usePaginatedManifest(config?: QueryConfig<any>) {
  const { manifestId } = useRouteContext();
  return usePaginatedData(ManifestLoader, undefined, {
    enabled: !!manifestId,
    keepPreviousData: true,
    ...(config || {}),
  });
}
