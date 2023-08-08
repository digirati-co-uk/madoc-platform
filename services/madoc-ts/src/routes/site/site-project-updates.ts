import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { NotFound } from '../../utility/errors/not-found';

export const siteProjectUpdates: RouteMiddleware = async context => {
  const { siteApi } = context.state;
  const page = context.query.page ? Number(context.query.page) : 1;
  const scope = context.state.jwt?.scope || [];
  const projectSlug = context.params.projectSlug;
  const onlyPublished = scope.indexOf('site.admin') !== -1 ? castBool(context.request.query.published) : true;
  const project = await siteApi.getProject(projectSlug, { published: onlyPublished });

  if (!project) {
    throw new NotFound();
  }

  context.response.body = await siteApi.listProjectUpdates(projectSlug, page);
};
