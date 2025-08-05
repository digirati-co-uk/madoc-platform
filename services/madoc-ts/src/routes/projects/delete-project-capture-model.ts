import { getProject } from '../../database/queries/project-queries';
import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { RequestError } from '../../utility/errors/request-error';
import { parseProjectId } from '../../utility/parse-project-id';
import { userWithScope } from '../../utility/user-with-scope';

export const deleteProjectCaptureModel: RouteMiddleware<{ id: string; modelId: string }> = async context => {
  const { siteId, id: userId, name: userName } = userWithScope(context, ['site.admin']);
  const captureModelId = context.params.modelId;
  const parsedId = context.params.id ? parseProjectId(context.params.id) : null;
  const project = parsedId ? await context.connection.one(getProject(parsedId, siteId)) : null;
  const projectId = project ? project.id : null;

  if (!projectId || !project) {
    throw new NotFound();
  }

  if (!captureModelId) {
    throw new RequestError('No capture model id to remove');
  }

  const siteApi = api.asUser({ siteId, userId, userName }, {}, true);
  context.disposableApis.push(siteApi); // Need to dispose since it has extensions.

  try {
    const modelToDelete = await siteApi.crowdsourcing.getCaptureModel(captureModelId);
    if (modelToDelete) {
      // 1. Delete model.
      await context.captureModels.deleteCaptureModel(captureModelId, siteId);

      // 2. Delete tasks.
      const target = modelToDelete.target || [];
      const canvasTarget = target.find(t => t.type === 'Canvas');
      const canvasId = canvasTarget?.id;
      const derivedFrom = modelToDelete.derivedFrom;
      if (canvasId && derivedFrom && project.capture_model_id === derivedFrom) {
        // Delete tasks in that project.
        const canvasTasksToDelete = await siteApi.getTasks(1, {
          type: 'crowdsourcing-task',
          all: true,
          all_tasks: true,
          root_task_id: project.task_id,
          subject: canvasId,
        });
        for (const task of canvasTasksToDelete?.tasks || []) {
          await siteApi.deleteTask(task.id!);
        }
      }
    }
    context.response.status = 204;
  } catch (e) {
    console.log(e);
    context.response.status = 204;
  }
};
