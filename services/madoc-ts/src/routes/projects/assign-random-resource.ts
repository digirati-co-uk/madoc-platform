import { RouteMiddleware } from '../../types/route-middleware';
import { api } from '../../gateway/api.server';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { RequestError } from '../../utility/errors/request-error';

export const assignRandomResource: RouteMiddleware<
  { id: string },
  {
    collectionId: string;
    manifestId: string;
    type: 'canvas' | 'manifest';
  }
> = async context => {
  const { id, siteId, userUrn } = optionalUserWithScope(context, []);
  const projectId = context.params.id;
  const { collectionId, manifestId, type } = context.requestBody;

  const userApi = api.asUser({ siteId });
  const project = await userApi.getProject(projectId);

  if (!project.config.randomlyAssignCanvas || !manifestId || type !== 'canvas') {
    throw new RequestError('Not enabled');
  }

  const priorityRandom = project.config.priorityRandomness || false;

  // Get manifest task
  // Get all canvases tasks under it.
  const manifestTask = await userApi.getTasks(0, {
    subject: `urn:madoc:manifest:${manifestId}`,
    root_task_id: project.task_id,
    all: true,
  });

  const withoutCanvasId: string[] = [];
  const manifestTaskId = manifestTask.tasks[0]?.id;
  const structures = await userApi.getManifestStructure(Number(manifestId));

  if (manifestTaskId) {
    const subjects = structures.items.map(item => `urn:madoc:canvas:${item.id}`);

    // And then load ALL of the statuses.
    const taskSubjects = await userApi.getTaskSubjects(project.task_id, subjects, {
      type: 'crowdsourcing-task',
      assigned_to: userUrn,
    });

    const taskCanvasSubjects = await userApi.getTaskSubjects(project.task_id, subjects, {
      type: 'crowdsourcing-canvas-task',
    });

    for (const subject of taskSubjects.subjects) {
      withoutCanvasId.push(subject.subject);
    }

    for (const subject of taskCanvasSubjects.subjects) {
      if (subject.status === 3 || subject.status === -1) {
        withoutCanvasId.push(subject.subject);
      }
    }
  }

  const availableCanvases = structures.items.filter(item => {
    return withoutCanvasId.indexOf(`urn:madoc:canvas:${item.id}`) === -1;
  });

  if (availableCanvases.length === 0) {
    context.response.body = { remainingTasks: availableCanvases.length };
    return;
  }

  const toChooseFrom = priorityRandom ? availableCanvases.slice(0, 10) : availableCanvases;

  const key = Math.round(toChooseFrom.length * Math.random());

  const canvas = toChooseFrom[key];

  if (!canvas) {
    throw new Error();
  }

  const siteApi = api.asUser({ userId: id, siteId });

  const resourceClaim = await siteApi.createResourceClaim(project.id, {
    collectionId: collectionId ? Number(collectionId) : undefined,
    manifestId: manifestId ? Number(manifestId) : undefined,
    canvasId: canvas.id,
  });

  context.response.body = { canvas, claim: resourceClaim.claim, remainingTasks: availableCanvases.length };
};
