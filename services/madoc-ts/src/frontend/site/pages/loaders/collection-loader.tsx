import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { ApiArgs } from '../../../shared/hooks/use-api-query';
import { AutoSlotLoader } from '../../../shared/page-blocks/auto-slot-loader';
import { createUniversalComponent } from '../../../shared/utility/create-universal-component';
import { UniversalComponent } from '../../../types';
import { usePaginatedData } from '../../../shared/hooks/use-data';
import { BreadcrumbContext } from '../../blocks/Breadcrumbs';
import { CollectionFull } from '../../../../types/schemas/collection-full';
import { ItemNotFound } from '../Item-not-found';

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
export type CollectionLoaderType = {
  params: { collectionId: string; slug?: string; manifest?: string; canvas?: string };
  query: { c: string; filter?: string };
  variables: ApiArgs<'getSiteCollection'>;
  data: CollectionFull;
};

export const CollectionLoader: UniversalComponent<CollectionLoaderType> = createUniversalComponent<
  CollectionLoaderType
>(
  () => {
    const { resolvedData: data, status } = usePaginatedData(CollectionLoader, [], {
      cacheTime: 3600,
    });

    const ctx = useMemo(() => (data ? { id: data.collection.id, name: data.collection.label } : undefined), [data]);

    if (data?.collection.source === 'not-found' || status === 'error') {
      return (
        <AutoSlotLoader>
          <BreadcrumbContext collection={ctx}>
            <ItemNotFound />
          </BreadcrumbContext>
        </AutoSlotLoader>
      );
    }

    return (
      <AutoSlotLoader>
        <BreadcrumbContext collection={ctx}>
          <Outlet />
        </BreadcrumbContext>
      </AutoSlotLoader>
    );
  },
  {
    getKey: (params, query) => {
      const [collectionId, ...parentCollectionIds] = (params.collectionId || '').split(',');

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
