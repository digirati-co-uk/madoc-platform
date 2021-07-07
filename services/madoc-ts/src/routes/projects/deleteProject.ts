import { api } from '../../gateway/api.server';
import { userWithScope } from '../../utility/user-with-scope';
import { RouteMiddleware } from '../../types/route-middleware';

export const deleteProject: RouteMiddleware<{ id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const manifestId = context.params.id;

  const siteApi = api.asUser({ siteId });

  const deletionSummary = await siteApi.getManifestDeletionSummary(manifestId);

  if (deletionSummary.search.indexed && deletionSummary.search.id) {
    await siteApi.searchDeleteIIIF(deletionSummary.search.id);
  }

  // TODO actual deletion...

  context.response.status = 200;
};
