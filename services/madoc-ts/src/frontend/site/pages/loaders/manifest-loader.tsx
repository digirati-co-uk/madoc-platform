import React, { useMemo } from 'react';
import { ApiArgs } from '../../../shared/hooks/use-api-query';
import { AutoSlotLoader } from '../../../shared/page-blocks/auto-slot-loader';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { ManifestFull } from '../../../../types/schemas/manifest-full';
import { Outlet } from 'react-router-dom';
import { usePaginatedManifest } from '../../hooks/use-manifest';
import { useRouteContext } from '../../hooks/use-route-context';
import { ItemNotFound } from '../Item-not-found';

export type ManifestLoaderType = {
  params: { manifestId: string; collectionId?: string; slug?: string };
  query: { m: string; filter: string };
  variables: ApiArgs<'getSiteManifest'>;
  data: ManifestFull;
};

export const ManifestLoader: UniversalComponent<ManifestLoaderType> = createUniversalComponent<ManifestLoaderType>(
  function ManifestLoader() {
    const { projectId } = useRouteContext();
    const { resolvedData: data, isError } = usePaginatedManifest({
      cacheTime: projectId ? 0 : 3600,
    });

    const ctx = useMemo(() => (data ? { id: data.manifest.id, name: data.manifest.label } : undefined), [data]);

    if (data?.manifest.source === 'not-found' || isError) {
      return (
        <AutoSlotLoader>
          <BreadcrumbContext manifest={ctx}>
            <ItemNotFound />
          </BreadcrumbContext>
        </AutoSlotLoader>
      );
    }

    return (
      <AutoSlotLoader>
        <BreadcrumbContext manifest={ctx}>
          <Outlet />
        </BreadcrumbContext>
      </AutoSlotLoader>
    );
  },
  {
    hooks: [
      {
        name: 'getSiteMetadataConfiguration',
        creator: params => [
          {
            project_id: params.slug,
            collection_id: params.collectionId ? Number(params.collectionId) : undefined,
          },
        ],
      },
      {
        name: 'getSiteProjectManifestTasks',
        creator: params => (params.slug ? [params.slug, Number(params.manifestId)] : undefined),
      },
    ],
    getKey: (params, query) => {
      return [
        'getSiteManifest',
        [
          Number(params.manifestId),
          {
            page: Number(query.m) || 0,
            project_id: params.slug,
            hide_status: query.filter,
          },
        ],
      ];
    },
    getData: async (key, vars, api) => {
      return api.getSiteManifest(...vars);
    },
  }
);
