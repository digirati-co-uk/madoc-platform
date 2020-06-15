import { RouteMiddleware } from '../../types/route-middleware';

export type SiteProjectsQuery = {
  page?: number;
  // parent_collection_ids: number[];
  collection_id?: number;
  manifest_id?: number;
  // canvas_id?: number;
};

export const siteProjects: RouteMiddleware<{ slug: string }> = async context => {
  const { siteApi } = context.state;
  const page = context.query.page ? Number(context.query.page) : 1;

  const { collection_id, manifest_id } = context.query;

  if (manifest_id) {
    context.response.body = await siteApi.getManifestProjects(Number(manifest_id));
    context.response.status = 200;
    return;
  }

  if (collection_id) {
    context.response.body = await siteApi.getCollectionProjects(Number(collection_id));
    context.response.status = 200;
    return;
  }

  const projects = await siteApi.getProjects(page);

  context.response.status = 200;
  context.response.body = projects;
};
