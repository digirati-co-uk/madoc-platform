import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';

export type SiteProjectsQuery = {
  page?: number;
  // parent_collection_ids: number[];
  collection_id?: number;
  manifest_id?: number;
  capture_model_id?: string;
  // canvas_id?: number;
};

export const siteProjects: RouteMiddleware<{ slug: string }> = async context => {
  const { siteApi } = context.state;
  const page = context.query.page ? Number(context.query.page) : 1;

  const scope = context.state.jwt?.scope || [];
  const onlyPublished = scope.indexOf('site.admin') !== -1 ? castBool(context.request.query.published) : true;

  const { collection_id, manifest_id, capture_model_id } = context.query;

  if (manifest_id) {
    context.response.body = await siteApi.getManifestProjects(Number(manifest_id), { published: onlyPublished });
    context.response.status = 200;
    return;
  }

  if (collection_id) {
    context.response.body = await siteApi.getCollectionProjects(Number(collection_id), { published: onlyPublished });
    context.response.status = 200;
    return;
  }

  const projects = await siteApi.getProjects(page, { published: onlyPublished, capture_model_id });

  context.response.status = 200;
  context.response.body = projects;
};
