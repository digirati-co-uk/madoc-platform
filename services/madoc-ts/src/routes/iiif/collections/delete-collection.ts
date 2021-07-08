import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import {api} from "../../../gateway/api.server";
import { deleteIiifMetadata } from '../../../database/queries/deletion-queries';

export const deleteCollection: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const collectionId = context.params.id;
  const siteApi = api.asUser({ siteId });

  const deletionSummary = await siteApi.getManifestDeletionSummary(collectionId);

  if (deletionSummary.search.indexed && deletionSummary.search.id) {
    await siteApi.searchDeleteIIIF(deletionSummary.search.id);
  }

  // Delete metadata
  await context.connection.any(deleteIiifMetadata(collectionId));

  //await context.connection.any(deleteResource(context.params.id, 'collection', siteId));

  //await context.connection.query(sql`select refresh_item_counts()`);

  context.response.status = 200;
};
