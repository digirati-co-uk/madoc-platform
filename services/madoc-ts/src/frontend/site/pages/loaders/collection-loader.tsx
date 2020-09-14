import React, { useMemo } from 'react';
import { ApiArgs } from '../../../shared/hooks/use-api-query';
import { renderUniversalRoutes } from '../../../shared/utility/server-utils';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../../shared/components/Breadcrumbs';
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
  variables: ApiArgs<'getSiteCollection'>;
  data: CollectionFull;
};

export const CollectionLoader: UniversalComponent<CollectionLoaderType> = createUniversalComponent<
  CollectionLoaderType
>(
  ({ route, ...props }) => {
    const { resolvedData: data, latestData } = usePaginatedData(CollectionLoader, [], {
      cacheTime: 3600,
    });

    const ctx = useMemo(() => (data ? { id: data.collection.id, name: data.collection.label } : undefined), [data]);

    return (
      <BreadcrumbContext collection={ctx}>
        {renderUniversalRoutes(route.routes, {
          ...props,
          collection: data?.collection,
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
        'getSiteCollection',
        [
          Number(collectionId),
          {
            page: Number(query.c) || 1,
            parent_collections: parentCollectionIds.map(n => Number(n)),
            project_id: params.slug,
            hide_status: query.filter,
          },
        ],
      ];
    },
    getData: (key, vars, api) => {
      return api.getSiteCollection(...vars);
    },
  }
);
