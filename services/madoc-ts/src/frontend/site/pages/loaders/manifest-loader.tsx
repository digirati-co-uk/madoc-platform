import React from 'react';
import { Pagination } from '../../../../types/schemas/_pagination';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { CollectionFull } from '../../../../types/schemas/collection-full';
import { usePaginatedData } from '../../../shared/hooks/use-data';

type ManifestLoaderType = {
  params: { id: string; collectionId?: string; projectId?: string };
  query: { m: string };
  variables: { id: number; collectionId?: number[]; projectId?: string | number; page: number };
  data: { manifest: any; pagination: Pagination };
  context: { collection: CollectionFull['collection'] };
};

const createLinks = (params: ManifestLoaderType['variables']) => ({
  collection(collectionId?: number) {
    if (!collectionId) {
      return null;
    }
    if (params.projectId) {
      return `/projects/${params.projectId}/collections/${collectionId}`;
    }
    return `/collections/${collectionId}`;
  },
  manifest(manifestId: number) {
    if (params.projectId && params.collectionId) {
      return `/projects/${params.projectId}/collections/${params.collectionId.join(',')}/manifests/${manifestId}`;
    }
    if (params.collectionId) {
      return `/collections/${params.collectionId.join(',')}/manifests/${manifestId}`;
    }
    return `/manifests/${manifestId}`;
  },
  canvas(canvasId: number) {
    if (params.projectId && params.collectionId) {
      return `/projects/${params.projectId}/collections/${params.collectionId.join(',')}/manifests/${
        params.id
      }/c/${canvasId}`;
    }
    if (params.collectionId) {
      return `/collections/${params.collectionId.join(',')}/manifests/${params.id}/c/${canvasId}`;
    }
    return `/manifests/${params.id}/c/${canvasId}`;
  },
});

export const ManifestLoader: UniversalComponent<ManifestLoaderType> = createUniversalComponent<ManifestLoaderType>(
  ({ route, collection, ...props }) => {
    const { latestData: data, resolvedData } = usePaginatedData(
      ManifestLoader,
      {},
      { refetchOnMount: false, refetchInterval: false, refetchOnWindowFocus: false }
    );

    if (!resolvedData) {
      return <>Loading..</>;
    }

    return (
      <>
        {renderUniversalRoutes(route.routes, {
          ...props,
          manifest: data ? data.manifest : resolvedData.manifest,
          pagination: resolvedData ? resolvedData.pagination : undefined,
          collection,
        })}
      </>
    );
  },
  {
    getKey: (params, query) => {
      return [
        'site-manifest',
        {
          id: Number(params.id),
          page: Number(query.m) || 0,
          projectId: params.projectId,
          // collectionId: params.collectionId,
        },
      ];
    },
    getData: (key, vars, api) => {
      return api.getSiteManifest(vars.id, { page: vars.page, project_id: vars.projectId });
    },
  }
);
