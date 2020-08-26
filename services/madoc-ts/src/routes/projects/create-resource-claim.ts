// Based on the configuration for the site and the tasks already distributed for the subject (manifest/canvas) the
// resource may be assigned to the requesting user and a task created to track that. By default, no rules apply for
// claiming resources.

import { RouteMiddleware } from '../../types/route-middleware';
import { BaseTask } from '../../gateway/tasks/base-task';
import { CaptureModel } from '@capture-models/types';
import { userWithScope } from '../../utility/user-with-scope';
import { NotFound } from '../../utility/errors/not-found';
import { ApplicationContext } from '../../types/application-context';
import { RequestError } from '../../utility/errors/request-error';
import { sql } from 'slonik';
import { CrowdsourcingCollectionTask } from '../../types/tasks/crowdsourcing-collection-task';
import { CrowdsourcingManifestTask } from '../../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingCanvasTask } from '../../gateway/tasks/crowdsourcing-canvas-task';
import { api } from '../../gateway/api.server';
import { iiifGetLabel } from '../../utility/iiif-get-label';
import { CrowdsourcingTask } from '../../types/tasks/crowdsourcing-task';
import { createTask } from '../../gateway/tasks/crowdsourcing-task';
import { CaptureModelSnippet } from '../../types/schemas/capture-model-snippet';
import { statusToClaimMap } from './update-resource-claim';
import { ProjectConfiguration } from '../../types/schemas/project-configuration';
import * as crowdsourcingCanvasTask from '../../gateway/tasks/crowdsourcing-canvas-task';
import * as crowdsourcingManifestTask from '../../gateway/tasks/crowdsourcing-manifest-task';

export type ResourceClaim = {
  collectionId?: number;
  manifestId?: number;
  canvasId?: number;
  revisionId?: string;
  status?: 1 | 2;
};

// @todo turn this into IIIF endpoint.
async function verifyResourceInProject(
  context: ApplicationContext,
  siteId: number,
  projectId: number,
  userId: number,
  claim: ResourceClaim
): Promise<boolean> {
  // @todo support canvases on their own.
  if (claim.canvasId && !claim.manifestId) {
    throw new RequestError('Cannot claim a canvas that is not inside a manifest');
  }

  if (claim.canvasId && claim.manifestId) {
    // Check if canvas is in manifest.
    const { rowCount } = await context.connection.query(
      sql`
        select item_id from iiif_derived_resource_items 
            left join iiif_resource ir on iiif_derived_resource_items.resource_id = ir.id
        where site_id = ${siteId}
        and resource_id = ${claim.manifestId}
        and ir.type = 'manifest'
        and item_id = ${claim.canvasId}
      `
    );

    if (!rowCount) {
      throw new RequestError(`Canvas ${claim.canvasId} does not exist on Manifest ${claim.manifestId}`);
    }
  }

  if (claim.manifestId && claim.collectionId) {
    // Check if canvas is in manifest.
    const { rowCount } = await context.connection.query(
      sql`
        select item_id from iiif_derived_resource_items 
            left join iiif_resource ir on iiif_derived_resource_items.resource_id = ir.id
        where site_id = ${siteId}
        and resource_id = ${claim.collectionId}
        and ir.type = 'collection'
        and item_id = ${claim.manifestId}
      `
    );

    if (!rowCount) {
      throw new RequestError(`Manifest ${claim.manifestId} does not exist on Collection ${claim.collectionId}`);
    }
  }

  if (claim.manifestId) {
    // Check if manifest in project.
    const { rowCount } = await context.connection.query(
      sql`
        select * from iiif_derived_resource_items
            left join iiif_resource ir on iiif_derived_resource_items.item_id = ir.id
            left join iiif_project ip on iiif_derived_resource_items.resource_id = ip.collection_id
            where item_id = ${claim.manifestId}
            and ip.id = ${projectId}
            and ir.type = 'manifest'
      `
    );

    if (!rowCount) {
      throw new Error(`Manifest ${claim.manifestId} is not in Project ${projectId}`);
    }
  }

  if (claim.collectionId) {
    // Check if collection in project.
    const { rowCount } = await context.connection.query(
      sql`
        select * from iiif_derived_resource_items
            left join iiif_resource ir on iiif_derived_resource_items.item_id = ir.id
            left join iiif_project ip on iiif_derived_resource_items.resource_id = ip.collection_id
            where item_id = ${claim.collectionId}
            and ip.id = ${projectId}
            and ir.type = 'collection'
      `
    );

    if (!rowCount) {
      if (!claim.manifestId && !claim.canvasId) {
        throw new Error(`Collection ${claim.collectionId} is not in Project ${projectId}`);
      }
      claim.collectionId = undefined;
    }
  }

  // Ensure they can.
  return true;
}

function buildContextFromClaim(siteUrn: string, projectId: number, claim: ResourceClaim) {
  const context = [siteUrn, `urn:madoc:project:${projectId}`];

  if (claim.collectionId) {
    context.push(`urn:madoc:collection:${claim.collectionId}`);
  }

  if (claim.manifestId) {
    context.push(`urn:madoc:manifest:${claim.manifestId}`);
  }

  if (claim.canvasId) {
    context.push(`urn:madoc:canvas:${claim.canvasId}`);
  }

  return context;
}

async function ensureProjectTaskStructure(
  context: ApplicationContext,
  siteId: number,
  projectId: number,
  userId: number,
  claim: ResourceClaim
): Promise<(CrowdsourcingCollectionTask | CrowdsourcingManifestTask | CrowdsourcingCanvasTask) & { id: string }> {
  const userApi = api.asUser({ siteId });
  // Get top level project task.
  const { task_id } = await context.connection.one(
    sql<{
      task_id: string;
      collection_id: number;
    }>`select task_id, collection_id from iiif_project where site_id = ${siteId} and id = ${projectId}`
  );

  const rootTask = await userApi.getTaskById(task_id, true, 0, undefined, undefined, true, true);

  let parent = rootTask;

  if (!rootTask) {
    throw new RequestError('Invalid project');
  }

  // Fetch configuration.
  const configQuery: string[] = [
    claim.canvasId ? `urn:madoc:canvas:${claim.canvasId}` : undefined,
    claim.manifestId ? `urn:madoc:manifest:${claim.manifestId}` : undefined,
    claim.collectionId ? `urn:madoc:collection:${claim.collectionId}` : undefined,
    `urn:madoc:project:${projectId}`,
    `urn:madoc:site:${siteId}`,
  ].filter(e => e !== undefined) as any;

  const { config } = await userApi.getConfiguration<ProjectConfiguration>('madoc', configQuery);
  const firstConfig: Partial<ProjectConfiguration> = config && config[0] ? config[0].config_object : {};
  const maxContributors =
    firstConfig.maxContributionsPerResource || firstConfig.maxContributionsPerResource === 0
      ? firstConfig.maxContributionsPerResource
      : undefined;
  const approvalsRequired = firstConfig.revisionApprovalsRequired || 1;

  if (claim.collectionId) {
    // 1. Search by subject + root.
    const foundCollectionTask = (parent.subtasks || []).find(
      (task: any) => task.subject === `urn:madoc:collection:${claim.collectionId}`
    );

    if (!foundCollectionTask) {
      const { collection, pagination } = await userApi.getCollectionById(claim.collectionId);

      const task: CrowdsourcingCollectionTask = {
        name: iiifGetLabel(collection.label, 'Untitled collection'),
        type: 'crowdsourcing-collection-task',
        subject: `urn:madoc:collection:${claim.collectionId}`,
        parameters: [],
        state: {},
        status_text: 'accepted',
        status: 1,
      };

      parent = await userApi.addSubtasks<BaseTask & { id: string }>(task, parent.id);
    } else {
      parent = await userApi.getTaskById(foundCollectionTask.id, true, 0, undefined, undefined, true, true);
    }
  }

  if (claim.manifestId) {
    const foundManifestTask = (parent.subtasks || []).find(
      (task: any) => task.subject === `urn:madoc:manifest:${claim.manifestId}`
    );

    if (!foundManifestTask) {
      const { manifest } = await userApi.getManifestById(claim.manifestId);


      const task = crowdsourcingManifestTask.createTask({
        label: iiifGetLabel(manifest.label, 'Untitled manifest'),
        maxContributors,
        approvalsRequired,
        manifestId: claim.manifestId,
      });

      parent = await userApi.addSubtasks<BaseTask & { id: string }>(task, parent.id);
    } else {
      parent = await userApi.getTaskById(foundManifestTask.id, true, 0, undefined, undefined, true, true);
    }
  }
  if (claim.canvasId) {
    const foundCanvasTask = (parent.subtasks || []).find(
      (task: any) => task.subject === `urn:madoc:canvas:${claim.canvasId}`
    );

    if (!foundCanvasTask) {
      const { canvas } = await userApi.getCanvasById(claim.canvasId);

      // Make sure canvasId task exists. Update parent.
      // parent = canvasTask;
      const task = crowdsourcingCanvasTask.createTask({
        canvasId: claim.canvasId,
        approvalsRequired,
        maxContributors,
        parentTaskName: parent.name,
        label: iiifGetLabel(canvas.label, 'Untitled canvas'),
      });

      parent = await userApi.addSubtasks<BaseTask & { id: string }>(task, parent.id);
    } else {
      parent = await userApi.getTaskById(foundCanvasTask.id, true, 0, undefined, undefined, true, true);
    }
  }

  // Project task -> collection -> manifest -> canvas
  return parent as (CrowdsourcingCollectionTask | CrowdsourcingManifestTask | CrowdsourcingCanvasTask) & { id: string };
}

async function getTaskFromClaim(
  context: ApplicationContext,
  siteUrn: string,
  projectId: number,
  userId: number,
  parent: CrowdsourcingCollectionTask | CrowdsourcingManifestTask | CrowdsourcingCanvasTask,
  claim: ResourceClaim
): Promise<BaseTask | undefined> {
  if (!parent.subtasks || parent.subtasks.length === 0) {
    return undefined;
  }

  if (claim.canvasId) {
    return (parent.subtasks || []).find(
      task =>
        task.subject === `urn:madoc:canvas:${claim.canvasId}` &&
        task.type === 'crowdsourcing-task' &&
        task.status !== 3 &&
        task.status !== -1 &&
        (claim.revisionId ? task.state.revisionId === claim.revisionId : true) &&
        task.assignee &&
        task.assignee.id === `urn:madoc:user:${userId}`
    );
  }

  if (claim.manifestId) {
    return (parent.subtasks || []).find(
      task =>
        task.subject === `urn:madoc:manifest:${claim.canvasId}` &&
        task.type === 'crowdsourcing-task' &&
        task.status !== 3 &&
        task.status !== -1 &&
        (claim.revisionId ? task.state.revisionId === claim.revisionId : true) &&
        task.assignee &&
        task.assignee.id === `urn:madoc:user:${userId}`
    );
  }

  if (claim.collectionId) {
    return (parent.subtasks || []).find(
      task =>
        task.subject === `urn:madoc:collection:${claim.collectionId}` &&
        task.type === 'crowdsourcing-task' &&
        task.status !== 3 &&
        task.status !== -1 &&
        (claim.revisionId ? task.state.revisionId === claim.revisionId : true) &&
        task.assignee &&
        task.assignee.id === `urn:madoc:user:${userId}`
    );
  }

  // Check the parent task for an item with matching id assigned to user.

  return undefined;
}

async function upsertCaptureModelForResource(
  context: ApplicationContext,
  siteId: number,
  projectId: number,
  userId: number,
  claim: ResourceClaim
): Promise<CaptureModel & { id: string }> {
  // Get top level project task.
  const { task_id, capture_model_id } = await context.connection.one(
    sql<{
      task_id: string;
      capture_model_id: string;
    }>`select task_id, capture_model_id from iiif_project where site_id = ${siteId} and id = ${projectId}`
  );

  const userApi = api.asUser({ userId, siteId });
  const mainTarget = claim.canvasId
    ? { type: 'Canvas', id: `urn:madoc:canvas:${claim.canvasId}` }
    : claim.manifestId
    ? { type: 'Manifest', id: `urn:madoc:manifest:${claim.manifestId}` }
    : claim.collectionId
    ? { type: 'Collection', id: `urn:madoc:collection:${claim.collectionId}` }
    : undefined;

  if (mainTarget && capture_model_id) {
    const existingModel = await userApi.getAllCaptureModels({
      target_type: mainTarget.type,
      target_id: mainTarget.id,
      derived_from: capture_model_id,
    });

    if (existingModel.length) {
      return await userApi.getCaptureModel(existingModel[0].id);
    }
  }

  const target = [];

  if (claim.collectionId) {
    target.push({ id: `urn:madoc:collection:${claim.collectionId}`, type: 'Collection' });
  }

  if (claim.manifestId) {
    target.push({ id: `urn:madoc:manifest:${claim.manifestId}`, type: 'Manifest' });
  }

  if (claim.canvasId) {
    target.push({ id: `urn:madoc:canvas:${claim.canvasId}`, type: 'Canvas' });
  }

  if (!target.length) {
    throw new RequestError('No valid target');
  }

  // @TODO need to add custom context too.
  return userApi.cloneCaptureModel(capture_model_id, target);
}

async function createUserCrowdsourcingTask({
  context,
  siteId,
  projectId,
  userId,
  name,
  parentTaskId,
  taskName,
  subject,
  type,
  captureModel,
  claim,
}: {
  context: ApplicationContext;
  siteId: number;
  projectId: number;
  userId: number;
  name: string;
  parentTaskId: string;
  taskName: string;
  subject: string;
  type: string;
  captureModel: (CaptureModel | CaptureModelSnippet) & { id: string };
  claim: ResourceClaim;
}): Promise<CrowdsourcingTask> {
  const userApi = api.asUser({ userId, siteId });

  const structureId = undefined; // @todo call to config service to get structure id.

  const task = createTask({
    siteId,
    projectId,
    userId,
    name,
    taskName,
    subject,
    resourceType: type,
    captureModel,
    structureId,
    revisionId: claim.revisionId, // @todo ensure user is assigned to this revision?
  });

  return userApi.addSubtasks(task, parentTaskId);
}

async function getCanonicalClaim(
  resourceClaim: ResourceClaim,
  siteId: number,
  projectId: number,
  userId: number
): Promise<ResourceClaim> {
  const userApi = api.asUser({ userId, siteId });

  if (resourceClaim.canvasId && !resourceClaim.manifestId) {
    const { manifests } = await userApi.getCanvasManifests(resourceClaim.canvasId, { project_id: projectId });

    if (manifests.length === 1) {
      resourceClaim.manifestId = manifests[0];
    }
  }

  if (resourceClaim.manifestId && !resourceClaim.collectionId) {
    const { collections } = await userApi.getManifestCollections(resourceClaim.manifestId, { project_id: projectId });

    if (collections.length === 1) {
      resourceClaim.collectionId = collections[0];
    }
  }

  return resourceClaim;
}

export const prepareResourceClaim: RouteMiddleware<{ id: string }, ResourceClaim> = async context => {
  const { id, siteId, siteUrn } = userWithScope(context, ['models.contribute']);
  // Get the params.
  const projectId = Number(context.params.id);
  const claim = await getCanonicalClaim(context.requestBody, siteId, projectId, id);

  const isInProject = await verifyResourceInProject(context, siteId, projectId, id, claim);

  if (!isInProject) {
    throw new NotFound();
  }

  // Make sure our fancy structure exists.
  const parent = await ensureProjectTaskStructure(context, siteId, projectId, id, claim);

  // Check for existing claim
  const existingClaim = await getTaskFromClaim(context, siteUrn, projectId, id, parent, claim);

  const model = await upsertCaptureModelForResource(context, siteId, projectId, id, claim);

  context.response.body = {
    model: {
      id: model.id,
      label: model.structure.label,
    },
    claim: existingClaim,
  };
};

export const createResourceClaim: RouteMiddleware<{ id: string }, ResourceClaim> = async context => {
  const { id, name, siteId, siteUrn } = userWithScope(context, ['models.contribute']);
  // Get the params.
  const projectId = Number(context.params.id);
  const claim = await getCanonicalClaim(context.requestBody, siteId, projectId, id);
  const userApi = api.asUser({ userId: id, siteId });

  const isInProject = await verifyResourceInProject(context, siteId, projectId, id, claim);

  if (!isInProject) {
    throw new NotFound();
  }

  // Make sure our fancy structure exists.
  const parent = await ensureProjectTaskStructure(context, siteId, projectId, id, claim);

  // Check for existing claim
  const existingClaim = await getTaskFromClaim(context, siteUrn, projectId, id, parent, claim);

  if (existingClaim) {
    if (!(existingClaim.state.revisionId && claim.revisionId && existingClaim.state.revisionId !== claim.revisionId)) {
      if (typeof claim.status !== 'undefined' && claim.status !== existingClaim.status) {
        context.response.body = {
          claim: await userApi.updateTask(existingClaim.id, {
            status: claim.status,
            status_text: statusToClaimMap[claim.status as any] || 'in progress',
          }),
        };
        return;
      }

      context.response.body = {
        claim: await userApi.getTaskById(existingClaim.id as string, true, 0, undefined, undefined, true),
      };
      return;
    }
  }

  if (claim.canvasId) {
    // Make sure a capture model exists and retrieve it.
    const captureModel = await upsertCaptureModelForResource(context, siteId, projectId, id, claim);

    // Create the crowdsourcing task.
    const task = await createUserCrowdsourcingTask({
      context,
      siteId,
      projectId,
      userId: id,
      name,
      parentTaskId: parent.id,
      taskName: parent.name,
      subject: `urn:madoc:canvas:${claim.canvasId}`,
      type: 'canvas',
      captureModel,
      claim,
    });

    if (typeof claim.status !== 'undefined' && claim.status !== task.status) {
      context.response.body = {
        claim: await userApi.updateTask(task.id, {
          status: claim.status,
          status_text: statusToClaimMap[claim.status as any] || 'in progress',
        }),
      };
      return;
    }
    context.response.body = { claim: task };
    return;
  }

  if (claim.manifestId) {
    // This will need to create a manifest crowdsourcing task
    // and then one for every canvas under that.
    throw new Error('Claiming whole manifest not yet supported');
  }

  if (claim.collectionId) {
    // I don't think this will be supported ever.
    throw new Error('Claiming whole collection not yet supported');
  }
};
