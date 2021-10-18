import React, { useMemo } from 'react';
import { Pagination } from '../../../../types/schemas/_pagination';
import { ApiArgs, apiHooks } from '../../../shared/hooks/use-api-query';
import { AutoSlotLoader } from '../../../shared/page-blocks/auto-slot-loader';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { UniversalComponent } from '../../../types';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { CollectionFull } from '../../../../types/schemas/collection-full';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
import { ManifestFull } from '../../../../types/schemas/manifest-full';
import { useParams } from 'react-router-dom';
import { useRouteContext } from '../../hooks/use-route-context';
import { CollectionLoaderType } from './collection-loader';

export type ManifestLoaderType = {
  params: { manifestId: string; collectionId?: string; slug?: string };
  query: { m: string; filter: string };
  variables: ApiArgs<'getSiteManifest'>;
  data: ManifestFull;
  context: Partial<CollectionLoaderType['context']> & {
    collection: CollectionFull['collection'];
    pagination: Pagination;
  };
};

export const ManifestLoader: UniversalComponent<ManifestLoaderType> = createUniversalComponent<ManifestLoaderType>(
  ({ route, collection, ...props }) => {
    const { projectId } = useRouteContext();
    const { manifestId: id, slug } = useParams<{ manifestId: string; slug: string }>();
    const { resolvedData: data, refetch: refetchManifest } = usePaginatedData(ManifestLoader, [], {
      cacheTime: projectId ? 0 : 3600,
    });

    const { data: projectTasks, refetch: refetchManifestTasks } = apiHooks.getSiteProjectManifestTasks(
      () => (slug ? [slug, Number(id)] : undefined),
      {
        refetchOnMount: true,
      }
    );

    const ctx = useMemo(() => (data ? { id: data.manifest.id, name: data.manifest.label } : undefined), [data]);

    return (
      <AutoSlotLoader>
        <BreadcrumbContext manifest={ctx}>
          {renderUniversalRoutes(route.routes, {
            ...props,
            manifest: data?.manifest,
            pagination: data?.pagination,
            collection,
            manifestSubjects: data?.subjects,
            manifestTask: projectTasks?.manifestTask,
            manifestUserTasks: projectTasks?.userTasks,
            canUserSubmit: projectTasks?.canUserSubmit,
            refetchManifestTasks,
            refetchManifest,
          })}
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
