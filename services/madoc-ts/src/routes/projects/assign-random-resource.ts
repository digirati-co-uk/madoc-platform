import { RouteMiddleware } from '../../types/route-middleware';
import { api } from '../../gateway/api.server';
import { ItemStructureListItem } from '../../types/schemas/item-structure-list';
import { NotFound } from '../../utility/errors/not-found';
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
  const { id, siteId, userUrn, scope } = userWithScope(context, []);
  const projectId = context.params.id;
  const { collectionId, manifestId: requestManifestId, type, claim = true } = context.requestBody;

  const userApi = api.asUser({ siteId, userId: id });
  const project = await userApi.getProject(projectId);
  const priorityRandom = project.config.priorityRandomness || false;

  if (claim && scope.indexOf('models.contribute') === -1) {
    throw new NotFound();
  }

  const isTranscriberMode = project.config.contributionMode === 'transcription';

  // Getting a random manifest id.
  async function getAvailableManifests() {
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
        if (parsed.type.toLowerCase() === 'manifest' && (task.status === 3 || task.status === 2)) {
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
    return collectionStructure.items.filter(item => {
      return item.type === 'manifest' && completedManifests.indexOf(item.id) === -1;
    });
  }

  function getRandomManifest(validManifests: ItemStructureListItem[]) {
    const toChooseFrom = priorityRandom ? validManifests.slice(0, 5) : validManifests;
    const key = Math.floor(toChooseFrom.length * Math.random());

    const randomManifest = validManifests[key] || validManifests[0];

    return [randomManifest?.id || undefined, validManifests.length] as const;
  }

  let manifests = await getAvailableManifests();

  async function getAvailableCanvases(manifestId?: number) {
    if (!manifestId) {
      return [];
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
        if (subject.status === 3 || subject.status === -1 || (isTranscriberMode && subject.status === 2)) {
          withoutCanvasId.push(subject.subject);
        }
      }
    }

    return structures.items.filter(item => {
      return withoutCanvasId.indexOf(`urn:madoc:canvas:${item.id}`) === -1;
    });
  }

  while (manifests.length) {
    const [manifestId, availableManifests] = requestManifestId
      ? [Number(requestManifestId), 0]
      : getRandomManifest(manifests);

    // No manifest, no tasks.
    if (!manifestId) {
      context.response.body = { remainingTasks: 0 };
      return;
    }

    // Manifest claims.
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

    const availableCanvases = await getAvailableCanvases(manifestId);

    if (availableCanvases.length === 0) {
      if (requestManifestId) {
        context.response.body = { manifest: manifestId, claim: null, remainingTasks: 0 };
        return;
      }
      // Skip this manifest.
      manifests = manifests.filter(m => m.id !== manifestId);
      continue;
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
    return;
  }
};
