import { getProject } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';
import { parseProjectId } from '../../utility/parse-project-id';

export const siteCompletions: RouteMiddleware<{ type: string }> = async context => {
  const lng = context.cookies.get('i18next');
  const { site, siteApi, authenticatedUser } = context.state;

  const completionType = context.params.type;
  const parsedId = context.query.project_id ? parseProjectId(context.query.project_id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, site.id)) : null;
  const projectId = project ? project.id : null;

  context.response.body = await context.completions.doCompletion(completionType, {
    request: context.request,
    siteId: site.id,
    api: siteApi,
    userId: authenticatedUser?.id,
    projectId,
    language: lng || 'en',
  });
  context.response.status = 200;
};
