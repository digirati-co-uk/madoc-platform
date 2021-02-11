import { RouteMiddleware } from '../../types/route-middleware';
import { api } from '../../gateway/api.server';
import { parseUrn } from '../../utility/parse-urn';
import { userWithScope } from '../../utility/user-with-scope';
import { RequestError } from '../../utility/errors/request-error';

export const assignRandomResource: RouteMiddleware<
  { id: string },
  {
    collectionId: string;
    manifestId: string;
    claim: boolean;
    type: 'canvas' | 'manifest';
  }
> = async context => {
  const { id, siteId, userUrn } = userWithScope(context, ['models.contribute']);
  const projectId = context.params.id;
  const { collectionId, manifestId: requestManifestId, type, claim = true } = context.requestBody;

  const userApi = api.asUser({ siteId, userId: id });
  const project = await userApi.getProject(projectId);
  const priorityRandom = project.config.priorityRandomness || false;

  // Getting a random manifest id.
  async function getRandomManifest() {
    // Get project.
    // Get all manifests in a project from flat collection.
    // Request all crowdsourcing-manifest-task from the project
    // Make sure its not complete, return.
    const currentManifests = await userApi.getTasks(0, {
      type: 'crowdsourcing-manifest-task',
      root_task_id: project.task_id,
      subject_parent: collectionId ? `urn:madoc:collection:${collectionId}` : undefined,
      all: true,
      detail: true,
    });

    // Filter to find the completed manifests.
    const completedManifests: number[] = currentManifests.tasks
      .map(task => {
        const parsed = parseUrn(task.subject);
        if (!parsed) {
          // Invalid task.
          return undefined;
        }
        if (parsed.type.toLowerCase() === 'manifest' && task.status === 3) {
          return parsed.id;
        }
        return undefined;
      })
      .filter(e => e) as number[];

    // Construct query to get manifests in a project.
    const projectStructure = await userApi.getCollectionStructure(project.collection_id);

    if (collectionId) {
      const found = projectStructure.items.find(item => item.id === Number(collectionId));
      if (!found) {
        throw new RequestError('Collection is not in project');
      }
    }

    const collectionStructure = collectionId
      ? await userApi.getCollectionStructure(Number(collectionId))
      : projectStructure;

    // Valid manifests.
    const validManifests = collectionStructure.items.filter(item => {
      return item.type === 'manifest' && completedManifests.indexOf(item.id) === -1;
    });

    if (validManifests.length === 0) {
      return [undefined, 0] as const;
    }

    const toChooseFrom = priorityRandom ? validManifests.slice(0, 5) : validManifests;
    const key = Math.floor(toChooseFrom.length * Math.random());

    const randomManifest = validManifests[key] || validManifests[0];

    return [randomManifest?.id || undefined, validManifests.length] as const;
  }

  const [manifestId, availableManifests] = requestManifestId ? [requestManifestId, 0] : await getRandomManifest();

  if (!manifestId) {
    context.response.body = { remainingTasks: 0 };
    return;
  }

  if (!requestManifestId && type === 'manifest' && !claim) {
    context.response.body = {
      manifest: manifestId,
      claim: null,
      remainingTasks: availableManifests,
    };
    return;
  }

  if (type !== 'canvas') {
    // What's no enabled yet?
    // type="manifest" && claim=true - automatically claim a random manifest.
    throw new RequestError('Not enabled');
  }

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

  const key = Math.floor(toChooseFrom.length * Math.random());

  const canvas = toChooseFrom[key];

  if (!canvas) {
    throw new Error();
  }

  const siteApi = api.asUser({ userId: id, siteId });

  const resourceClaim = claim
    ? await siteApi.createResourceClaim(project.id, {
        collectionId: collectionId ? Number(collectionId) : undefined,
        manifestId: manifestId ? Number(manifestId) : undefined,
        canvasId: canvas.id,
      })
    : null;

  context.response.body = {
    canvas,
    manifest: manifestId,
    claim: resourceClaim ? resourceClaim.claim : null,
    remainingTasks: availableCanvases.length,
  };
};
