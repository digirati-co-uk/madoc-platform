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
import { CrowdsourcingManifestTask } from '../../types/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingCanvasTask } from '../../types/tasks/crowdsourcing-canvas-task';
import { api } from '../../gateway/api.server';
import { iiifGetLabel } from '../../utility/iiif-get-label';
import { CrowdsourcingTask } from '../../types/tasks/crowdsourcing-task';
import { createTask } from '../../gateway/tasks/crowdsourcing-task';

export type ResourceClaim = {
  collectionId?: number;
  manifestId?: number;
  canvasId?: number;
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

  const rootTask = await userApi.getTaskById(task_id, true, 0, undefined, undefined, true);

  let parent = rootTask;

  if (!rootTask) {
    throw new RequestError('Invalid project');
  }

  // Fetch task.
  // let parent = projectTask;

  if (claim.collectionId) {
    // 1. Search by subect + root.
    const foundCollectionTask = (parent.subtasks || []).find(
      (task: any) => task.subject === `urn:madoc:collection:${claim.collectionId}`
    );

    if (!foundCollectionTask) {
      const { collection } = await userApi.getCollectionById(claim.collectionId);

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
      parent = await userApi.getTaskById(foundCollectionTask.id, true, 0, undefined, undefined, true);
    }
  }

  if (claim.manifestId) {
    const foundManifestTask = (parent.subtasks || []).find(
      (task: any) => task.subject === `urn:madoc:manifest:${claim.manifestId}`
    );

    if (!foundManifestTask) {
      const { manifest } = await userApi.getManifestById(claim.manifestId);

      // Make sure manifestId task exists. Update parent.
      // parent = manifestTask;
      const task: CrowdsourcingManifestTask = {
        name: iiifGetLabel(manifest.label, 'Untitled manifest'),
        type: 'crowdsourcing-manifest-task',
        subject: `urn:madoc:manifest:${claim.manifestId}`,
        status_text: 'accepted',
        status: 1,
        state: {},
        parameters: [],
      };

      parent = await userApi.addSubtasks<BaseTask & { id: string }>(task, parent.id);
    } else {
      parent = await userApi.getTaskById(foundManifestTask.id, true, 0, undefined, undefined, true);
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
      const task: CrowdsourcingCanvasTask = {
        name: iiifGetLabel(canvas.label, 'Untitled canvas'),
        type: 'crowdsourcing-canvas-task',
        subject: `urn:madoc:canvas:${claim.canvasId}`,
        status_text: 'accepted',
        status: 1,
        state: {},
        parameters: [],
      };

      parent = await userApi.addSubtasks<BaseTask & { id: string }>(task, parent.id);
    } else {
      parent = await userApi.getTaskById(foundCanvasTask.id, true, 0, undefined, undefined, true);
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
        task.assignee &&
        task.assignee.id === `urn:madoc:user:${userId}`
    );
  }

  if (claim.manifestId) {
    return (parent.subtasks || []).find(
      task =>
        task.subject === `urn:madoc:manifest:${claim.canvasId}` &&
        task.assignee &&
        task.assignee.id === `urn:madoc:user:${userId}`
    );
  }

  if (claim.collectionId) {
    return (parent.subtasks || []).find(
      task =>
        task.subject === `urn:madoc:collection:${claim.collectionId}` &&
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

  const target = [];
  if (claim.canvasId) {
    target.push({ id: `urn:madoc:canvas:${claim.canvasId}`, type: 'Canvas' });
  }

  if (claim.manifestId) {
    target.push({ id: `urn:madoc:manifest:${claim.manifestId}`, type: 'Manifest' });
  }

  if (claim.collectionId) {
    target.push({ id: `urn:madoc:collection:${claim.collectionId}`, type: 'Collection' });
  }

  if (!target.length) {
    throw new RequestError('No valid target');
  }

  // @TODO need to add custom context too.
  return userApi.cloneCaptureModel(capture_model_id, target);
}

async function createUserCrowdsourcingTask(
  context: ApplicationContext,
  siteId: number,
  projectId: number,
  userId: number,
  name: string,
  parentTaskId: string,
  taskName: string,
  subject: string,
  type: string,
  captureModel: CaptureModel & { id: string },
  claim: ResourceClaim
): Promise<CrowdsourcingTask> {
  const userApi = api.asUser({ userId, siteId });

  const structureId = undefined; // @todo call to config service to get structure id.

  const task = createTask(siteId, projectId, userId, name, taskName, subject, type, captureModel, structureId);

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
    // @todo is there more to a claim.
    context.response.body = {
      claim: await userApi.getTaskById(existingClaim.id as string, true, 0, undefined, undefined, true),
    };
    return;
  }

  if (claim.canvasId) {
    // Make sure a capture model exists and retrieve it.
    const captureModel = await upsertCaptureModelForResource(context, siteId, projectId, id, claim);

    // Create the crowdsourcing task.
    const task = await createUserCrowdsourcingTask(
      context,
      siteId,
      projectId,
      id,
      name,
      parent.id,
      parent.name,
      `urn:madoc:canvas:${claim.canvasId}`,
      'canvas',
      captureModel,
      claim
    );

    // And return.
    // @todo is there more to a claim.
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
