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

  const manifestId = context.query.manifest_id === undefined ? undefined : Number(context.query.manifest_id);
  if (
    context.query.manifest_id !== undefined &&
    (typeof context.query.manifest_id !== 'string' ||
      !/^[1-9]\d*$/.test(context.query.manifest_id) ||
      !Number.isSafeInteger(manifestId))
  ) {
    throw new RequestError('Invalid manifest ID');
  }

  context.response.body = await context.captureModels.getModelFieldRevisionsByProject({
    projectId,
    manifestId,
    entity: context.query.entity,
    siteId,
    status: context.query.status === 'all' ? 'all' : context.query.status === 'drafts' ? 'drafts' : 'approved',
  });
};
