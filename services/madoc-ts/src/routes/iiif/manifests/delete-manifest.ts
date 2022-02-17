import { api } from '../../../gateway/api.server';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import {
  deleteIiifDerivedResource,
  deleteParentIiifDerivedResourceItems,
  deleteIiifMetadata,
  deleteIiifResource,
  deleteIiifResourceItem,
  getChildResourceIds,
  deleteChildIiifDerivedResourceItems,
  deleteChildIiifDerivedResources,
  deleteIiifLinking,
} from '../../../database/queries/deletion-queries';
import { getResourceLocalSource } from '../../../database/queries/resource-queries';
import { removeIiifFromDisk } from '../../../utility/deletion-utils';
import { buildManifestDeletionSummary } from './delete-manifest-summary';
import { DatabasePoolConnectionType, sql } from 'slonik';
import { deleteCanvas } from '../canvases/delete-canvas';

export const deleteManifestEndpoint: RouteMiddleware<{ id: number }> = async context => {
  // Delete derived manifest
  //  - Manifest items
  //  - Derived canvases - if no other links
  //  - Linking
  //  - Derived metadata
  // Delete full manifest
  //  - Same as above.
  // TODO Delete notifications with subject
  // Delete from search
  // Delete tasks
  // Delete parent tasks
  // Delete models
  // Delete from activity streams

  const { siteId } = userWithScope(context, ['site.admin']);
  const manifestId = context.params.id;

  await deleteManifest(manifestId, siteId, () => context.connection);

  context.response.status = 204;
};

export async function deleteManifest(manifestId: number, siteId: number, connection: () => DatabasePoolConnectionType) {
  const siteApi = api.asUser({ siteId });
  const deletionSummary = await buildManifestDeletionSummary(manifestId, siteId, connection);

  if (deletionSummary.fullDelete) {
    // Remove manifest from all sites

    // Delete child canvases
    const deleteAll = deletionSummary.deleteAllCanvases;
    const canvasIds = await connection().any(getChildResourceIds(manifestId, 'canvas', !deleteAll));
    for (let i = 0; i < canvasIds.length; i++) {
      await deleteCanvas(canvasIds[i].item_id, siteId, connection);
    }

    if (deletionSummary.search.indexed && deletionSummary.search.id) {
      await siteApi.searchDeleteIIIF(deletionSummary.search.id);
    }

    if (deletionSummary.tasks > 0 || deletionSummary.parentTasks > 0) {
      await siteApi.batchDeleteTasks({ resourceId: manifestId, subject: `urn:madoc:manifest:${manifestId}` });
    }

    // Delete metadata
    await connection().any(deleteIiifMetadata(manifestId));
    await connection().any(deleteIiifLinking(manifestId));

    // Delete local IIIF file
    const localSource = await connection().maybeOne(getResourceLocalSource(manifestId));
    if (!!localSource && !!localSource.local_source) {
      await removeIiifFromDisk(localSource.local_source);
    }

    // Remove manifest from collections
    await connection().any(deleteIiifResourceItem(manifestId));
    await connection().any(deleteParentIiifDerivedResourceItems(manifestId));

    // Delete from iiif_derived_resource <- Canvas meta
    await connection().any(deleteIiifDerivedResource(manifestId));

    // Delete from iiif_resource <- Core record
    await connection().any(deleteIiifResource(manifestId));

    await connection().query(sql`select refresh_item_counts()`);
  } else {
    // Delete manifest records from this site

    await connection().any(deleteIiifMetadata(manifestId, siteId));
    await connection().any(deleteIiifLinking(manifestId, siteId));
    await connection().any(deleteChildIiifDerivedResourceItems(manifestId, siteId));
    await connection().any(deleteParentIiifDerivedResourceItems(manifestId, siteId));
    await connection().any(deleteChildIiifDerivedResources(manifestId, siteId));
    await connection().any(deleteIiifDerivedResource(manifestId, siteId));

    await connection().query(sql`select refresh_item_counts()`);
  }
}
