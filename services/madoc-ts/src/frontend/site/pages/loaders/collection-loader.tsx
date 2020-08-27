import React, { useMemo } from 'react';
import { Pagination } from '../../../../types/schemas/_pagination';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { useData, usePaginatedData } from '../../../shared/hooks/use-data';
import { LocaleString } from '../../../shared/components/LocaleString';
import { BreadcrumbContext, DisplayBreadcrumbs } from '../../../shared/components/Breadcrumbs';
import { CollectionFull } from '../../../../types/schemas/collection-full';

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
  query: { c: string; filter?: string };
  variables: {
    id: number;
    parentCollectionIds: number[];
    filter?: string;
    projectId?: string | number;
    page: number;
  };
  data: CollectionFull;
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
          collectionSubjects: data ? data.subjects : undefined,
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
          filter: query.filter,
        },
      ];
    },
    getData: (key, vars, api) => {
      return api.getSiteCollection(vars.id, { page: vars.page, project_id: vars.projectId, hide_status: vars.filter });
    },
  }
);
