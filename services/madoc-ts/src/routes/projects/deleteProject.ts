import { api } from '../../gateway/api.server';
import { userWithScope } from '../../utility/user-with-scope';
import { RouteMiddleware } from '../../types/route-middleware';
import { deleteProjectMetadata } from '../../database/queries/deletion-queries';

export const deleteProject: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const projectId = context.params.id;

  const siteApi = api.asUser({ siteId });

  const deletionSummary = await siteApi.getProjectDeletionSummary(projectId);

  if (deletionSummary.search.indexed && deletionSummary.search.id) {
    await siteApi.searchDeleteIIIF(deletionSummary.search.id);
  }

  // Delete metadata
  await context.connection.any(deleteProjectMetadata(projectId));

  // TODO actual deletion...

  context.response.status = 200;
};
