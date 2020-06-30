import React, { useMemo } from 'react';
import { Pagination } from '../../../../types/schemas/_pagination';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { useData, usePaginatedData } from '../../../shared/hooks/use-data';
import { LocaleString } from '../../../shared/components/LocaleString';
import { BreadcrumbContext, DisplayBreadcrumbs } from '../../../shared/components/Breadcrumbs';

/**
 * Collection loader.
 *
 * The routes this will be under:
 * - /collections/:id
 * - /projects/:slug/collections/:id
 *
 * The collection id in each of these _may_ be an array of collections. This component will
 * load each of those collections, and ensure that it is a valid path and the collection does
 * appear in the collection. Unknown if this is a single API call.
 *
 * It will return parameters to it's sub-routes. At least:
 * - collectionId - the collection subject
 * - parentCollections - a list of parent collections
 * - collection - The collection itself
 *
 * Possibly:
 * - links - a helper for generating links
 */
type CollectionLoaderType = {
  params: { id: string; slug?: string; manifest?: string; canvas?: string };
  query: { c: string };
  variables: { id: number; parentCollectionIds: number[]; projectId?: string | number; page: number };
  data: { collection: any; pagination: Pagination };
};

const links = {
  collection(collectionIds: number[], projectId?: number) {
    if (projectId) {
      return `/projects/${projectId}/collections/${collectionIds.join(',')}`;
    }
    return `/collections/${collectionIds.join(',')}`;
  },
  manifest(manifestId: number, collectionIds: number[], projectId?: number) {
    if (projectId) {
      return `/projects/${projectId}/collections/${collectionIds.join(',')}/manifests/${manifestId}`;
    }
    return `/collections/${collectionIds.join(',')}/manifests/${manifestId}`;
  },
};

export const CollectionLoader: UniversalComponent<CollectionLoaderType> = createUniversalComponent<
  CollectionLoaderType
>(
  ({ route, ...props }) => {
    const { resolvedData: data, latestData } = usePaginatedData(
      CollectionLoader,
      {},
      { refetchOnMount: false, refetchInterval: false, refetchOnWindowFocus: false }
    );

    const ctx = useMemo(() => (data ? { id: data.collection.id, name: data.collection.label } : undefined), [data]);

    if (!data) {
      return <DisplayBreadcrumbs />;
    }

    return (
      <BreadcrumbContext collection={ctx}>
        {renderUniversalRoutes(route.routes, {
          ...props,
          collection: data.collection,
          pagination: latestData ? latestData.pagination : undefined,
        })}
      </BreadcrumbContext>
    );
  },
  {
    getKey: (params, query) => {
      const [collectionId, ...parentCollectionIds] = params.id.split(',');

      return [
        'public-collection',
        {
          id: Number(collectionId),
          page: Number(query.c) || 0,
          parentCollectionIds: parentCollectionIds.map(n => Number(n)),
          projectId: params.slug,
          links,
        },
      ];
    },
    getData: (key, vars, api) => {
      return api.getSiteCollection(vars.id, { page: vars.page, project_id: vars.projectId });
    },
  }
);
