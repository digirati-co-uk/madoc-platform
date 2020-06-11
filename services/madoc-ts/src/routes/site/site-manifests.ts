import { RouteMiddleware } from '../../types/route-middleware';

export type SiteManifestQuery = {
  project_id?: number;
  page?: number;
};

export const siteManifests: RouteMiddleware<{ slug: string }> = async context => {
  const projectId = context.query.project_id as string | undefined;
  const page = Number(context.query.page || 1) || 1;
  const { site, siteApi } = context.state;

  if (site.is_public) {
    // @todo try cache.
  }

  if (projectId) {
    const project = await siteApi.getProject(Number(projectId));
    // @todo Check if project is running (or is admin)
    // If not running, then not found.
    // Get project collection id passing in page, and asking for only collections.
    // return collection id.
    context.response.status = 200;
    context.response.body = await siteApi.getManifests(page, project.collection_id);

    return;
  }

  // Get all collections from a site, passing in page.
  context.response.status = 200;
  context.response.body = await siteApi.getManifests(page);
};
