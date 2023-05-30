import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { api } from '../../../gateway/api.server';
import {
  deleteChildIiifDerivedResourceItems,
  deleteChildIiifDerivedResources,
  deleteIiifDerivedResource,
  deleteIiifLinking,
  deleteIiifMetadata,
  deleteIiifResource,
  deleteIiifResourceItem,
  deleteParentIiifDerivedResourceItems,
  getDerivedChildResourceIds,
} from '../../../database/queries/deletion-queries';
import { getResourceLocalSource } from '../../../database/queries/resource-queries';
import { removeIiifFromDisk } from '../../../utility/deletion-utils';
import { buildCollectionDeletionSummary } from './delete-collection-summary';
import { DatabasePoolConnectionType, sql } from 'slonik';
import { deleteManifest } from '../manifests/delete-manifest';

export const deleteCollectionEndpoint: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const collectionId = context.params.id;

  await deleteCollection(collectionId, siteId, () => context.connection, false);

  context.response.status = 204;
};

export async function deleteCollection(
  collectionId: number,
  siteId: number,
  connection: () => DatabasePoolConnectionType,
  recursive: boolean
) {
  const siteApi = api.asUser({ siteId });
  const deletionSummary = await buildCollectionDeletionSummary(collectionId, siteId, connection);

  if (deletionSummary.fullDelete) {
    // Remove collection from all sites

    if (recursive) {
      // Delete derived collections
      const childCollections = await connection().any(getDerivedChildResourceIds(collectionId, 'collection'));
      for (let i = 0; i < childCollections.length; i++) {
        await deleteCollection(childCollections[i].item_id, siteId, connection, true);
      }

      // Delete derived manifests
      const childManifests = await connection().any(getDerivedChildResourceIds(collectionId, 'manifest'));
      for (let i = 0; i < childManifests.length; i++) {
        await deleteManifest(childManifests[i].item_id, siteId, connection);
      }
    }

    if (deletionSummary.tasks > 0 || deletionSummary.parentTasks > 0) {
      try {
        await siteApi.batchDeleteTasks({ resourceId: collectionId, subject: `urn:madoc:collection:${collectionId}` });
      } catch (e) {
        // Some old collections may not be able to delete in batch like this.
        // Leave as no-op. It may result in some lingering tasks.
      }
    }

    if (deletionSummary.search.indexed && deletionSummary.search.id) {
      await siteApi.search.searchDeleteIIIF(deletionSummary.search.id);
    }

    await connection().any(deleteIiifMetadata(collectionId));
    await connection().any(deleteIiifLinking(collectionId));

    // Delete local IIIF file
    const localSource = await connection().maybeOne(getResourceLocalSource(collectionId));
    if (!!localSource && !!localSource.local_source) {
      await removeIiifFromDisk(localSource.local_source);
    }

    // Remove collection from parent collections
    await connection().any(deleteIiifResourceItem(collectionId));
    await connection().any(deleteParentIiifDerivedResourceItems(collectionId));

    // Delete from iiif_derived_resource <- Canvas meta
    await connection().any(deleteIiifDerivedResource(collectionId));

    // Delete from iiif_resource <- Core record
    await connection().any(deleteIiifResource(collectionId));

    await connection().query(sql`select refresh_item_counts()`);
  } else {
    // Remove collection from this site

    await connection().any(deleteIiifMetadata(collectionId, siteId));
    await connection().any(deleteIiifLinking(collectionId, siteId));
    await connection().any(deleteChildIiifDerivedResourceItems(collectionId, siteId));
    await connection().any(deleteParentIiifDerivedResourceItems(collectionId, siteId));
    await connection().any(deleteChildIiifDerivedResources(collectionId, siteId));
    await connection().any(deleteIiifDerivedResource(collectionId, siteId));

    await connection().query(sql`select refresh_item_counts()`);
  }
}
