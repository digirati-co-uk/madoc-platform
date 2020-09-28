import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';

export const siteProject: RouteMiddleware<{ slug: string; projectSlug: string }> = async context => {
  const projectSlug = context.params.projectSlug;
  const { siteApi } = context.state;

  const scope = context.state.jwt?.scope || [];
  const onlyPublished = scope.indexOf('site.admin') !== -1 ? castBool(context.request.query.published) : true;

  try {
    const project = await siteApi.getProject(projectSlug, { published: onlyPublished });

    context.response.status = 200;
    context.response.body = project;
  } catch (err) {
    console.log(err);

    context.response.status = 404;
  }

  return;
};
