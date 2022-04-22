import invariant from 'tiny-invariant';
import { getProject } from '../../database/queries/project-queries';
import { RouteMiddleware } from '../../types/route-middleware';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

export const updateProjectAnnotationStyle: RouteMiddleware<{ id: string }, { style_id: number }> = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const parsedId = context.params.id ? parseProjectId(context.params.id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, siteId)) : null;
  const projectId = project ? project.id : null;
  const { style_id } = context.requestBody || {};

  invariant(projectId, 'Project not found');

  await context.annotationStyles.addStyleToProject(style_id || null, projectId, siteId);
  context.response.status = 204;
};
