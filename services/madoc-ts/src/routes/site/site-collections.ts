import { RouteMiddleware } from '../../types/route-middleware';

export type SiteCollectionQuery = {
  project_id?: string | number;
  page: number;
};

export const siteCollections: RouteMiddleware<{ slug: string }> = async context => {
  const projectId = context.query.project_id as string | undefined;
  const page = Number(context.query.page || 1) || 1;
  const { site, siteApi } = context.state;

  if (site.is_public) {
    // @todo Try serving cached response.
  }

  // @todo get and limit based on site configuration request.

  if (projectId) {
    const project = await siteApi.getProject(projectId);
    // @todo Check if project is running (or is admin)
    // If not running, then not found.
    // Get project collection id passing in page, and asking for only collections.
    // return collection id.
    context.response.status = 200;
    context.response.body = await siteApi.getCollections(page, project.collection_id, true);

    return;
  }

  // Get all collections from a site, passing in page.
  context.response.status = 200;
  context.response.body = await siteApi.getCollections(page, undefined, true);
};
