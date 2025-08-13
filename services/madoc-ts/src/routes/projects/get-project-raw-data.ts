import { getProject } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { RequestError } from '../../utility/errors/request-error';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

export const getProjectRawData: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);

  const parsedId = context.params.id ? parseProjectId(context.params.id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, siteId)) : null;
  const projectId = project ? project.id : null;

  if (!projectId) {
    throw new NotFound('Project not found');
  }

  if (context.query.entity && typeof context.query.entity !== 'string') {
    throw new RequestError('Invalid entity');
  }

  context.response.body = await context.captureModels.getModelFieldRevisionsByProject({
    projectId,
    entity: context.query.entity,
    siteId,
    status: context.query.status,
  });
};
