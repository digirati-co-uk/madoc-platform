import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';
import { api } from '../../../gateway/api.server';
import { deleteIiifMetadata } from '../../../database/queries/deletion-queries';

export const deleteCanvas: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const canvasId = context.params.id;
  const siteApi = api.asUser({ siteId });
  const deletionSummary = await siteApi.getCanvasDeletionSummary(canvasId);

  if (deletionSummary.search.indexed && deletionSummary.search.id) {
    await siteApi.searchDeleteIIIF(deletionSummary.search.id);
  }

  // Delete metadata
  await context.connection.any(deleteIiifMetadata(canvasId));

  // await context.connection.any(deleteResource(context.params.id, 'canvas', siteId));
  //
  // await context.connection.query(sql`select refresh_item_counts()`);

  context.response.status = 200;
};
