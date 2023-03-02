import deepmerge from 'deepmerge';
import { stringify } from 'query-string';
import { createChoice } from '../../frontend/shared/capture-models/helpers/create-choice';
import { createDocument } from '../../frontend/shared/capture-models/helpers/create-document';
import { generateId } from '../../frontend/shared/capture-models/helpers/generate-id';
import { traverseDocument } from '../../frontend/shared/capture-models/helpers/traverse-document';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { RevisionRequest } from '../../frontend/shared/capture-models/types/revision-request';
import { ApiClient } from '../../gateway/api';
import {
  CrowdsourcingReview,
  CrowdsourcingReviewMerge,
  CrowdsourcingReviewMergeComplete,
} from '../../gateway/tasks/crowdsourcing-review';
import { CrowdsourcingTask } from '../../gateway/tasks/crowdsourcing-task';
import { CaptureModelSnippet } from '../../types/schemas/capture-model-snippet';
import { ModelSearch } from '../../types/schemas/search';
import { generateModelFields } from '../../utility/generate-model-fields';
import { traverseStructure } from '../../utility/traverse-structure';
import { BaseExtension, defaultDispose, ExtensionManager } from '../extension-manager';
import { ProjectTemplate } from '../projects/types';
import { DynamicData } from './DynamicDataSources/types';
import { CaptureModelExtension } from './extension';

export class CrowdsourcingApi implements BaseExtension {
  api: ApiClient;
  extensions: ExtensionManager<CaptureModelExtension> | null;
  private readonly dataSources: DynamicData[] = [];
  newApi: boolean;

  constructor(
    api: ApiClient,
    extensions: ExtensionManager<CaptureModelExtension> | null,
    dataSources: DynamicData[],
    newApi = true
  ) {
    this.api = api;
    this.extensions = extensions;
    this.dataSources = dataSources;
    this.newApi = newApi;
  }

  dispose() {
    defaultDispose(this);
    if (this.extensions) {
      this.extensions.dispose();
    }
  }

  getDataSources() {
    return this.dataSources;
  }

  async getCaptureModel(id: string, query?: { author?: string; published?: boolean }) {
    return this.api.request<{ id: string } & CaptureModel>(
      `/api/madoc/crowdsourcing/model/${id}${query ? `?${stringify(query)}` : ''}`
    );
  }

  async getAllCaptureModels(query?: {
    target_id?: string;
    target_type?: string;
    derived_from?: string;
    all_derivatives?: boolean;
  }) {
    return this.api.request<CaptureModelSnippet[]>(
      `/api/madoc/crowdsourcing/model${query ? `?${stringify(query)}` : ''}`
    );
  }

  async updateCaptureModel(id: string, captureModel: CaptureModel) {
    return this.api.request<{ id: string } & CaptureModel>(`/api/madoc/crowdsourcing/model/${id}`, {
      method: 'PUT',
      body: captureModel,
    });
  }

  async searchPublishedModelFields(
    target: { canvas?: string; manifest?: string; collection?: string },
    query: string,
    filters: {
      field_type?: string;
      selector_type?: string;
      parent_property?: string;
      capture_model_id?: string;
    }
  ) {
    const queryString = {
      ...target,
      q: query,
      ...filters,
    };

    return this.api.request<{
      results: ModelSearch[];
    }>(`/api/madoc/crowdsourcing/search/published?${stringify(queryString)}`);
  }

  async createCaptureModelFromTemplate(
    model: CaptureModel['document'],
    label?: string,
    options: {
      structure?: CaptureModel['structure'];
      processStructure?: (
        captureModel: Readonly<CaptureModel>
      ) =>
        | Promise<CaptureModel['structure'] | Readonly<CaptureModel['structure']> | undefined | void>
        | CaptureModel['structure']
        | Readonly<CaptureModel['structure']>
        | void
        | undefined;
    } = {}
  ) {
    const newModel = deepmerge({}, model, { clone: true });
    const updateId = (e: any) => {
      if (e.id) {
        e.id = generateId();
      }
    };
    traverseDocument(newModel, {
      visitEntity: updateId,
      visitField: updateId,
      visitSelector: updateId,
    });
    const modelFields = generateModelFields(newModel);
    let structure: CaptureModel['structure'] | undefined = undefined;
    if (options.structure) {
      structure = deepmerge({}, options.structure as any, { clone: true }) as CaptureModel['structure'];
      traverseStructure(structure, str => {
        str.id = generateId();
      });
    }

    const fullModel: CaptureModel = {
      id: generateId(),
      structure: structure
        ? structure
        : createChoice({
            label,
            items: [
              {
                id: generateId(),
                type: 'model',
                label: 'Default',
                fields: modelFields,
              },
            ],
          }),
      document: label
        ? {
            ...newModel,
            label,
          }
        : newModel,
    };

    if (options.processStructure) {
      const newStructure = await options.processStructure(fullModel);
      if (newStructure) {
        fullModel.structure = newStructure;
      }
    }

    return this.api.request<{ id: string } & CaptureModel>(`/api/madoc/crowdsourcing/model`, {
      method: 'POST',
      body: fullModel,
    });
  }

  async createCaptureModel(label: string) {
    return this.api.request<{ id: string } & CaptureModel>(`/api/madoc/crowdsourcing/model`, {
      method: 'POST',
      body: {
        id: generateId(),
        structure: createChoice({
          label,
          items: [
            {
              id: generateId(),
              type: 'model',
              label: 'Default',
              fields: [],
            },
          ],
        }),
        document: createDocument({ label }),
      },
    });
  }

  async importCaptureModel(model: CaptureModel) {
    return this.api.request<{ id: string } & CaptureModel>(`/api/madoc/crowdsourcing/model`, {
      method: 'POST',
      body: model,
    });
  }

  async deleteCaptureModel(id: string) {
    return this.api.request<{ id: string } & CaptureModel>(`/api/madoc/crowdsourcing/model/${id}`, {
      method: 'DELETE',
    });
  }

  async cloneCaptureModel(
    id: string,
    target: Array<{ id: string; type: string }>,
    projectTemplate?: { template: ProjectTemplate; config: any }
  ) {
    if (!this.extensions) {
      throw new Error('API must be enabled with extensions');
    }

    const newModel = await this.api.request<{ id: string } & CaptureModel>(
      `/api/madoc/crowdsourcing/model/${id}/clone`,
      {
        method: 'POST',
        body: {
          target,
        },
      }
    );

    if (
      projectTemplate &&
      projectTemplate.template &&
      projectTemplate.template.hooks &&
      projectTemplate.template.hooks.beforeCloneModel
    ) {
      try {
        await projectTemplate.template.hooks.beforeCloneModel({
          captureModel: newModel,
          api: this.api,
          config: projectTemplate.config,
        });
      } catch (e) {
        console.log('claim error', e);
        // no-op, let it continue.
      }
    }

    return this.extensions.dispatch<{ id: string } & CaptureModel, 'onCloneCaptureModel'>(
      'onCloneCaptureModel',
      newModel
    );
  }

  async forkCaptureModelRevision(
    captureModelId: string,
    revisionId: string,
    query?: { clone_mode?: 'EDIT_ALL_VALUES' | 'FORK_ALL_VALUES' | 'FORK_TEMPLATE' | 'FORK_INSTANCE' }
  ) {
    return this.api.request<RevisionRequest>(
      `/api/madoc/crowdsourcing/model/${captureModelId}/fork/${revisionId}${query ? `?${stringify(query)}` : ''}`
    );
  }

  async cloneCaptureModelRevision(captureModelId: string, revisionId: string) {
    return this.api.request<RevisionRequest>(`/api/madoc/crowdsourcing/model/${captureModelId}/clone/${revisionId}`);
  }

  async createCaptureModelRevision(req: RevisionRequest, status?: string) {
    return this.api.request<RevisionRequest>(`/api/madoc/crowdsourcing/model/${req.captureModelId}/revision`, {
      method: 'POST',
      body: status ? { ...req, revision: { ...req.revision, status } } : req,
    });
  }

  async updateCaptureModelRevision(req: RevisionRequest, status?: string) {
    return this.api.request<RevisionRequest>(`/api/madoc/crowdsourcing/revision/${req.revision.id}`, {
      method: 'PUT',
      body: status ? { ...req, revision: { ...req.revision, status } } : req,
    });
  }

  async getCaptureModelRevision(revisionId: string) {
    return this.api.request<RevisionRequest>(`/api/madoc/crowdsourcing/revision/${revisionId}`);
  }

  async approveCaptureModelRevision(revisionRequest: RevisionRequest) {
    return this.api.request<RevisionRequest>(`/api/madoc/crowdsourcing/revision/${revisionRequest.revision.id}`, {
      method: 'PUT',
      body: {
        ...revisionRequest,
        revision: {
          ...revisionRequest.revision,
          status: 'accepted',
          accepted: true,
        },
        status: 'accepted',
      },
    });
  }

  async reDraftCaptureModelRevision(revisionRequest: RevisionRequest) {
    return this.api.request<RevisionRequest>(`/api/madoc/crowdsourcing/revision/${revisionRequest.revision.id}`, {
      method: 'PUT',
      body: {
        ...revisionRequest,
        status: 'draft',
        revision: {
          ...revisionRequest.revision,
          status: 'draft',
          accepted: false,
        },
      },
    });
  }

  async deleteCaptureModelRevision(revisionRequest: string | RevisionRequest) {
    return this.api.request<void>(
      `/api/madoc/crowdsourcing/revision/${
        typeof revisionRequest === 'string' ? revisionRequest : revisionRequest.revision.id
      }`,
      {
        method: 'DELETE',
      }
    );
  }

  async reviewRejectSubmission({
    revisionRequest,
    userTaskId,
    message,
    statusText,
  }: {
    revisionRequest: RevisionRequest;
    userTaskId: string;
    message?: string;
    statusText?: string;
  }) {
    try {
      // Delete the revision
      await this.deleteCaptureModelRevision(revisionRequest);
    } catch (err) {
      // No-op
    }

    // Mark task as rejected
    await this.api.updateTask<CrowdsourcingTask>(userTaskId, {
      status: -1,
      status_text: statusText || 'Rejected',
      state: {
        rejectedMessage: message,
      },
    });
  }

  async reviewRequestChanges({
    userTaskId,
    message,
    revisionRequest,
    statusText,
  }: {
    message: string;
    revisionRequest: RevisionRequest;
    userTaskId: string;
    statusText?: string;
  }) {
    // Save this change to the revision.
    await this.reDraftCaptureModelRevision(revisionRequest);

    await this.api.updateTask<CrowdsourcingTask>(userTaskId, {
      // Mark the task as needing changes
      status: 4,
      status_text: statusText || 'changed requested',
      // Add the message to the task
      state: {
        changesRequested: message,
      },
    });
  }

  async reviewPrepareMerge({
    reviewTaskId,
    revision,
    toMerge,
    revisionTask,
  }: {
    reviewTaskId: string;
    revision: RevisionRequest;
    toMerge: string[];
    revisionTask: string;
  }) {
    if (!revision.captureModelId) {
      throw new Error('Invalid capture model');
    }
    // Fork of the chosen revision is created - this is not saved, only a GET request.
    const req = await this.cloneCaptureModelRevision(revision.captureModelId, revision.revision.id);

    await this.createCaptureModelRevision(req, 'draft');

    // Task is updated with forked version + chosen merges.
    await this.api.updateTask<CrowdsourcingReview>(reviewTaskId, {
      state: {
        currentMerge: {
          revisionId: revision.revision.id,
          revisionTaskId: revisionTask,
          mergeId: req.revision.id,
          toMerge,
        },
      },
    });

    return req;
  }

  async reviewApproveSubmission({
    userTaskId,
    revisionRequest,
    statusText,
    projectTemplate,
  }: {
    userTaskId: string;
    revisionRequest: RevisionRequest;
    statusText?: string;
    projectTemplate?: { template: ProjectTemplate; config: any };
  }) {
    // Revision is marked as approved
    const approvedRequest = await this.approveCaptureModelRevision(revisionRequest);

    // @todo this makes it so that only Admins can make these changes.
    //   This should instead be an API call for a capture model hook or should
    //   be called from the worker when a task is updated. That might be better.
    if (
      revisionRequest.captureModelId &&
      projectTemplate &&
      projectTemplate.template &&
      projectTemplate.template.hooks &&
      projectTemplate.template.hooks.onRevisionApproved
    ) {
      try {
        await projectTemplate.template.hooks.onRevisionApproved({
          api: this.api,
          captureModel: await this.getCaptureModel(revisionRequest.captureModelId),
          config: projectTemplate.config,
          revision: approvedRequest,
        });
      } catch (e) {
        console.log('Error reviewApproveSubmission', e);
      }
    }

    // Mark users task as approved.
    await this.api.updateTask<CrowdsourcingTask>(userTaskId, {
      status: 3,
      status_text: statusText || 'Approved',
      state: {
        changesRequested: '',
      },
    });
  }

  async reviewApproveAndRemoveSubmission({
    userTaskIds,
    revisionIdsToRemove,
    acceptedRevision,
    reviewTaskId,
    statusText,
  }: {
    userTaskIds: string[];
    revisionIdsToRemove: string[];
    acceptedRevision: RevisionRequest;
    reviewTaskId: string;
    statusText?: string;
  }) {
    await Promise.all(
      userTaskIds.map(userTaskId =>
        // User tasks are marked as approved
        this.api.updateTask<CrowdsourcingTask>(userTaskId, {
          status: 3,
          status_text: statusText || 'Approved',
          state: {
            changesRequested: '',
          },
        })
      )
    );
    await Promise.all(
      revisionIdsToRemove.map(
        // Remove other revisions.
        revision => this.deleteCaptureModelRevision(revision)
      )
    );
    // The chosen revision is saved.
    await this.approveCaptureModelRevision(acceptedRevision);
    // Updated review task.
    await this.api.updateTask(reviewTaskId, { status: 3, status_text: statusText || 'Approved' });
  }

  async reviewMergeSave(req: RevisionRequest) {
    // Save capture model revision as normal - no other changes.
    return this.updateCaptureModelRevision(req);
  }

  async reviewMergeDiscard({
    revision,
    reviewTaskId,
    merge,
  }: {
    revision: RevisionRequest | string;
    reviewTaskId: string;
    merge: CrowdsourcingReviewMerge;
  }) {
    try {
      // Remove the capture model revision.
      await this.deleteCaptureModelRevision(revision);
    } catch (e) {
      // This may fail if it is already deleted.
    }

    // Update the task state with a record of the discarded merge.
    const fullTask = await this.api.getTask<CrowdsourcingReview>(reviewTaskId);
    const existingMerges: CrowdsourcingReviewMergeComplete[] = fullTask.state?.merges || [];
    const merges: CrowdsourcingReviewMergeComplete[] = [
      ...existingMerges.filter(m => m.mergeId !== merge.mergeId),
      {
        ...merge,
        status: 'DISCARDED',
      },
    ];

    // Revert task state to pre-merge completely.
    await this.api.updateTask<CrowdsourcingReview>(reviewTaskId, {
      state: {
        currentMerge: null,
        merges,
      },
    });
  }
  async reviewMergeApprove({
    revision,
    reviewTaskId,
    toMergeRevisionIds,
    toMergeTaskIds,
    merge,
  }: {
    revision: RevisionRequest;
    merge: CrowdsourcingReviewMerge;
    reviewTaskId: string;
    toMergeTaskIds: string[];
    toMergeRevisionIds: string[];
  }) {
    // Save capture model revision as ACCEPTED
    await this.updateCaptureModelRevision(revision, 'accepted');

    // Update task state to cancel merge and store in "previousMerges" state.
    const fullTask = await this.api.getTask<CrowdsourcingReview>(reviewTaskId);

    const existingMerges: CrowdsourcingReviewMergeComplete[] = fullTask.state?.merges || [];
    const merges: CrowdsourcingReviewMergeComplete[] = [
      ...existingMerges.filter(m => m.mergeId !== merge.mergeId),
      {
        ...merge,
        status: 'MERGED',
      },
    ];

    await this.api.updateTask<CrowdsourcingReview>(reviewTaskId, {
      state: {
        currentMerge: null,
        merges,
      },
    });

    for (const delId of toMergeRevisionIds) {
      try {
        await this.deleteCaptureModelRevision(delId);
      } catch (err) {
        // May already be deleted.
      }
    }
    // Mark tasks as accepted.
    await Promise.all(
      toMergeTaskIds.map(taskId =>
        this.api.updateTask<CrowdsourcingTask>(taskId, {
          status_text: 'accepted',
          status: 3,
          state: {
            changesRequested: null,
            mergeId: merge.mergeId,
          },
        })
      )
    ).catch(err => {
      if (err && (!err.status || err.status !== 404)) {
        console.log(err);
      }
    });
  }

  async assignUserToReview(projectId: string | number, reviewId: string) {
    return this.api.request<{ user: { id: number; name: string }; reason: string }>(
      `/api/madoc/projects/${projectId}/reviews`,
      {
        method: 'POST',
        body: {
          task_id: reviewId,
        },
      }
    );
  }
}
