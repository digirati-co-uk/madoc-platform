import { fetchJson } from './fetch-json';
import { BaseTask } from '../gateway/tasks/base-task';
import { CanvasNormalized, CollectionNormalized, ManifestNormalized } from '@hyperion-framework/types';
import { CreateCollection } from '../types/schemas/create-collection';
import { CollectionListResponse } from '../types/schemas/collection-list';
import { CollectionFull } from '../types/schemas/collection-full';
import { CreateManifest } from '../types/schemas/create-manifest';
import { ItemStructureList, ItemStructureListItem, UpdateStructureList } from '../types/schemas/item-structure-list';
import { CreateCanvas } from '../types/schemas/create-canvas';
import { ManifestListResponse } from '../types/schemas/manifest-list';
import { ImportManifestTask } from './tasks/import-manifest';
import { ImportCollectionTask } from './tasks/import-collection';
import { ManifestFull } from '../types/schemas/manifest-full';
import { GetMetadata } from '../types/schemas/get-metadata';
import { MetadataUpdate } from '../types/schemas/metadata-update';
import { CanvasFull } from '../types/schemas/canvas-full';
import { CaptureModel } from '@capture-models/types';
import { createChoice, createDocument } from '@capture-models/helpers';
import { generateId } from '@capture-models/helpers';
import { stringify } from 'query-string';
import { CreateProject } from '../types/schemas/create-project';
import { ProjectSnippet } from '../types/schemas/project-snippet';
import { CaptureModelSnippet } from '../types/schemas/capture-model-snippet';
import { ApiError } from '../utility/errors/api-error';
import { Pagination } from '../types/schemas/_pagination';
import { CrowdsourcingTask } from '../types/tasks/crowdsourcing-task';
import { ResourceClaim } from '../routes/projects/create-resource-claim';
import { RevisionRequest } from '@capture-models/types';
import { ProjectList } from '../types/schemas/project-list';
import { ProjectListItem } from '../types/schemas/project-list-item';
import { ProjectFull } from '../types/schemas/project-full';
import { UserDetails } from '../types/schemas/user-details';

export class ApiClient {
  private readonly gateway: string;
  private readonly isServer: boolean;
  private readonly user?: { userId?: number; siteId?: number };
  private readonly fetcher: typeof fetchJson;
  private readonly publicSiteSlug?: string;
  private errorHandlers: Array<() => void> = [];
  private jwt?: string;
  private errorRecoveryHandlers: Array<() => void> = [];
  private isDown = false;
  private currentUser?: { scope: string[]; user: { id: string; name?: string } };

  constructor(options: {
    gateway: string;
    publicSiteSlug?: string;
    jwt?: string;
    asUser?: { userId?: number; siteId?: number };
    customerFetcher?: typeof fetchJson;
  }) {
    this.gateway = options.gateway;
    this.jwt = options.jwt;
    this.user = options.asUser;
    this.isServer = !(globalThis as any).window;
    this.fetcher = options.customerFetcher || fetchJson;
    this.publicSiteSlug = options.publicSiteSlug;
  }

  getCurrentUser() {
    if (this.isServer) {
      throw new Error('Can only be called from the browser.');
    }
    if (!this.isAuthorised() || !this.jwt) {
      return;
    }

    if (!this.currentUser) {
      const [, base64Payload] = this.jwt.split('.');

      if (!base64Payload) {
        return;
      }

      const payload = atob(base64Payload);
      const token = JSON.parse(payload);

      this.currentUser = {
        scope: token.scope.split(' '),
        user: {
          id: token.sub,
          name: token.name,
        },
      };
    }
    return this.currentUser;
  }

  getIsServer() {
    return this.isServer;
  }

  isAuthorised() {
    if (this.isServer) {
      return !!this.user;
    }

    return !!this.jwt;
  }

  onError(func: () => void) {
    if (this.errorHandlers.indexOf(func) === -1) {
      this.errorHandlers.push(func);
    }
    return () => {
      this.errorHandlers = this.errorHandlers.filter(e => e !== func);
    };
  }

  onErrorRecovery(func: () => void) {
    if (this.errorRecoveryHandlers.indexOf(func) === -1) {
      this.errorRecoveryHandlers.push(func);
    }
    return () => {
      this.errorRecoveryHandlers = this.errorRecoveryHandlers.filter(e => e !== func);
    };
  }

  async request<Return, Body = any>(
    endpoint: string,
    {
      method = 'GET',
      body,
      jwt = this.jwt,
      publicRequest = false,
    }: {
      method?: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
      body?: Body;
      jwt?: string;
      publicRequest?: boolean;
    } = {}
  ): Promise<Return> {
    if (!publicRequest && !jwt) {
      console.log(`Not authorised to ${method} ${endpoint}`);

      throw new ApiError('Not authorised');
    }

    const response = await this.fetcher<Return>(this.gateway, endpoint, {
      method,
      body,
      jwt: jwt,
      asUser: this.user,
    });

    if (response.error) {
      if (response.data.error === 'There was a problem proxying the request') {
        this.isDown = true;
        for (const err of this.errorHandlers) {
          err();
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
        // Always retry this error.
        return this.request(endpoint, { method, body, jwt });
      }

      if (response.status === 401 && !this.isServer) {
        const match = window.location.pathname.match(/s\/([^/]+)\//);
        if (match) {
          const [, slug] = match;
          const newTokenResponse = await fetchJson<{ token: string }>(this.gateway, `/s/${slug}/madoc/auth/refresh`, {
            method: 'POST',
            body: {
              token: jwt,
            },
            asUser: this.user,
          });

          if (newTokenResponse.error) {
            window.location.href = `/s/${slug}/madoc/login`;
            return {} as any;
          }

          this.jwt = newTokenResponse.data.token;
          // Still wait.
          await new Promise(resolve => setTimeout(resolve, 1000));

          return this.request(endpoint, { method, body, jwt: this.jwt });
        }
      }

      throw new ApiError(response.data.error);
    } else if (this.isDown) {
      for (const rec of this.errorRecoveryHandlers) {
        rec();
      }
      this.isDown = false;
    }

    return response.data;
  }

  getSiteSlug() {
    return this.publicSiteSlug;
  }

  async publicRequest<Return, Query = any, Body = any>(
    endpoint: string,
    query?: Query,
    {
      method = 'GET',
      body,
      jwt = this.jwt,
    }: {
      method?: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
      body?: Body;
      jwt?: string;
    } = {}
  ) {
    if (!this.publicSiteSlug) {
      throw new Error('Site slug not found');
    }

    const queryString = query ? `?${stringify(query)}` : '';

    return this.request<Return, Body>(`/s/${this.publicSiteSlug}${endpoint}${queryString}`, {
      method,
      body,
      jwt,
      publicRequest: true,
    });
  }

  asUser(user: { userId?: number; siteId?: number }): ApiClient {
    return new ApiClient({
      gateway: this.gateway,
      jwt: this.jwt,
      asUser: user,
      customerFetcher: this.fetcher,
      publicSiteSlug: this.publicSiteSlug,
    });
  }

  async getStatistics() {
    return this.request<{ collections: number; manifests: number; canvases: number; projects: number }>(
      `/api/madoc/iiif/statistics`
    );
  }

  // Projects.
  async getProjects(page?: number, query: { root_task_id?: string } = {}) {
    return this.request<ProjectList>(`/api/madoc/projects?${stringify({ page, ...query })}`);
  }

  async getProject(id: number | string) {
    return this.request<ProjectFull>(`/api/madoc/projects/${id}`);
  }

  async getProjectMetadata(id: number) {
    return this.request<GetMetadata>(`/api/madoc/projects/${id}/metadata`);
  }

  async getProjectStructure(id: number) {
    return this.request<{
      collectionId: number;
      items: ItemStructureListItem[];
    }>(`/api/madoc/projects/${id}/structure`);
  }

  async getProjectsByResource(resourceId: number, context: string[]) {
    throw new Error('Not yet implemented');
  }

  async getCrowdsourcingTasks(resourceId: number, context: string[]) {
    throw new Error('Not yet implemented'); // @todo might be covered elsewhere?
  }

  async createProject(project: CreateProject) {
    return this.request<any>(`/api/madoc/projects`, {
      method: 'POST',
      body: project,
    });
  }

  async updateProjectMetadata(id: number, metadata: MetadataUpdate) {
    return this.request<any>(`/api/madoc/projects/${id}/metadata`, {
      method: 'PUT',
      body: {
        metadata,
      },
    });
  }

  async createResourceClaim(projectId: string | number, claim: ResourceClaim) {
    return this.request<{ claim: CrowdsourcingTask }>(`/api/madoc/projects/${projectId}/claim`, {
      method: 'POST',
      body: claim,
    });
  }

  async saveResourceClaim(projectId: string | number, taskId: string, body: { status: number; revisionId?: string }) {
    return this.request<{ claim: CrowdsourcingTask }>(`/api/madoc/projects/${projectId}/claim/${taskId}`, {
      method: 'POST',
      body,
    });
  }

  async deleteResourceClaim(taskId: string) {
    throw new Error('Not yet implemented');
  }

  async getRandomManifest(projectId: number) {
    throw new Error('Not yet implemented');
  }

  async getRangeCanvas(projectId: number) {
    throw new Error('Not yet implemented');
  }

  async updateProjectConfiguration() {
    throw new Error('Not yet implemented');
  }

  async updateProjectStructure() {
    throw new Error('Not yet implemented');
  }

  async deleteProject(projectId: number) {
    throw new Error('Not yet implemented');
  }

  // Config service.
  async addConfiguration(service: string, context: string[], value: any) {
    return { endpoint: `/api/configurator/?${stringify({ context }, { arrayFormat: 'none' })}`, value };
    return this.request<any>(`/api/configurator/?${stringify({ context, service }, { arrayFormat: 'none' })}`, {
      method: 'POST',
      body: value,
    });
  }

  async getConfiguration<T = any>(service: string, context: string[]) {
    return this.request<T>(`/api/configurator/query?${stringify({ context, service }, { arrayFormat: 'none' })}`);
  }

  // IIIF.
  async getCollections(page = 0, parent?: number) {
    return this.request<CollectionListResponse>(`/api/madoc/iiif/collections?${stringify({ page, parent })}`);
  }

  async getManifests(page = 0, parent?: number) {
    return this.request<ManifestListResponse>(`/api/madoc/iiif/manifests?${stringify({ page, parent })}`);
  }

  async getManifestProjects(id: number) {
    return this.request<{ projects: ProjectSnippet[] }>(`/api/madoc/iiif/manifests/${id}/projects`);
  }

  async createCollection(collection: Partial<CollectionNormalized>, taskId?: string, flat?: boolean) {
    return this.request<{ id: number }, CreateCollection>(`/api/madoc/iiif/collections`, {
      body: {
        collection: collection,
        taskId,
        flat,
      },
      method: 'POST',
    });
  }

  async deleteCollection(id: number): Promise<void> {
    return this.request(`/api/madoc/iiif/collections/${id}`, {
      method: 'DELETE',
    });
  }

  async getCollectionProjects(id: number) {
    return this.request<{ projects: ProjectSnippet[] }>(`/api/madoc/iiif/collections/${id}/projects`);
  }

  async getCollectionStatistics(id: number) {
    return this.request<{ manifests: number; canvases: number }>(`/api/madoc/iiif/collections/${id}/statistics`);
  }

  async createManifest(manifest: Partial<ManifestNormalized>, source?: string, taskId?: string) {
    return this.request<{ id: number }, CreateManifest>(`/api/madoc/iiif/manifests`, {
      method: 'POST',
      body: {
        manifest,
        local_source: source,
        taskId,
      },
    });
  }

  async createCanvas(canvas: Partial<CanvasNormalized>, thumbnail?: string, source?: string) {
    return this.request<{ id: number }, CreateCanvas>(`/api/madoc/iiif/canvases`, {
      method: 'POST',
      body: {
        canvas,
        local_source: source,
        thumbnail,
      },
    });
  }

  async getCollectionById(id: number, page = 0, type?: 'manifest' | 'collection') {
    return this.request<CollectionFull>(
      `/api/madoc/iiif/collections/${id}${page || type ? `?${stringify({ type, page })}` : ''}`
    );
  }

  async getCollectionStructure(id: number) {
    return await this.request<ItemStructureList>(`/api/madoc/iiif/collections/${id}/structure`);
  }

  async updateCollectionStructure(id: number, item_ids: number[]) {
    return this.request<void, UpdateStructureList>(`/api/madoc/iiif/collections/${id}/structure`, {
      body: {
        item_ids,
      },
      method: 'PUT',
    });
  }

  async getManifestStructure(id: number) {
    return await this.request<ItemStructureList>(`/api/madoc/iiif/manifests/${id}/structure`);
  }

  async updateManifestStructure(id: number, item_ids: number[]) {
    return this.request<void, UpdateStructureList>(`/api/madoc/iiif/manifests/${id}/structure`, {
      body: {
        item_ids,
      },
      method: 'PUT',
    });
  }

  async getManifestById(id: number, page = 0) {
    return this.request<ManifestFull>(`/api/madoc/iiif/manifests/${id}${page ? `?page=${page}` : ''}`);
  }

  async getManifestCollections(id: number, query?: { project_id?: number }) {
    return this.request<{ collections: number[] }>(
      `/api/madoc/iiif/manifests/${id}/collections${query ? `?${stringify(query)}` : ''}`
    );
  }

  async getCollectionMetadata(id: number) {
    return this.request<GetMetadata>(`/api/madoc/iiif/collections/${id}/metadata`);
  }

  async getManifestMetadata(id: number) {
    return this.request<GetMetadata>(`/api/madoc/iiif/manifests/${id}/metadata`);
  }

  async autocompleteManifests(q: string) {
    return this.request<Array<{ id: number; label: string }>>(`/api/madoc/iiif/autocomplete/manifests?q=${q}`);
  }

  async autocompleteCollections(q: string) {
    return this.request<Array<{ id: number; label: string }>>(`/api/madoc/iiif/autocomplete/collections?q=${q}`);
  }

  async getCanvasMetadata(id: number) {
    return this.request<GetMetadata>(`/api/madoc/iiif/canvases/${id}/metadata`);
  }

  async updateCollectionMetadata(id: number, request: MetadataUpdate) {
    return this.request<void>(`/api/madoc/iiif/collections/${id}/metadata`, {
      method: 'PUT',
      body: request,
    });
  }

  async updateManifestMetadata(id: number, request: MetadataUpdate) {
    return this.request<void>(`/api/madoc/iiif/manifests/${id}/metadata`, {
      method: 'PUT',
      body: request,
    });
  }

  async updateCanvasMetadata(id: number, request: MetadataUpdate) {
    return this.request<void>(`/api/madoc/iiif/canvases/${id}/metadata`, {
      method: 'PUT',
      body: request,
    });
  }

  async importCollection(id: string, manifestIds: string[]) {
    return this.request<ImportCollectionTask>(`/api/madoc/iiif/import/collection`, {
      method: 'POST',
      body: {
        collection: id,
        manifestIds,
      },
    });
  }
  async importManifest(id: string) {
    return this.request<ImportManifestTask>(`/api/madoc/iiif/import/manifest`, {
      method: 'POST',
      body: {
        manifest: id,
      },
    });
  }
  async getCanvasById(id: number) {
    return this.request<CanvasFull>(`/api/madoc/iiif/canvases/${id}`);
  }

  async getCanvasManifests(id: number, query?: { project_id?: number }) {
    return this.request<{ manifests: number[] }>(
      `/api/madoc/iiif/canvases/${id}/manifests${query ? `?${stringify(query)}` : ''}`
    );
  }

  // Capture model API.
  async getCaptureModel(id: string, query?: { author?: string; published?: boolean }) {
    return this.request<{ id: string } & CaptureModel>(
      `/api/crowdsourcing/model/${id}${query ? `?${stringify(query)}` : ''}`
    );
  }

  // Capture model API.
  async getAllCaptureModels(query?: { target_id?: string; target_type?: string; derived_from?: string }) {
    return this.request<CaptureModelSnippet[]>(`/api/crowdsourcing/model${query ? `?${stringify(query)}` : ''}`);
  }

  // Capture model API.
  async updateCaptureModel(id: string, captureModel: CaptureModel) {
    return this.request<{ id: string } & CaptureModel>(`/api/crowdsourcing/model/${id}`, {
      method: 'PUT',
      body: captureModel,
    });
  }

  async createCaptureModel(label: string) {
    return this.request<{ id: string } & CaptureModel>(`/api/crowdsourcing/model`, {
      method: 'POST',
      body: {
        id: generateId(),
        structure: createChoice({ label }),
        document: createDocument(),
      },
    });
  }

  resolveUrn(urn: string) {
    const regex = /^urn:madoc:([A-Za-z]+):([\d]+)$/g;
    const match = regex.exec(urn);

    if (!match) {
      return;
    }

    return { id: Number(match[2]), type: match[1] };
  }

  async cloneCaptureModel(id: string, target: Array<{ id: string; type: string }>) {
    return this.request<{ id: string } & CaptureModel>(`/api/crowdsourcing/model/${id}/clone`, {
      method: 'POST',
      body: {
        target,
      },
    });
  }

  async createCaptureModelRevision(req: RevisionRequest, status?: string) {
    return this.request<RevisionRequest>(`/api/crowdsourcing/model/${req.captureModelId}/revision`, {
      method: 'POST',
      body: status ? { ...req, revision: { ...req.revision, status } } : req,
    });
  }

  async updateCaptureModelRevision(req: RevisionRequest, status?: string) {
    return this.request<RevisionRequest>(`/api/crowdsourcing/revision/${req.revision.id}`, {
      method: 'PUT',
      body: status ? { ...req, revision: { ...req.revision, status } } : req,
    });
  }

  async getCaptureModelRevision(revisionId: string) {
    return this.request<RevisionRequest>(`/api/crowdsourcing/revision/${revisionId}`);
  }

  async approveCaptureModelRevision(revisionRequest: RevisionRequest) {
    return this.request<RevisionRequest>(`/api/crowdsourcing/revision/${revisionRequest.revision.id}`, {
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
    return this.request<RevisionRequest>(`/api/crowdsourcing/revision/${revisionRequest.revision.id}`, {
      method: 'PUT',
      body: {
        ...revisionRequest,
        status: 'draft',
      },
    });
  }

  async deleteCaptureModelRevision(revisionRequest: RevisionRequest) {
    return this.request<void>(`/api/crowdsourcing/revision/${revisionRequest.revision.id}`, {
      method: 'DELETE',
    });
  }

  async updateTaskStatus<Task extends BaseTask>(
    taskId: string,
    availableStatuses: any,
    newStatus: string,
    data: { state?: any; name?: string; description?: string } = {}
  ) {
    const statusIdx = availableStatuses.indexOf(newStatus);

    return this.updateTask<Task>(taskId, {
      status: statusIdx,
      status_text: statusIdx === -1 ? 'error' : availableStatuses[statusIdx],
      ...data,
    } as Partial<Task>);
  }

  async getTaskStats(
    id: string,
    query?: { type?: string; root?: boolean; distinct_subjects?: boolean; user_id?: string }
  ) {
    return this.request<{ statuses: { [status: string]: number }; total: number }>(
      `/api/tasks/${id}/stats${query ? `?${stringify(query)}` : ''}`
    );
  }

  async getAllTaskStats(query?: { type?: string; root?: boolean; distinct_subjects?: boolean; user_id?: string }) {
    return this.request<{ statuses: { [status: string]: number }; total: number }>(
      `/api/tasks/stats${query ? `?${stringify(query)}` : ''}`
    );
  }

  // Tasks.
  async getTaskById<Task extends BaseTask>(
    id: string,
    all = true,
    status?: number,
    type?: string,
    page?: number,
    assignee?: boolean
  ) {
    return this.request<Task & { id: string }>(`/api/tasks/${id}?${stringify({ page, all, assignee })}`);
  }

  async getTasksByStatus<Task extends BaseTask>(status: number) {
    return this.request<{ tasks: Task[] }>(`/api/tasks/?status=${status}`);
  }

  async getTasksBySubject<Task extends BaseTask>(subject: string) {
    return this.request<{ tasks: Task[] }>(`/api/tasks/?subject=${subject}`);
  }

  async getTasksByType<Task extends BaseTask>(type: Task['type']) {
    return this.request<{ tasks: Task[] }>(`/api/tasks/?type=${type}`);
  }

  async updateTask<Task extends BaseTask>(id: string | undefined, task: Partial<Task>) {
    if (!id) {
      throw new Error('Task could not be updated');
    }
    return this.request<Task>(`/api/tasks/${id}`, {
      method: 'PATCH',
      body: task,
    });
  }

  async getTasks<TaskType extends BaseTask>(
    page?: number,
    query: {
      all?: boolean;
      all_tasks?: boolean;
      status?: number | number[];
      root_task_id?: string;
      subject?: string;
      type?: string;
    } = {}
  ) {
    return this.request<{ tasks: TaskType[]; pagination: Pagination }>(
      `/api/tasks?${stringify({ page: page || 1, ...query }, { arrayFormat: 'comma' })}`
    );
  }

  async acceptTask<Task extends BaseTask>(
    id: string,
    options?: {
      omitSubtasks?: boolean;
    }
  ) {
    return this.request<Task>(`/api/tasks/${id}/accept`, {
      method: 'POST',
      body: options,
    });
  }

  async newTask<Task extends BaseTask>(task: Partial<Task>, parentId?: string, customJwt?: string) {
    return this.request<{ id: string } & Task>(parentId ? `/api/tasks/${parentId}/subtasks` : `/api/tasks`, {
      method: 'POST',
      body: task,
      jwt: customJwt,
    });
  }

  async addSubtasks<Task extends BaseTask>(tasks: Partial<Task> | Partial<Task>[], parentId: string) {
    return this.request<Task>(`/api/tasks/${parentId}/subtasks`, {
      method: 'POST',
      body: tasks,
    });
  }

  // Public API.

  async getSiteCanvas(id: number, query?: import('../routes/site/site-canvas').SiteCanvasQuery) {
    return this.publicRequest<CanvasFull>(`/madoc/api/canvases/${id}`, query);
  }

  async getSiteCollection(id: number, query?: import('../routes/site/site-collection').SiteCollectionQuery) {
    return this.publicRequest<CollectionFull>(`/madoc/api/collections/${id}`, query);
  }

  async getSiteCollections(query?: import('../routes/site/site-collections').SiteCollectionQuery) {
    return this.publicRequest<CollectionListResponse>(`/madoc/api/collections`, query);
  }

  async getSiteManifest(id: number, query?: import('../routes/site/site-manifest').SiteManifestQuery) {
    return this.publicRequest<ManifestFull>(`/madoc/api/manifests/${id}`, query);
  }

  async getSiteManifestStructure(id: number) {
    return this.publicRequest<ItemStructureList>(`/madoc/api/manifests/${id}/structure`);
  }

  async getSiteManifests(query?: import('../routes/site/site-manifests').SiteManifestQuery) {
    return this.publicRequest<ManifestListResponse>(`/madoc/api/manifests`, query);
  }

  async getSitePage(path: string) {
    return this.publicRequest<any>(`/madoc/api/page/${path}`);
  }

  async getSiteProject(id: string | number) {
    return this.publicRequest<ProjectFull>(`/madoc/api/projects/${id}`);
  }

  async getSiteProjects(query?: import('../routes/site/site-projects').SiteProjectsQuery) {
    return this.publicRequest<ProjectList>(`/madoc/api/projects`, query);
  }

  async getUserDetails() {
    return this.publicRequest<UserDetails>(`/madoc/api/me`);
  }
}
