import { fetchJson } from './fetch-json';
import { BaseTask } from '../gateway/tasks/base-task';
import { CanvasNormalized, CollectionNormalized, ManifestNormalized } from '@hyperion-framework/types';
import { CreateCollection } from '../types/schemas/create-collection';
import { CollectionListResponse } from '../types/schemas/collection-list';
import { CollectionFull } from '../types/schemas/collection-full';
import { CreateManifest } from '../types/schemas/create-manifest';
import { ItemStructureList, UpdateStructureList } from '../types/schemas/item-structure-list';
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

export class ApiClient {
  private readonly gateway: string;
  private jwt: string;
  private readonly isServer: boolean;
  private readonly user?: { userId: number; siteId?: number };
  private fetcher: typeof fetchJson;

  constructor(
    gateway: string,
    jwt: string,
    asUser?: { userId: number; siteId?: number },
    customerFetcher?: typeof fetchJson
  ) {
    this.gateway = gateway;
    this.jwt = jwt;
    this.user = asUser;
    this.isServer = !(globalThis as any).window;
    this.fetcher = customerFetcher || fetchJson;
  }

  async request<Return, Body = any>(
    endpoint: string,
    {
      method = 'GET',
      body,
      jwt = this.jwt,
    }: { method?: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD'; body?: Body; jwt?: string } = {}
  ): Promise<Return> {
    const response = await this.fetcher<Return>(this.gateway, endpoint, {
      method,
      body,
      jwt: jwt,
      asUser: this.user,
    });

    if (response.error) {
      if (response.data.error === 'There was a problem proxying the request') {
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

      return response.data as any;
    }

    return response.data;
  }

  asUser(user: { userId: number; siteId?: number }): ApiClient {
    return new ApiClient(this.gateway, this.jwt, user);
  }

  // Projects.
  async getProjects(page: number) {
    return this.request<any[]>(`/api/madoc/projects?page=${page}`);
  }

  async getProject(id: number) {
    return this.request<any>(`/api/madoc/projects/${id}`);
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

  async createResourceClaim(projectId: number, resourceId: number, context: string[]) {
    throw new Error('Not yet implemented');
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

  async getConfiguration<T = any>(service: string, context: string[]): Promise<T> {
    return this.request<T>(`/api/configurator/?${stringify({ context, service }, { arrayFormat: 'none' })}`);
  }

  // IIIF.
  async getCollections(page = 0) {
    return this.request<CollectionListResponse>(`/api/madoc/iiif/collections${page ? `?page=${page}` : ''}`);
  }

  async getManifests(page = 0) {
    return this.request<ManifestListResponse>(`/api/madoc/iiif/manifests${page ? `?page=${page}` : ''}`);
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

  async getCollectionById(id: number, page: number) {
    return this.request<CollectionFull>(`/api/madoc/iiif/collections/${id}${page ? `?page=${page}` : ''}`);
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

  async getManifestById(id: number, page: number) {
    return this.request<ManifestFull>(`/api/madoc/iiif/manifests/${id}${page ? `?page=${page}` : ''}`);
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

  // Capture model API.
  async getCaptureModel(id: string) {
    return this.request<{ id: string } & CaptureModel>(`/api/crowdsourcing/model/${id}`);
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

  async updateTaskStatus(
    taskId: string,
    availableStatuses: any,
    newStatus: string,
    data: { state?: any; name?: string; description?: string } = {}
  ) {
    const statusIdx = availableStatuses.indexOf(newStatus);

    return this.updateTask(taskId, {
      status: statusIdx,
      status_text: statusIdx === -1 ? 'error' : availableStatuses[statusIdx],
      ...data,
    });
  }

  async getTaskStats(id: string) {
    return this.request<{ statuses: { [status: string]: number } }>(`/api/tasks/${id}/stats`);
  }

  // Tasks.
  async getTaskById<Task extends BaseTask>(id: string, all = true, page?: number): Promise<Task> {
    if (all) {
      return this.request<Task>(`/api/tasks/${id}?all=true`);
    }

    if (page) {
      return this.request<Task>(`/api/tasks/${id}?page=${page}`);
    }

    return this.request<Task>(`/api/tasks/${id}`);
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

  async getTasks(jwt?: string): Promise<{ tasks: BaseTask[] }> {
    return this.request(`/api/tasks?all=true`, { jwt });
  }

  async acceptTask<Task extends BaseTask>(id: string): Promise<Task> {
    return this.request(`/api/tasks/${id}/accept`, {
      method: 'POST',
    });
  }

  async newTask<Task extends BaseTask>(task: Partial<Task>, parentId?: string, customJwt?: string) {
    return this.request<{ id: string } & Task>(parentId ? `/api/tasks/${parentId}/subtasks` : `/api/tasks`, {
      method: 'POST',
      body: task,
      jwt: customJwt,
    });
  }

  async addSubtasks<Task extends BaseTask>(tasks: Partial<Task>[], parentId: string) {
    return this.request<Task>(`/api/tasks/${parentId}/subtasks`, {
      method: 'POST',
      body: tasks,
    });
  }
}
