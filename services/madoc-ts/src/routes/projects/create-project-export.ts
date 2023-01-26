import { getProject } from '../../database/queries/project-queries';
import { ExportResourceRequest } from '../../extensions/project-export/types';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import * as exportResourceTask from '../../gateway/tasks/export-resource-task';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

export interface ProjectExportRequest {
  label: string;
  summary?: string;
  request: Omit<ExportResourceRequest, 'subject' | 'context'>;
}
export const createProjectExport: RouteMiddleware<{ id: string }, ProjectExportRequest> = async context => {
  const { siteId, id: userId, name } = userWithScope(context, ['site.admin']);
  const siteApi = api.asUser({ siteId, userId, userName: name });
  const parsedId = parseProjectId(context.params.id);
  const project = await context.connection.one(getProject(parsedId, siteId));
  const projectId = project ? project.id : null;

  if (projectId) {
    const task = await siteApi.newTask(
      exportResourceTask.createTask(
        {
          ...context.request.body.request,
          subject: {
            type: 'project',
            id: projectId,
          },
          context: {
            type: 'project',
            id: projectId,
          },
        },
        userId,
        siteId,
        {}
      )
    );

    context.response.body = { task };
    context.response.status = 201;
    return;
  }

  context.response.status = 404;
};
