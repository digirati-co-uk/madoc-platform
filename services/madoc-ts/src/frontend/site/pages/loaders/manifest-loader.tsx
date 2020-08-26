import React, { useMemo } from 'react';
import { Pagination } from '../../../../types/schemas/_pagination';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { CollectionFull } from '../../../../types/schemas/collection-full';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext, DisplayBreadcrumbs } from '../../../shared/components/Breadcrumbs';
import { ManifestFull } from '../../../../types/schemas/manifest-full';

type ManifestLoaderType = {
  params: { id: string; collectionId?: string; slug?: string };
  query: { m: string; filter: string };
  variables: {
    id: number;
    collectionId?: number[];
    projectId?: string | number;
    page: number;
    filter: string | undefined;
  };
  data: ManifestFull;
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
    const { resolvedData: data } = usePaginatedData(
      ManifestLoader,
      {},
      { refetchOnMount: false, refetchInterval: false, refetchOnWindowFocus: false }
    );

    const ctx = useMemo(() => (data ? { id: data.manifest.id, name: data.manifest.label } : undefined), [data]);

    if (!data) {
      return <DisplayBreadcrumbs />;
    }

    return (
      <BreadcrumbContext manifest={ctx}>
        {renderUniversalRoutes(route.routes, {
          ...props,
          manifest: data ? data.manifest : undefined,
          pagination: data ? data.pagination : undefined,
          collection,
          manifestSubjects: data ? data.subjects : undefined,
        })}
      </BreadcrumbContext>
    );
  },
  {
    getKey: (params, query) => {
      return [
        'site-manifest',
        {
          id: Number(params.id),
          page: Number(query.m) || 0,
          projectId: params.slug,
          filter: query.filter,
        },
      ];
    },
    getData: (key, vars, api) => {
      return api.getSiteManifest(vars.id, { page: vars.page, project_id: vars.projectId, hide_status: vars.filter });
    },
  }
);
