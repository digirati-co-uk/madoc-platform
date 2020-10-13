import { CaptureModelExtension } from '../extensions/capture-models/extension';
import { Paragraphs } from '../extensions/capture-models/Paragraphs/Paragraphs.extension';
import { ExtensionManager } from '../extensions/extension-manager';
import { SingleUser } from '../types/omeka/User';
import { ProjectConfiguration } from '../types/schemas/project-configuration';
import { SearchIngestRequest, SearchResponse, SearchQuery } from '../types/search';
import { NotFound } from '../utility/errors/not-found';
import { fetchJson } from './fetch-json';
import { BaseTask } from '../gateway/tasks/base-task';
import { CanvasNormalized, CollectionNormalized, Manifest } from '@hyperion-framework/types';
import { CreateCollection } from '../types/schemas/create-collection';
import { CollectionListResponse } from '../types/schemas/collection-list';
import { CollectionFull } from '../types/schemas/collection-full';
import { CreateManifest } from '../types/schemas/create-manifest';
import { ItemStructureList, ItemStructureListItem, UpdateStructureList } from '../types/schemas/item-structure-list';
import { CreateCanvas } from '../types/schemas/create-canvas';
import { ManifestListResponse } from '../types/schemas/manifest-list';
import { CrowdsourcingManifestTask } from './tasks/crowdsourcing-manifest-task';
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
import { CrowdsourcingTask } from './tasks/crowdsourcing-task';
import { ResourceClaim } from '../routes/projects/create-resource-claim';
import { RevisionRequest } from '@capture-models/types';
import { ProjectList } from '../types/schemas/project-list';
import { ProjectFull } from '../types/schemas/project-full';
import { UserDetails } from '../types/schemas/user-details';
import { ModelSearch } from '../types/schemas/search';
import {
  CrowdsourcingReview,
  CrowdsourcingReviewMerge,
  CrowdsourcingReviewMergeComplete,
} from './tasks/crowdsourcing-review';
import { CrowdsourcingCanvasTask } from './tasks/crowdsourcing-canvas-task';
import { ConfigResponse } from '../types/schemas/config-response';
import { ResourceLinkResponse } from '../database/queries/linking-queries';

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
  private captureModelExtensions: ExtensionManager<CaptureModelExtension>;

  constructor(options: {
    gateway: string;
    publicSiteSlug?: string;
    jwt?: string;
    asUser?: { userId?: number; siteId?: number };
    customerFetcher?: typeof fetchJson;
    customCaptureModelExtensions?: (api: ApiClient) => Array<CaptureModelExtension>;
  }) {
    this.gateway = options.gateway;
    this.jwt = options.jwt;
    this.user = options.asUser;
    this.isServer = !(globalThis as any).window;
    this.fetcher = options.customerFetcher || fetchJson;
    this.publicSiteSlug = options.publicSiteSlug;
    this.captureModelExtensions = new ExtensionManager(
      options.customCaptureModelExtensions ? options.customCaptureModelExtensions(this) : [new Paragraphs(this)]
    );
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
      if (response.status === 404) {
        throw new NotFound();
      }

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

      throw new ApiError(response.data.error, response.debugResponse);
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
  async getProjects(page?: number, query: { root_task_id?: string; published?: boolean } = {}) {
    return this.request<ProjectList>(`/api/madoc/projects?${stringify({ page, ...query })}`);
  }

  async getProject(id: number | string, query?: { published?: boolean }) {
    return this.request<ProjectFull>(`/api/madoc/projects/${id}${query ? `?${stringify(query)}` : ''}`);
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

  async getProjectTask(id: string | number) {
    return this.request<{
      id: string;
      task_id: string;
    }>(`/api/madoc/projects/${id}/task`);
  }

  async getProjectModel(projectId: string | number, subject: string) {
    return this.request<{
      subject: string;
      resource: { id: number; type: string };
      baseModel: string;
      model: null | {
        label: string;
        id: string;
      };
    }>(`/api/madoc/projects/${projectId}/models/${subject}`);
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

  async updateProjectStatus(id: number, status: number) {
    return this.request<any>(`/api/madoc/projects/${id}/status`, {
      method: 'PUT',
      body: {
        status,
      },
    });
  }

  async createResourceClaim(projectId: string | number, claim: ResourceClaim) {
    return this.request<{ claim: CrowdsourcingTask }>(`/api/madoc/projects/${projectId}/claim`, {
      method: 'POST',
      body: claim,
    });
  }

  async prepareResourceClaim(projectId: string | number, claim: ResourceClaim) {
    return this.request<{ claim: CrowdsourcingTask }>(`/api/madoc/projects/${projectId}/prepare-claim`, {
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
    return this.request<ConfigResponse<T>>(
      `/api/configurator/query?${stringify({ context, service }, { arrayFormat: 'none' })}`
    );
  }

  async getProjectConfiguration(projectId: number, siteUrn: string): Promise<Partial<ProjectConfiguration>> {
    const projectConfig = await this.getConfiguration<ProjectConfiguration>('madoc', [
      `urn:madoc:project:${projectId}`,
      siteUrn,
    ]);

    return projectConfig.config && projectConfig.config[0] && projectConfig.config[0].config_object
      ? projectConfig.config[0].config_object
      : {};
  }

  /// Search

  async search(searchTerm: string, pageQuery = 1, facetType?: string, facetValue?: string) {
    // Facet Types these are just one at a time for now, may switch to a post query with the json if a list!
    if (!searchTerm)
      return {
        results: [],
        pagination: {
          page: 1,
          totalResults: 0,
          totalPages: 1,
        },
        facets: [],
      };
    return await this.request<SearchResponse>(
      `/api/search/search?${stringify({ fulltext: searchTerm, page: pageQuery, facetType, facetValue })}`
    );
  }

  // IIIF.
  async getCollections(page = 0, parent?: number) {
    return this.request<CollectionListResponse>(`/api/madoc/iiif/collections?${stringify({ page, parent })}`);
  }

  async getManifests(page = 0, { parent, filter }: { parent?: number; filter?: string } = {}) {
    return this.request<ManifestListResponse>(`/api/madoc/iiif/manifests?${stringify({ page, parent, filter })}`);
  }

  async getManifestProjects(id: number, query?: { published?: boolean }) {
    return this.request<{ projects: ProjectSnippet[] }>(
      `/api/madoc/iiif/manifests/${id}/projects${query ? `?${stringify(query)}` : ''}`
    );
  }

  async getManifestLinking(id: number) {
    return this.request<{ linking: ResourceLinkResponse[] }>(`/api/madoc/iiif/manifests/${id}/linking`);
  }

  async getManifestCanvasLinking(
    id: number,
    query: { source?: string; format?: string; type?: string; property?: string; resource_id?: number } = {}
  ) {
    return this.request<{ linking: ResourceLinkResponse[] }>(
      `/api/madoc/iiif/manifests/${id}/canvas-linking${query ? `?${stringify(query)}` : ``}`
    );
  }

  async convertAltoToCaptureModel(alto: string) {
    return this.request<any>(`/api/okra/convert/mets-alto`, {
      method: 'POST',
      body: {
        ocr_data: alto,
      },
    });
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

  async getCollectionProjects(id: number, query?: { published?: boolean }) {
    return this.request<{ projects: ProjectSnippet[] }>(
      `/api/madoc/iiif/collections/${id}/projects${query ? `?${stringify(query)}` : ''}`
    );
  }

  async getCollectionStatistics(id: number) {
    return this.request<{ manifests: number; canvases: number }>(`/api/madoc/iiif/collections/${id}/statistics`);
  }

  async createManifest(manifest: Partial<Manifest>, source?: string, taskId?: string) {
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

  async getCollectionById(id: number, page = 0, type?: 'manifest' | 'collection', excluded?: number[]) {
    return this.request<CollectionFull>(
      `/api/madoc/iiif/collections/${id}${page || type || excluded ? `?${stringify({ type, page, excluded })}` : ''}`
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

  async getManifestById(id: number, page = 0, excluded?: number[]) {
    const query = page || excluded ? `?${stringify({ page, excluded }, { arrayFormat: 'comma' })}` : '';
    return this.request<ManifestFull>(`/api/madoc/iiif/manifests/${id}${query}`);
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
  async getCanvasLinking(id: number) {
    return this.request<{ linking: ResourceLinkResponse[] }>(`/api/madoc/iiif/canvases/${id}/linking`);
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
  async importManifestOcr(id: number, label: string) {
    return this.request<ImportManifestTask>(`/api/madoc/iiif/import/manifest-ocr`, {
      method: 'POST',
      body: {
        manifestId: id,
        label,
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

  async addLinkToResource(link: {
    link: ResourceLinkResponse['link'];
    property: string;
    source?: string;
    label?: string;
    resource_id: string;
  }) {
    return this.request<ResourceLinkResponse>(`/api/madoc/iiif/linking`, {
      method: 'POST',
      body: link,
    });
  }

  // User API
  async getUser(id: number) {
    return this.request<{ user: SingleUser }>(`/api/madoc/users/${id}`);
  }

  // Capture model API.
  async getCaptureModel(id: string, query?: { author?: string; published?: boolean }) {
    return this.request<{ id: string } & CaptureModel>(
      `/api/crowdsourcing/model/${id}${query ? `?${stringify(query)}` : ''}`
    );
  }

  async getAllCaptureModels(query?: { target_id?: string; target_type?: string; derived_from?: string }) {
    return this.request<CaptureModelSnippet[]>(`/api/crowdsourcing/model${query ? `?${stringify(query)}` : ''}`);
  }

  async updateCaptureModel(id: string, captureModel: CaptureModel) {
    return this.request<{ id: string } & CaptureModel>(`/api/crowdsourcing/model/${id}`, {
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

    return this.request<{
      results: ModelSearch[];
    }>(`/api/crowdsourcing/search/published?${stringify(queryString)}`);
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

  async importCaptureModel(model: CaptureModel) {
    return this.request<{ id: string } & CaptureModel>(`/api/crowdsourcing/model`, {
      method: 'POST',
      body: model,
    });
  }

  async deleteCaptureModel(id: string) {
    return this.request<{ id: string } & CaptureModel>(`/api/crowdsourcing/model/${id}`, {
      method: 'DELETE',
    });
  }

  parseModelTarget(inputTarget: CaptureModel['target']) {
    const target = (inputTarget || []).map(t => this.resolveUrn(t.id));
    const collection = target.find(item => item && item.type.toLowerCase() === 'collection');
    const manifest = target.find(item => item && item.type.toLowerCase() === 'manifest');
    const canvas = target.find(item => item && item.type.toLowerCase() === 'canvas');

    return { collection, manifest, canvas };
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
    return this.captureModelExtensions.dispatch<{ id: string } & CaptureModel, 'onCloneCaptureModel'>(
      'onCloneCaptureModel',
      await this.request<{ id: string } & CaptureModel>(`/api/crowdsourcing/model/${id}/clone`, {
        method: 'POST',
        body: {
          target,
        },
      })
    );
  }

  async forkCaptureModelRevision(
    captureModelId: string,
    revisionId: string,
    query?: { clone_mode?: 'EDIT_ALL_VALUES' | 'FORK_ALL_VALUES' | 'FORK_TEMPLATE' | 'FORK_INSTANCE' }
  ) {
    return this.request<RevisionRequest>(
      `/api/crowdsourcing/model/${captureModelId}/fork/${revisionId}${query ? `?${stringify(query)}` : ''}`
    );
  }

  async cloneCaptureModelRevision(captureModelId: string, revisionId: string) {
    return this.request<RevisionRequest>(`/api/crowdsourcing/model/${captureModelId}/clone/${revisionId}`);
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
        revision: {
          ...revisionRequest.revision,
          status: 'draft',
          accepted: false,
        },
      },
    });
  }

  async deleteCaptureModelRevision(revisionRequest: string | RevisionRequest) {
    return this.request<void>(
      `/api/crowdsourcing/revision/${
        typeof revisionRequest === 'string' ? revisionRequest : revisionRequest.revision.id
      }`,
      {
        method: 'DELETE',
      }
    );
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

  async randomlyAssignedCanvas(
    projectId: string | number,
    manifestId: number,
    { type = 'canvas', collectionId }: { collectionId?: number; type?: string } = {}
  ) {
    return this.request<{ remainingTasks: number; canvas: ItemStructureListItem; claim: CrowdsourcingTask }>(
      `/api/madoc/projects/${projectId}/random`,
      {
        method: 'POST',
        body: {
          collectionId,
          manifestId,
          type,
        },
      }
    );
  }

  async getTaskSubjects(
    id: string,
    subjects?: string[],
    query: { type?: string; assignee?: boolean; assigned_to?: string } = {},
    parentTask = false
  ) {
    return this.request<{ subjects: Array<{ subject: string; status: number; assignee_id?: string }> }>(
      `/api/tasks/${id}/subjects?${stringify(query)}`,
      {
        method: 'POST',
        body: {
          parentTask,
          subjects,
        },
      }
    );
  }

  async getTask<Task extends BaseTask = BaseTask>(
    id: string,
    query?: {
      all?: boolean;
      status?: number;
      type?: string;
      page?: number;
      assignee?: boolean;
      detail?: boolean;
      subjects?: string[];
    }
  ) {
    return this.request<Task & { id: string }>(
      `/api/tasks/${id}${query ? `?${stringify(query, { arrayFormat: 'bracket' })}` : ``}`
    );
  }

  /**
   * @deprecated use getTask instead.
   */
  async getTaskById<Task extends BaseTask>(
    id: string,
    all = true,
    status?: number,
    type?: string,
    page?: number,
    assignee?: boolean,
    detail?: boolean
  ) {
    return this.request<Task & { id: string }>(`/api/tasks/${id}?${stringify({ page, all, assignee, detail })}`);
  }

  async assignUserToTask(id: string, user: { id: string; name?: string }) {
    return this.updateTask(id, {
      assignee: user,
      status: 1,
      status_text: 'accepted',
    });
  }

  async assignUserToReview(projectId: string | number, reviewId: string) {
    return this.request<{ user: { id: number; name: string }; reason: string }>(
      `/api/madoc/projects/${projectId}/reviews`,
      {
        method: 'POST',
        body: {
          task_id: reviewId,
        },
      }
    );
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
      parent_task_id?: string;
      subject_parent?: string;
      subject?: string;
      type?: string;
      detail?: boolean;
      assignee?: string;
      per_page?: number;
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

  // Storage API.

  async saveStorageJson(bucket: string, fileName: string, json: any, isPublic = false) {
    return this.request<{
      success: boolean;
      stats: {
        modified: string;
        size: number;
      };
    }>(
      isPublic
        ? `/api/storage/data/${bucket}/public/${fileName.endsWith('.json') ? fileName : `${fileName}.json`}`
        : `/api/storage/data/${bucket}/${fileName.endsWith('.json') ? fileName : `${fileName}.json`}`,
      {
        method: 'POST',
        body: json,
      }
    );
  }

  async getStorageJsonDetails(bucket: string, fileName: string, isPublic = false) {
    return this.request<
      | {
          size: number;
          modified: string;
          public: true;
          public_url: string;
        }
      | {
          size: number;
          modified: string;
          public: false;
        }
    >(
      isPublic
        ? `/api/storage/details/${bucket}/public/${fileName.endsWith('.json') ? fileName : `${fileName}.json`}`
        : `/api/storage/details/${bucket}/${fileName.endsWith('.json') ? fileName : `${fileName}.json`}`
    );
  }

  async getStorageJsonData<T = any>(bucket: string, fileName: string, isPublic = false) {
    return this.request<T>(
      isPublic
        ? `/api/storage/data/${bucket}/public/${fileName.endsWith('.json') ? fileName : `${fileName}.json`}`
        : `/api/storage/data/${bucket}/${fileName.endsWith('.json') ? fileName : `${fileName}.json`}`
    );
  }

  // Review API
  async reviewRejectSubmission({
    revisionRequest,
    userTaskId,
    statusText,
  }: {
    revisionRequest: RevisionRequest;
    userTaskId: string;
    statusText?: string;
  }) {
    try {
      // Delete the revision
      await this.deleteCaptureModelRevision(revisionRequest);
    } catch (err) {
      // No-op
    }

    // Mark task as rejected
    await this.updateTask<CrowdsourcingTask>(userTaskId, {
      status: -1,
      status_text: statusText || 'Rejected',
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

    await this.updateTask<CrowdsourcingTask>(userTaskId, {
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
    await this.updateTask<CrowdsourcingReview>(reviewTaskId, {
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
  }: {
    userTaskId: string;
    revisionRequest: RevisionRequest;
    statusText?: string;
  }) {
    // Revision is marked as approved
    await this.approveCaptureModelRevision(revisionRequest);

    // Mark users task as approved.
    await this.updateTask<CrowdsourcingTask>(userTaskId, {
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
        this.updateTask<CrowdsourcingTask>(userTaskId, {
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
    await this.updateTask(reviewTaskId, { status: 3, status_text: statusText || 'Approved' });
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
    const fullTask = await this.getTaskById<CrowdsourcingReview>(reviewTaskId);
    const existingMerges: CrowdsourcingReviewMergeComplete[] = fullTask.state?.merges || [];
    const merges: CrowdsourcingReviewMergeComplete[] = [
      ...existingMerges.filter(m => m.mergeId !== merge.mergeId),
      {
        ...merge,
        status: 'DISCARDED',
      },
    ];

    // Revert task state to pre-merge completely.
    await this.updateTask<CrowdsourcingReview>(reviewTaskId, {
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
    const fullTask = await this.getTaskById<CrowdsourcingReview>(reviewTaskId);

    const existingMerges: CrowdsourcingReviewMergeComplete[] = fullTask.state?.merges || [];
    const merges: CrowdsourcingReviewMergeComplete[] = [
      ...existingMerges.filter(m => m.mergeId !== merge.mergeId),
      {
        ...merge,
        status: 'MERGED',
      },
    ];

    await this.updateTask<CrowdsourcingReview>(reviewTaskId, {
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
        this.updateTask<CrowdsourcingTask>(taskId, {
          status_text: 'accepted',
          status: 3,
          state: {
            changesRequested: null,
            mergeId: merge.mergeId,
          },
        })
      )
    ).catch(err => {
      console.log(err);
    });
  }

  // Search API
  async searchQuery(query: SearchQuery, page = 1, madoc_id?: string) {
    let data;
    if (query.facets && JSON.parse(query.facets)) {
      try {
        // uncomment for if testing against local version
        // const response = await fetch(
        //   `http://localhost:8000/api/search/search?${stringify({
        //     page: page,
        //   })}`,
        //   {
        //     method: 'post',
        //     body: JSON.stringify({ fulltext: query.fulltext, facets: JSON.parse(query.facets) }),
        //     headers: {
        //       Accept: 'application/json, text/plain',
        //       'Content-Type': 'application/json;charset=UTF-8',
        //     },
        //   }
        // );
        // data = await response.json();
        data = this.request<SearchResponse>(`/api/search/search?${stringify({ page, madoc_id })}`, {
          method: 'POST',
          body: { fulltext: query.fulltext, facets: JSON.parse(query.facets) },
        });
      } catch (err) {
        //
      }
    } else {
      // uncomment for if testing against local version
      // const response = await fetch(
      //   `http://localhost:8000/api/search/search?${stringify({
      //     page: page,
      //   })}`,
      //   {
      //     method: 'post',
      //     body: JSON.stringify({ fulltext: query.fulltext }),
      //     headers: {
      //       Accept: 'application/json, text/plain',
      //       'Content-Type': 'application/json;charset=UTF-8',
      //     },
      //   }
      // );
      // data = await response.json();
      data = this.request<SearchResponse>(`/api/search/search?${stringify({ page, madoc_id })}`, {
        method: 'POST',
        body: { fulltext: query.fulltext },
      });
    }
    return data;
  }

  async searchIngest(resource: SearchIngestRequest) {
    return this.request(`/api/search/iiif`, {
      method: 'POST',
      body: resource,
    });
  }

  async searchReIngest(resource: SearchIngestRequest) {
    return this.request(`/api/search/iiif`, {
      method: 'PUT',
      body: resource,
    });
  }

  async indexManifest(id: number) {
    return this.request(`/api/madoc/iiif/manifests/${id}/index`, {
      method: 'POST',
    });
  }

  async getIndexedManifestById(madoc_id: string) {
    return this.request<SearchResponse>(`/api/search/search?${stringify({ madoc_id })}`, {
      method: 'GET',
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

  async getSiteProjectCanvasModel(projectId: string | number, canvasId: number) {
    return this.publicRequest<{ model?: CaptureModel }>(`/madoc/api/projects/${projectId}/canvas-models/${canvasId}`);
  }

  async getSiteProjectCanvasTasks(projectId: string | number, canvasId: number) {
    return this.publicRequest<{
      canvasTask?: CrowdsourcingCanvasTask;
      manifestTask?: CrowdsourcingManifestTask;
      userTasks?: CrowdsourcingTask[];
      canUserSubmit?: boolean;
      totalContributors?: number;
      maxContributors?: number;
    }>(`/madoc/api/projects/${projectId}/canvas-tasks/${canvasId}`);
  }

  async getSiteProjectManifestTasks(projectId: string | number, manifestId: number) {
    return this.publicRequest<{
      manifestTask?: CrowdsourcingTask | CrowdsourcingManifestTask;
      userTasks?: CrowdsourcingTask[];
      canUserSubmit?: boolean;
      totalContributors?: number;
      maxContributors?: number;
    }>(`/madoc/api/projects/${projectId}/manifest-tasks/${manifestId}`);
  }

  async getUserDetails() {
    return this.publicRequest<UserDetails>(`/madoc/api/me`);
  }
}
