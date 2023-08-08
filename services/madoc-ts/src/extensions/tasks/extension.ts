import { ApiClient } from '../../gateway/api';
import { BaseTask } from '../../gateway/tasks/base-task';
import { BaseExtension, defaultDispose } from '../extension-manager';
import { ProjectResolver } from './resolvers/project-resolver';
import { Resolver } from './resolvers/resolver';
import { SelectorThumbnailResolver } from './resolvers/selector-thumbnail';
import { SubjectResolver } from './resolvers/subject-resolver';

export class TaskExtension implements BaseExtension {
  api: ApiClient;
  resolvers: Resolver<any, any>[];

  constructor(api: ApiClient) {
    this.api = api;
    this.resolvers = [new SubjectResolver(api), new ProjectResolver(api), new SelectorThumbnailResolver(api)];
  }

  dispose() {
    defaultDispose(this);
  }

  // When you load a task we need to do the following:
  // - Check the type
  // - See if there is a metadata class
  // - See if the metadata is loaded
  // - If not loaded, request from API (public)
  // - If loaded parse the task and map it
  //
  //
  // What we need:
  // - A definition for metadata
  // - An endpoint to load metadata (and cache on task)

  async updateTaskMetadata(taskId: string, newMetadata: any) {
    return this.api.request<BaseTask>(`/api/tasks/${taskId}/metadata`, {
      method: 'PATCH',
      body: newMetadata,
    });
  }

  /**
   * Resolves remote metadata for a task.
   *
   * Requires normal API access. Should be added to `task.state.metadata`
   */
  async remoteMetadata<T extends BaseTask>(task: T, fresh = false) {
    const metadata: any = task.metadata || {};
    for (const resolver of this.resolvers) {
      if (fresh || !resolver.hasMetadata(task)) {
        const value = await resolver.resolve(task);
        metadata[resolver.getKey()] = value || null;
      }
    }
    return metadata;
  }

  requiresUpdate(task: BaseTask) {
    for (const resolver of this.resolvers) {
      if (!resolver.hasMetadata(task)) {
        return true;
      }
    }

    return false;
  }

  /**
   * Loads metadata either from the task or from an API endpoint.
   *
   * @param task
   */
  async getMetadata<T extends BaseTask>(task: T) {
    if (this.requiresUpdate(task)) {
      // then fetch from server.
      return await this.api.publicRequest<any>(`/madoc/api/task-metadata/${task.id}`);
    }

    return task.metadata;
  }

  // @todo Other task based APIS:
  //   - wrapTask
  //   - getProjectTask
  //   - updateTaskStatus
  //   - getTaskStats
  //   - getAllTaskStats
  //   - deleteTask
  //   - getTaskSubjects
  //   - getTask
  //   - getTaskById (deprecated)
  //   - assignUserToTask
  //   - assignUserToReview
  //   - getTasks
  //   - getTasksByStatus (deprecated)
  //   - getTasksBySubject (deprecated)
  //   - updateTask
  //   - acceptTask
  //   - newTask
  //   - addSubtasks

  // @todo Maybe to be moved.
  //   - createResourceClaim?
  //   - prepareResourceClaim?
  //   - saveResourceClaim?
  //   - reviewRejectSubmission
  //   - reviewRequestChanges
  //   - reviewPrepareMerge
  //   - reviewApproveSubmission
  //   - reviewApproveAndRemoveSubmission
  //   - reviewMergeSave
  //   - reviewMergeDiscard
  //   - reviewMergeApprove
}
