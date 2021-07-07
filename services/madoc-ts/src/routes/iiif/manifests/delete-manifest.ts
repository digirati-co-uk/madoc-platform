import { api } from '../../../gateway/api.server';
import { userWithScope } from '../../../utility/user-with-scope';
import { RouteMiddleware } from '../../../types/route-middleware';

export const deleteManifest: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const manifestId = context.params.id;

  const siteApi = api.asUser({ siteId });

  const deletionSummary = await siteApi.getManifestDeletionSummary(manifestId);

  if (deletionSummary.search.indexed && deletionSummary.search.id) {
    await siteApi.searchDeleteIIIF(deletionSummary.search.id);
  }

  // Delete derived manifest
  //  - Manifest items
  //  - Derived canvases - if no other links
  //  - Linking
  //  - Derived metadata
  // Delete full manifest
  //  - Same as above.
  // Delete notifications with subject
  // Delete from search
  // Delete tasks
  // Delete parent tasks
  // Delete models
  // Delete from activity streams

  // await context.connection.any(deleteResource(context.params.id, 'manifest', siteId));
  //
  // await context.connection.query(sql`select refresh_item_counts()`);

  context.response.status = 200;
};
