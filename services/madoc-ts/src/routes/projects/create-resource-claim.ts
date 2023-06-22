// Based on the configuration for the site and the tasks already distributed for the subject (manifest/canvas) the
// resource may be assigned to the requesting user and a task created to track that. By default, no rules apply for
// claiming resources.

import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { RouteMiddleware } from '../../types/route-middleware';
import { BaseTask } from '../../gateway/tasks/base-task';
import { canUserClaimResource, findUserManifestTask } from '../../utility/claim-utilities';
import { userWithScope } from '../../utility/user-with-scope';
import { Context } from 'koa';
import { RequestError } from '../../utility/errors/request-error';
import { sql } from 'slonik';
import { CrowdsourcingCollectionTask } from '../../gateway/tasks/crowdsourcing-collection-task';
import { CrowdsourcingManifestTask } from '../../gateway/tasks/crowdsourcing-manifest-task';
import { CrowdsourcingCanvasTask } from '../../gateway/tasks/crowdsourcing-canvas-task';
import { api } from '../../gateway/api.server';
import { iiifGetLabel } from '../../utility/iiif-get-label';
import { CrowdsourcingTask } from '../../gateway/tasks/crowdsourcing-task';
import { CaptureModelSnippet } from '../../types/schemas/capture-model-snippet';
import { statusToClaimMap } from './update-resource-claim';
import { ProjectConfiguration } from '../../types/schemas/project-configuration';
import * as crowdsourcingCanvasTask from '../../gateway/tasks/crowdsourcing-canvas-task';
import * as crowdsourcingManifestTask from '../../gateway/tasks/crowdsourcing-manifest-task';
import * as crowdsourcingTask from '../../gateway/tasks/crowdsourcing-task';

export type ResourceClaim = {
  collectionId?: number;
  manifestId?: number;
  canvasId?: number;
  revisionId?: string;
  status?: 0 | 1 | 2;
  userId?: number;
};

// @todo turn this into IIIF endpoint.
export async function verifyResourceInProject(
  context: Context,
  siteId: number,
  projectId: number,
  claim: ResourceClaim
): Promise<void> {
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
}

export async function ensureProjectTaskStructure(
  context: Context,
  siteId: number,
  projectId: number,
  userId: number,
  claim: ResourceClaim,
  config: Partial<ProjectConfiguration>
) {
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
  let userManifestTask = undefined;

  if (!rootTask) {
    throw new RequestError('Invalid project');
  }

  const maxContributors =
    config.maxContributionsPerResource || config.maxContributionsPerResource === 0
      ? config.maxContributionsPerResource
      : undefined;
  const approvalsRequired = config.revisionApprovalsRequired || 1;
  const warningTime = config.contributionWarningTime || undefined;
  const claimGranularity = config.claimGranularity || 'canvas';
  const manifestOnly = config.shadow?.showCaptureModelOnManifest;

  // Disabled collection crowdsourcing tasks for now.
  // if (claim.collectionId) {
  //   // 1. Search by subject + root.
  //   const foundCollectionTask = (parent.subtasks || []).find(
  //     (task: any) => task.subject === `urn:madoc:collection:${claim.collectionId}`
  //   );
  //
  //   if (!foundCollectionTask) {
  //     const { collection } = await userApi.getCollectionById(claim.collectionId);
  //
  //     const task: CrowdsourcingCollectionTask = {
  //       name: iiifGetLabel(collection.label, 'Untitled collection'),
  //       type: 'crowdsourcing-collection-task',
  //       subject: `urn:madoc:collection:${claim.collectionId}`,
  //       parameters: [],
  //       state: {},
  //       status_text: 'accepted',
  //       status: 1,
  //       context: [`urn:madoc:project:${projectId}`],
  //     };
  //
  //     parent = await userApi.addSubtasks<BaseTask & { id: string }>(task, parent.id);
  //   } else {
  //     parent = await userApi.getTaskById(foundCollectionTask.id, true, 0, undefined, undefined, true, true);
  //   }
  // }

  if (claim.manifestId) {
    const foundManifestTask = (parent.subtasks || []).find(
      (task: any) => task.subject === `urn:madoc:manifest:${claim.manifestId}`
    );

    if (!foundManifestTask) {
      const { manifest } = await userApi.getManifestById(claim.manifestId);

      const task = crowdsourcingManifestTask.createTask({
        label: iiifGetLabel(manifest.label, 'Untitled manifest'),
        approvalsRequired,
        maxContributors,
        warningTime,
        // @todo disabling this stops manifests automatically being marked as complete in the project
        //   however they still cannot be worked on. This step needs to be added to the review.
        // approvalsRequired,
        manifestId: claim.manifestId,
        collectionId: claim.collectionId,
        projectId,
        isManifestTask: !!manifestOnly,
      });

      parent = await userApi.addSubtasks<BaseTask & { id: string }>(task, parent.id);
    } else {
      parent = await userApi.getTaskById(foundManifestTask.id, true, 0, undefined, undefined, true, true);
    }
  }

  if (claim.canvasId && !manifestOnly) {
    const foundCanvasTask = (parent.subtasks || []).find(
      (task: any) => task.subject === `urn:madoc:canvas:${claim.canvasId}`
    );

    if (claimGranularity === 'manifest') {
      if (!claim.manifestId) {
        throw new RequestError('Cannot claim a canvas on its own in this project');
      }
      // Check for user manifest task in parent first, otherwise error THEN add the task.
      const foundUserManifestTask = findUserManifestTask(claim.manifestId, userId, parent);

      // @todo this is flawed. A user cannot claim a manifest if the structure does not exist yet.
      //   And they ARE preparing a contribution to a manifest, which implies claiming. The issue is with
      //   the found canvas - this should be the USERS canvas submissions is found
      // if (!foundUserManifestTask && foundCanvasTask && preventContributionAfterManifestUnassign) {
      //   throw new RequestError('You must claim a manifest to continue working on this canvas');
      // }

      // We no longer re-parent.
      userManifestTask =
        foundUserManifestTask && foundUserManifestTask.id
          ? await userApi.getTaskById<CrowdsourcingTask>(
              foundUserManifestTask.id,
              true,
              0,
              undefined,
              undefined,
              true,
              true
            )
          : undefined;
    }

    if (!foundCanvasTask) {
      const { canvas } = await userApi.getCanvasById(claim.canvasId);

      // Make sure canvasId task exists. Update parent.
      // parent = canvasTask;
      const task = crowdsourcingCanvasTask.createTask({
        canvasId: claim.canvasId,
        approvalsRequired,
        maxContributors,
        warningTime,
        parentTaskName: parent.name,
        label: iiifGetLabel(canvas.label, 'Untitled canvas'),
        projectId,
      });

      parent = await userApi.addSubtasks<BaseTask & { id: string }>(task, parent.id);
    } else {
      parent = await userApi.getTaskById(foundCanvasTask.id, true, 0, undefined, undefined, true, true);
    }
  }

  // Project task -> collection -> manifest -> canvas
  return [
    parent as (CrowdsourcingCollectionTask | CrowdsourcingManifestTask | CrowdsourcingCanvasTask) & { id: string },
    userManifestTask,
  ] as const;
}

export async function getTaskFromClaim({
  userId,
  parent,
  claim,
}: {
  userId: number;
  parent: CrowdsourcingCollectionTask | CrowdsourcingManifestTask | CrowdsourcingCanvasTask;
  claim: ResourceClaim;
}): Promise<[BaseTask | undefined, BaseTask | undefined, BaseTask | undefined]> {
  const returnClaims: [BaseTask | undefined, BaseTask | undefined, BaseTask | undefined] = [
    undefined,
    undefined,
    undefined,
  ];

  const assigneeId = claim.userId || userId;

  if (!parent.subtasks || parent.subtasks.length === 0) {
    return returnClaims;
  }

  if (claim.canvasId) {
    returnClaims[0] = (parent.subtasks || []).find(
      task =>
        task.subject === `urn:madoc:canvas:${claim.canvasId}` &&
        task.type === 'crowdsourcing-task' &&
        task.status !== 3 &&
        task.status !== -1 &&
        (claim.revisionId && task.state.revisionId ? task.state.revisionId === claim.revisionId : true) &&
        task.assignee &&
        task.assignee.id === `urn:madoc:user:${assigneeId}`
    );
  }

  if (claim.manifestId) {
    returnClaims[1] = (parent.subtasks || []).find(
      task =>
        task.subject === `urn:madoc:manifest:${claim.manifestId}` &&
        task.type === 'crowdsourcing-task' &&
        task.status !== 3 &&
        task.status !== -1 &&
        (claim.revisionId && task.state.revisionId ? task.state.revisionId === claim.revisionId : true) &&
        task.assignee &&
        task.assignee.id === `urn:madoc:user:${assigneeId}`
    );
  }

  if (claim.collectionId) {
    returnClaims[2] = (parent.subtasks || []).find(
      task =>
        task.subject === `urn:madoc:collection:${claim.collectionId}` &&
        task.type === 'crowdsourcing-task' &&
        task.status !== 3 &&
        task.status !== -1 &&
        (claim.revisionId && task.state.revisionId ? task.state.revisionId === claim.revisionId : true) &&
        task.assignee &&
        task.assignee.id === `urn:madoc:user:${assigneeId}`
    );
  }

  // Check the parent task for an item with matching id assigned to user.

  return returnClaims;
}

async function upsertCaptureModelForResource(
  context: Context,
  siteId: number,
  projectId: number,
  userId: number,
  claim: ResourceClaim
): Promise<CaptureModel & { id: string }> {
  // Get top level project task.
  const { capture_model_id, template_config, template_name } = await context.connection.one(
    sql<{
      task_id: string;
      capture_model_id: string;
      template_name: string | null;
      template_config: any | null;
    }>`select task_id, capture_model_id, template_name, template_config from iiif_project where site_id = ${siteId} and id = ${projectId}`
  );

  const template = template_name ? api.projectTemplates.getDefinition(template_name, siteId) : null;
  const projectTemplate = template ? { template, config: template_config } : undefined;

  const userApi = api.asUser({ userId, siteId }, {}, true);
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
  const response = await userApi.cloneCaptureModel(capture_model_id, target, projectTemplate);
  userApi.dispose();
  return response;
}

async function createUserCrowdsourcingTask({
  siteId,
  projectId,
  userId,
  assigneeId,
  name,
  parentTaskId,
  taskName,
  subject,
  parentSubject,
  type,
  captureModel,
  claim,
  warningTime,
  userManifestTask,
  context,
}: {
  context: Context;
  siteId: number;
  projectId: number;
  userId: number;
  assigneeId: number;
  name: string;
  parentTaskId: string;
  taskName: string;
  subject: string;
  parentSubject?: string;
  type: string;
  captureModel?: (CaptureModel | CaptureModelSnippet) & { id: string };
  claim: ResourceClaim;
  warningTime?: number;
  userManifestTask?: CrowdsourcingTask;
}): Promise<CrowdsourcingTask> {
  const user = await context.siteManager.getSiteUserById(userId, siteId);
  const assignee = await context.siteManager.getSiteUserById(assigneeId, siteId);
  const userApi = api.asUser({ userId, siteId, userName: user.name });

  const structureId = undefined; // @todo call to config service to get structure id.

  const task = crowdsourcingTask.createTask({
    projectId,
    userId: assignee.id,
    name: assignee.name,
    taskName,
    subject,
    parentSubject,
    resourceType: type,
    captureModel,
    structureId,
    revisionId: claim.revisionId, // @todo ensure user is assigned to this revision?
    warningTime,
    userManifestTask: userManifestTask?.id,
  });

  return userApi.addSubtasks(task, parentTaskId);
}

export async function getCanonicalClaim(
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

  if (!resourceClaim.userId) {
    resourceClaim.userId = userId;
  }

  return resourceClaim;
}

export const prepareResourceClaim: RouteMiddleware<{ id: string }, ResourceClaim> = async context => {
  const { id, siteId, siteUrn, scope } = userWithScope(context, ['models.contribute']);
  const userApi = api.asUser({ userId: id, siteId });
  const project = await userApi.getProject(context.params.id);

  // Get the params.
  const projectId = project.id;
  const claim = await getCanonicalClaim(context.requestBody, siteId, projectId, id);

  await verifyResourceInProject(context, siteId, projectId, claim);

  // Get project configuration.
  const config = await userApi.getProjectConfiguration(projectId, siteUrn);

  // Make sure our fancy structure exists.
  const [parent, manifestUserTask] = await ensureProjectTaskStructure(context, siteId, projectId, id, claim, config);

  // Check for existing claim
  const [existingClaim, manifestClaim] = await getTaskFromClaim({ userId: id, parent, claim });

  const isPreparing = scope.indexOf('site.admin') !== -1 && project.status === 4;

  if (
    // Not preparing.
    !isPreparing &&
    !existingClaim &&
    (config.claimGranularity !== 'manifest' || !manifestUserTask) &&
    !canUserClaimResource({
      config,
      task: parent,
      userId: id,
    })
  ) {
    throw new RequestError('Maximum number of contributors reached');
  }

  const model = await upsertCaptureModelForResource(context, siteId, projectId, id, claim);

  context.response.body = {
    model: {
      id: model.id,
      label: model.structure.label,
    },
    claim: existingClaim || manifestClaim,
  };
};

export const createResourceClaim: RouteMiddleware<{ id: string }, ResourceClaim> = async context => {
  const { id: userId, name, siteId, siteUrn, scope } = userWithScope(context, ['models.contribute']);
  const isAdmin = context.state.jwt?.scope.indexOf('site.admin') !== -1;
  const isTaskAdmin = isAdmin || context.state.jwt?.scope.indexOf('tasks.admin') !== -1;
  const canCreate = isTaskAdmin || context.state.jwt?.scope.indexOf('tasks.create') !== -1;

  if (context.requestBody.userId && !canCreate && context.requestBody.userId !== userId) {
    throw new Error('Cannot create user on behalf of another');
  }

  const userApi = api.asUser({ userId: userId, siteId });
  const project = await userApi.getProject(context.params.id);

  // Get the params.
  const projectId = project.id;
  const claim = await getCanonicalClaim(context.requestBody, siteId, projectId, userId);

  await verifyResourceInProject(context, siteId, projectId, claim);

  // Get project configuration.
  const config = await userApi.getProjectConfiguration(projectId, siteUrn);
  const manifestOnly = config.shadow?.showCaptureModelOnManifest;

  // Make sure our fancy structure exists.
  const [parent, userManifestTask] = await ensureProjectTaskStructure(
    context,
    siteId,
    projectId,
    userId,
    claim,
    config
  );

  // Check for existing claim
  const [canvasClaim, manifestClaim] = await getTaskFromClaim({ userId: userId, parent, claim });

  const resourceClaim = manifestOnly && !canvasClaim ? manifestClaim : canvasClaim;

  if (resourceClaim) {
    if (!resourceClaim.state.revisionId && claim.revisionId) {
      context.response.body = {
        claim: await userApi.updateTask(resourceClaim.id, {
          state: {
            revisionId: claim.revisionId,
          },
          status: claim.status,
          status_text: statusToClaimMap[claim.status as any] || 'in progress',
        }),
      };
      return;
    }

    // @todo this should ALWAYS be false.
    const revisionDontMatch =
      resourceClaim.state.revisionId && claim.revisionId && resourceClaim.state.revisionId !== claim.revisionId;
    const revisionExistsAndMatch = !revisionDontMatch;

    if (config.modelPageOptions?.preventMultipleUserSubmissionsPerResource && revisionDontMatch) {
      throw new Error('Can only submit one revision per resource');
    }

    if (revisionExistsAndMatch) {
      if (typeof claim.status !== 'undefined' && claim.status !== resourceClaim.status) {
        if (
          config.modelPageOptions?.preventContributionAfterSubmission &&
          resourceClaim.status === 2 &&
          (claim.status === 0 || claim.status === 1) &&
          resourceClaim.state.revisionId
        ) {
          throw new Error('Cannot update task in review');
        }

        context.response.body = {
          claim: await userApi.updateTask(resourceClaim.id, {
            status: claim.status,
            status_text: statusToClaimMap[claim.status as any] || 'in progress',
          }),
        };
        return;
      }

      context.response.body = {
        claim: await userApi.getTaskById(resourceClaim.id as string, true, 0, undefined, undefined, true),
      };
      return;
    }
  }

  // Can't claim a canvas is you've already claimed the manifest.
  if (manifestClaim) {
    // The normal path.
    context.response.body = {
      claim: await userApi.getTaskById(manifestClaim.id as string, true, 0, undefined, undefined, true),
    };
    return;
  }


  if (claim.canvasId) {
    if (
      (config.claimGranularity !== 'manifest' || !userManifestTask) &&
      !canUserClaimResource({
        config,
        task: parent,
        manifestClaim: manifestClaim as any,
        userId,
        revisionId: claim.revisionId,
      })
    ) {
      throw new RequestError('Maximum number of contributors reached');
    }

    // Make sure a capture model exists and retrieve it.
    const captureModel = await upsertCaptureModelForResource(context, siteId, projectId, userId, claim);

    // Create the crowdsourcing task.
    const task = await createUserCrowdsourcingTask({
      context,
      siteId,
      projectId,
      userId: userId,
      assigneeId: claim.userId || userId,
      name,
      parentTaskId: parent.id,
      taskName: parent.name,
      warningTime: parent.type === 'crowdsourcing-canvas-task' ? parent.state.warningTime : undefined,
      subject: `urn:madoc:canvas:${claim.canvasId}`,
      parentSubject: claim.manifestId ? `urn:madoc:manifest:${claim.manifestId}` : undefined,
      type: 'canvas',
      captureModel,
      claim,
      userManifestTask,
    });

    if (userManifestTask && userManifestTask.status === 0) {
      await userApi.updateTask(userManifestTask.id, {
        status: 1,
        status_text: statusToClaimMap[claim.status as any] || 'in progress',
      });
    }

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
    if (
      !canUserClaimResource({
        task: parent as any,
        config,
        manifestClaim: true,
        userId,
      })
    ) {
      throw new RequestError('Maximum number of contributors reached');
    }

    // Option A. This is when there is a capture model on the Manifest, not canvas.
    if (manifestOnly) {
      const captureModel = await upsertCaptureModelForResource(context, siteId, projectId, userId, claim);
      const task = await createUserCrowdsourcingTask({
        context,
        siteId,
        projectId,
        userId: userId,
        assigneeId: claim.userId || userId,
        name,
        parentTaskId: parent.id,
        taskName: parent.name,
        subject: `urn:madoc:manifest:${claim.manifestId}`,
        parentSubject: claim.collectionId ? `urn:madoc:collection:${claim.collectionId}` : undefined,
        type: 'manifest',
        claim,
        captureModel,
        userManifestTask,
      });

      if (userManifestTask && userManifestTask.status === 0) {
        await userApi.updateTask(userManifestTask.id, {
          status: 1,
          status_text: statusToClaimMap[claim.status as any] || 'in progress',
        });
      }

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

    // Option B. The task is all individual capture models on the canvas.
    const task = await createUserCrowdsourcingTask({
      context,
      siteId,
      projectId,
      userId: userId,
      assigneeId: claim.userId || userId,
      name,
      parentTaskId: parent.id,
      taskName: parent.name,
      warningTime: parent.type === 'crowdsourcing-manifest-task' ? parent.state.warningTime : undefined,
      subject: `urn:madoc:manifest:${claim.manifestId}`,
      parentSubject: claim.collectionId ? `urn:madoc:collection:${claim.collectionId}` : undefined,
      type: 'manifest',
      claim,
    });

    context.response.body = { claim: task };

    return;
  }

  if (claim.collectionId) {
    // I don't think this will be supported ever.
    throw new Error('Claiming whole collection not yet supported');
  }
};
