import { BaseField, CaptureModel, RevisionRequest } from '@capture-models/types';
import { createChoice, createDocument, generateId } from '@capture-models/helpers';
import {
  ActivityOptions,
  ActivityOrderedCollection,
  ActivityOrderedCollectionPage,
  ChangeDiscoveryActivityRequest,
} from '../activity-streams/change-discovery-types';
import { ConfigInjectionExtension } from '../extensions/capture-models/ConfigInjection/ConfigInjection.extension';
import { MADOC_MODEL_CONFIG } from '../extensions/capture-models/ConfigInjection/constants';
import { ConfigInjectionSettings } from '../extensions/capture-models/ConfigInjection/types';
import { DynamicDataSourcesExtension } from '../extensions/capture-models/DynamicDataSources/DynamicDataSources.extension';
import { DynamicData } from '../extensions/capture-models/DynamicDataSources/types';
import { CaptureModelExtension } from '../extensions/capture-models/extension';
import { Paragraphs } from '../extensions/capture-models/Paragraphs/Paragraphs.extension';
import { plainTextSource } from '../extensions/capture-models/DynamicDataSources/sources/Plaintext.source';
import { ExtensionManager } from '../extensions/extension-manager';
import { NotificationExtension } from '../extensions/notifications/extension';
import { defaultPageBlockDefinitions } from '../extensions/page-blocks/default-definitions';
import { PageBlockExtension } from '../extensions/page-blocks/extension';
import { MediaExtension } from '../extensions/media/extension';
import { SystemExtension } from '../extensions/system/extension';
import { TaskExtension } from '../extensions/tasks/extension';
import { ThemeExtension } from '../extensions/themes/extension';
import { FacetConfig } from '../frontend/shared/components/MetadataFacetEditor';
import { GetLocalisationResponse, ListLocalisationsResponse } from '../routes/admin/localisation';
import {CanvasDeletionSummary, ManifestDeletionSummary, ProjectDeletionSummary} from "../types/deletion-summary";
import { Site } from '../types/omeka/Site';
import { SingleUser } from '../types/omeka/User';
import { Pm2Status } from '../types/pm2';
import { ResourceLinkResponse } from '../types/schemas/linking';
import { ProjectConfiguration } from '../types/schemas/project-configuration';
import { SearchIngestRequest, SearchResponse, SearchQuery } from '../types/search';
import { SearchIndexable } from '../utility/capture-model-to-indexables';
import { NotFound } from '../utility/errors/not-found';
import { apiDefinitionIndex } from './api-definitions/_index';
import { ApiRequest } from './api-definitions/_meta';
import { validateApiRequest } from './api-definitions/_validate';
import { fetchJson } from './fetch-json';
import { BaseTask } from './tasks/base-task';
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
import { CanvasFull } from '../types/canvas-full';
import { stringify } from 'query-string';
import { CreateProject } from '../types/schemas/create-project';
import { ProjectSnippet } from '../types/schemas/project-snippet';
import { CaptureModelSnippet } from '../types/schemas/capture-model-snippet';
import { ApiError } from '../utility/errors/api-error';
import { Pagination } from '../types/schemas/_pagination';
import { CrowdsourcingTask } from './tasks/crowdsourcing-task';
import { ResourceClaim } from '../routes/projects/create-resource-claim';
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
import { ResourceLinkRow } from '../database/queries/linking-queries';
import { SearchIndexTask } from './tasks/search-index-task';
import { CollectionDeletionSummary } from '../types/deletion-summary';

export class ApiClient {
  private readonly gateway: string;
  private readonly isServer: boolean;
  private readonly user?: { userId?: number; siteId?: number };
  private readonly fetcher: typeof fetchJson;
  private readonly publicSiteSlug?: string;
  private errorHandlers: Array<() => void> = [];
  private jwt?: string;
  private jwtFunction?: () => string;
  private errorRecoveryHandlers: Array<() => void> = [];
  private isDown = false;
  private currentUser?: { scope: string[]; user: { id: string; name?: string } };
  private captureModelDataSources: DynamicData[];
  // Public.
  captureModelExtensions: ExtensionManager<CaptureModelExtension>;
  pageBlocks: PageBlockExtension;
  media: MediaExtension;
  tasks: TaskExtension;
  system: SystemExtension;
  themes: ThemeExtension;
  notifications: NotificationExtension;

  constructor(options: {
    gateway: string;
    publicSiteSlug?: string;
    jwt?: string | (() => string);
    asUser?: { userId?: number; siteId?: number; userName?: string };
    customerFetcher?: typeof fetchJson;
    customCaptureModelExtensions?: (api: ApiClient) => Array<CaptureModelExtension>;
  }) {
    this.gateway = options.gateway;
    this.jwtFunction = typeof options.jwt === 'string' ? undefined : options.jwt;
    this.jwt = typeof options.jwt === 'string' ? options.jwt : undefined;
    this.user = options.asUser;
    this.isServer = !(globalThis as any).window;
    this.fetcher = options.customerFetcher || fetchJson;
    this.publicSiteSlug = options.publicSiteSlug;
    this.pageBlocks = new PageBlockExtension(this, defaultPageBlockDefinitions);
    this.media = new MediaExtension(this);
    this.tasks = new TaskExtension(this);
    this.system = new SystemExtension(this);
    this.themes = new ThemeExtension(this);
    this.notifications = new NotificationExtension(this);
    this.captureModelDataSources = [plainTextSource];
    this.captureModelExtensions = new ExtensionManager(
      options.customCaptureModelExtensions
        ? options.customCaptureModelExtensions(this)
        : [
            // Allows for OCR to be detected and added to models
            new Paragraphs(this),
            // Allows for dynamic values to be applied to models
            new DynamicDataSourcesExtension(this, this.captureModelDataSources),
            // Allows for configuration to make last-minute changes to models.
            new ConfigInjectionExtension(this),
          ]
    );
  }

  private getJwt() {
    if (!this.jwt && this.jwtFunction) {
      this.jwt = this.jwtFunction();
    }

    return this.jwt;
  }

  resolveUrl(pathName: string) {
    if (pathName.startsWith('/')) {
      return `${this.gateway}${pathName}`;
    }
    return `${this.gateway}/${pathName}`;
  }

  getCurrentUser() {
    if (this.isServer) {
      throw new Error('Can only be called from the browser.');
    }

    const jwt = this.getJwt();

    if (!this.isAuthorised() || !jwt) {
      return;
    }

    if (!this.currentUser) {
      const [, base64Payload] = jwt.split('.');

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

    return !!this.getJwt();
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

  async wrapTask<After, Task extends BaseTask = BaseTask>(
    target: Promise<Task>,
    after: (task: Task) => Promise<After>,
    { interval = 1000, progress }: { interval?: number; progress?: (remaining: number) => void } = {}
  ): Promise<After> {
    const task = await target;
    const taskId = task?.id;

    if (!taskId) {
      throw new Error('Invalid task');
    }

    return new Promise((resolve, reject) => {
      let intervalId = 0;
      let loading = false;

      const tryReturn = () => {
        if (loading) {
          return;
        }
        loading = true;
        this.getTask(taskId, { all: true }).then(latestTask => {
          loading = false;
          if (latestTask.status === 3) {
            clearInterval(intervalId);
            resolve(after(latestTask as any));
            return;
          }
          if (latestTask.status === -1) {
            clearInterval(intervalId);
            reject(latestTask);
          }

          if (progress) {
            const remaining = latestTask.subtasks?.filter(t => t.status !== 3).length || 0;

            progress(remaining);
          }
        });
      };

      intervalId = setInterval(tryReturn, interval);
    });
  }

  async request<Return, Body = any>(
    endpoint: string,
    {
      method = 'GET',
      body,
      jwt = this.getJwt(),
      publicRequest = false,
      xml = false,
      plaintext = false,
      returnText = false,
      headers = {},
      raw = false,
      formData = false,
    }: {
      method?: 'GET' | 'PUT' | 'POST' | 'PATCH' | 'DELETE' | 'OPTIONS' | 'HEAD';
      body?: Body;
      jwt?: string;
      publicRequest?: boolean;
      xml?: boolean;
      plaintext?: boolean;
      returnText?: boolean;
      headers?: any;
      raw?: boolean;
      formData?: boolean;
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
      xml,
      plaintext,
      returnText,
      headers,
      raw,
      formData,
    });

    if (response.error) {
      if (response.status === 404) {
        throw new NotFound(`${method} ${endpoint} not found`);
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

          if (newTokenResponse.error || !newTokenResponse.data.token) {
            window.location.href = `/s/${slug}/madoc/login?redirect=${encodeURI(
              window.location.pathname + window.location.search
            )}`;

            throw new ApiError('Unknown error', response.debugResponse);
          }

          this.jwt = newTokenResponse.data.token;
          // Still wait.
          await new Promise(resolve => setTimeout(resolve, 1000));

          return this.request(endpoint, { method, body, jwt: this.jwt });
        }
      }

      if (response.status === 204 || response.status === 201) {
        return undefined as any;
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
      jwt = this.getJwt(),
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

  asUser(user: { userId?: number; siteId?: number; userName?: string }, options?: { siteSlug?: string }): ApiClient {
    return new ApiClient({
      gateway: this.gateway,
      jwt: this.getJwt(),
      asUser: user,
      customerFetcher: this.fetcher,
      publicSiteSlug: options && options.siteSlug ? options.siteSlug : this.publicSiteSlug,
    });
  }

  getCaptureModelDataSources() {
    return this.captureModelDataSources;
  }

  async getPm2Status() {
    return this.request<{ list: Pm2Status[] }>(`/api/madoc/pm2/list`);
  }

  async getMetadataKeys() {
    return this.request<{ metadata: Array<{ label: string; language: string; total_items: number }> }>(
      `/api/madoc/iiif/metadata-keys`
    );
  }
  async getMetadataValues(label: string) {
    return this.request<{ values: Array<{ value: string; label: string; language: string; total_items: number }> }>(
      `/api/madoc/iiif/metadata-values?label=${label}`
    );
  }

  async getStatistics() {
    return this.request<{ collections: number; manifests: number; canvases: number; projects: number }>(
      `/api/madoc/iiif/statistics`
    );
  }

  // Projects.
  async getProjects(
    page?: number,
    query: { root_task_id?: string; published?: boolean; capture_model_id?: string } = {}
  ) {
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

  async getProjectDeletionSummary(id: number) {
    return this.request<ProjectDeletionSummary>(`/api/madoc/iiif/projects/${id}/deletion-summary`);
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

  async revokeResourceClaimOnManifest(projectId: string | number, manifestId: number) {
    return this.request<{ claim: CrowdsourcingTask }>(`/api/madoc/projects/${projectId}/revoke-claim`, {
      method: 'POST',
      body: {
        manifestId,
      },
    });
  }

  async submitToCuratedFeed(projectId: string | number, manifestId: number) {
    return this.request(`/api/madoc/projects/${projectId}/feeds/curated`, {
      method: 'POST',
      body: {
        manifestId,
      },
    });
  }

  async submitToManifestFeed(projectId: string | number, manifestId: number) {
    return this.request(`/api/madoc/projects/${projectId}/feeds/manifest`, {
      method: 'POST',
      body: {
        manifestId,
      },
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

  // Locale.
  async getSiteLocales() {
    return this.publicRequest<ListLocalisationsResponse>(`/madoc/api/locales`);
  }
  async getSiteLocale(code: string, withTemplate?: boolean) {
    return this.publicRequest<GetLocalisationResponse>(
      `/madoc/api/locales/${code}${withTemplate ? `?show_empty=true` : ''}`
    );
  }

  async updateSiteLocale(code: string, json: any) {
    return this.request<GetLocalisationResponse>(`/api/madoc/locales/${code}`, {
      method: 'POST',
      body: json,
    });
  }

  // Config service.
  async addConfiguration(service: string, context: string[], value: any) {
    return this.request<any>(`/api/configurator/`, {
      method: 'POST',
      body: {
        service: service,
        config_context: context,
        config_data: value,
      },
    });
  }

  async replaceConfiguration(id: string, eTag: string, value: any) {
    return this.request<any>(`/api/configurator/${id}/`, {
      method: 'PUT',
      body: value,
      headers: {
        'If-Match': eTag,
      },
    });
  }

  async getSingleConfigurationRaw(id: string) {
    return this.request<Response>(`/api/configurator/${id}/`, {
      raw: true,
    });
  }

  async getConfiguration<T = any>(service: string, context: string[]) {
    return this.request<ConfigResponse<T>>(
      `/api/configurator/query?${stringify({ context, service }, { arrayFormat: 'none' })}`
    );
  }

  async getProjectConfiguration(projectId: number, siteUrn: string): Promise<Partial<ProjectConfiguration>> {
    const projectConfig = await this.getConfiguration<ProjectConfiguration>('madoc', [
      siteUrn,
      `urn:madoc:project:${projectId}`,
    ]);

    return projectConfig.config && projectConfig.config[0] && projectConfig.config[0].config_object
      ? projectConfig.config[0].config_object
      : {};
  }

  async getModelConfiguration(query: import('../routes/site/site-model-configuration').SiteModelConfigurationQuery) {
    return this.request<ConfigInjectionSettings>(`/api/madoc/configuration/model?${stringify(query)}`);
  }

  async saveSiteConfiguration(config: ProjectConfiguration, query?: { project_id?: number; collection_id?: number }) {
    return this.request<ProjectConfiguration>(`/api/madoc/configuration${query ? `?${stringify(query)}` : ''}`, {
      method: 'POST',
      body: config,
    });
  }

  async saveFacetConfiguration(facets: FacetConfig[]) {
    return this.request<{ facets: FacetConfig[] }>(`/api/madoc/configuration/search-facets`, {
      method: 'POST',
      body: { facets },
    });
  }

  async saveMetadataConfiguration(metadata: FacetConfig[]) {
    return this.request<{ metadata: FacetConfig[] }>(`/api/madoc/configuration/metadata`, {
      method: 'POST',
      body: { metadata },
    });
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

  async getSearchQuery(query: SearchQuery, page = 1, madoc_id?: string) {
    return this.searchQuery(query, page, madoc_id);
  }

  // IIIF.
  async getCollections(page = 0, parent?: number, onlyPublished?: boolean) {
    return this.request<CollectionListResponse>(
      `/api/madoc/iiif/collections?${stringify({ page, parent, published: onlyPublished })}`
    );
  }

  async getCollectionDeletionSummary(id: number) {
    return this.request<CollectionDeletionSummary>(`/api/madoc/iiif/collections/${id}/deletion-summary`);
  }

  async getManifests(
    page = 0,
    {
      parent,
      filter,
      query,
      onlyPublished,
    }: { parent?: number; filter?: string; query?: string; onlyPublished?: boolean } = {}
  ) {
    return this.request<ManifestListResponse>(
      `/api/madoc/iiif/manifests?${stringify({ page, parent, filter, query, published: onlyPublished })}`
    );
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

  async convertHOCRToCaptureModel(hocr: string) {
    return this.request<any>(`/api/okra/convert/hocr`, {
      method: 'POST',
      body: {
        ocr_data: hocr,
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

  async getManifestDeletionSummary(id: number) {
    return this.request<ManifestDeletionSummary>(`/api/madoc/iiif/manifests/${id}/deletion-summary`);
  }

  async deleteManifest(id: number): Promise<void> {
    return this.request(`/api/madoc/iiif/manifests/${id}`, {
      method: 'DELETE',
    });
  }

  async getManifestCollections(id: number, query?: { project_id?: number; flat?: boolean }) {
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

  async autocompleteManifests(q: string, project_id?: string, blacklist_ids?: number[], page = 1) {
    return this.request<Array<{ id: number; label: string }>>(
      `/api/madoc/iiif/autocomplete/manifests?${stringify(
        { q, project_id, blacklist_ids, page },
        { arrayFormat: 'comma' }
      )}`
    );
  }

  async autocompleteCollections(q: string, project_id?: string, blacklist_ids?: number[], page = 1) {
    return this.request<Array<{ id: number; label: string }>>(
      `/api/madoc/iiif/autocomplete/collections?${stringify(
        { q, project_id, blacklist_ids, page },
        { arrayFormat: 'comma' }
      )}`
    );
  }

  async getCanvasMetadata(id: number) {
    return this.request<GetMetadata>(`/api/madoc/iiif/canvases/${id}/metadata`);
  }

  async getCanvasLinking(id: number) {
    return this.request<{ linking: ResourceLinkResponse[] }>(`/api/madoc/iiif/canvases/${id}/linking`);
  }

  async getCanvasPlaintext(id: number) {
    return this.request<{ found: boolean; transcription: string }>(`/api/madoc/iiif/canvases/${id}/plaintext`);
  }

  async getCanvasDeletionSummary(id: number) {
    return this.request<CanvasDeletionSummary>(`/api/madoc/iiif/canvases/${id}/deletion-summary`);
  }

  async deleteCanvas(id: number): Promise<void> {
    return this.request(`/api/madoc/iiif/canvases/${id}`, {
      method: 'DELETE',
    });
  }

  async getLinkingProperty(id: number) {
    return this.request<ResourceLinkResponse>(`/api/madoc/`);
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

  async publishManifest(id: number, isPublished = true) {
    return this.request<void>(`/api/madoc/iiif/manifests/${id}/publish`, {
      method: 'POST',
      body: {
        isPublished,
      },
    });
  }

  async publishCollection(id: number, isPublished = true) {
    return this.request<void>(`/api/madoc/iiif/collections/${id}/publish`, {
      method: 'POST',
      body: {
        isPublished,
      },
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

  async getCanvasSource(source: string) {
    return this.request<{ id: number }>(`/api/madoc/iiif/canvas-source?source_id=${source}`);
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

  async getAllCaptureModels(query?: {
    target_id?: string;
    target_type?: string;
    derived_from?: string;
    all_derivatives?: boolean;
  }) {
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

  // Personal notes
  async getPersonalNote(project: string | number, resourceId: number) {
    return this.request<{ note: string }>(`/api/madoc/projects/${project}/personal-notes/${resourceId}`);
  }

  async updatePersonalNote(project: string | number, resourceId: number, note: string) {
    return this.request(`/api/madoc/projects/${project}/personal-notes/${resourceId}`, {
      method: 'PUT',
      body: {
        note,
      },
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

  async deleteSubtasks(id: string) {
    await this.request(`/api/tasks/${id}/subtasks`, {
      method: 'DELETE',
    });
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

  async deleteTask(id: string) {
    await this.request(`/api/tasks/${id}`, {
      method: 'DELETE',
    });
  }

  async randomlyAssignedCanvas(
    projectId: string | number,
    {
      manifestId,
      collectionId,
      claim = true,
    }: { collectionId?: number; manifestId?: number; type?: string; claim?: boolean } = {}
  ) {
    return this.request<{
      remainingTasks: number;
      canvas: ItemStructureListItem;
      manifest: number;
      claim: CrowdsourcingTask;
    }>(`/api/madoc/projects/${projectId}/random`, {
      method: 'POST',
      body: {
        collectionId,
        manifestId,
        type: 'canvas',
        claim,
      },
    });
  }

  async randomlyAssignedManifest(
    projectId: string | number,
    { collectionId }: { collectionId?: number; type?: string } = {}
  ) {
    return this.request<{
      remainingTasks: number;
      manifest: number;
      claim: CrowdsourcingTask;
    }>(`/api/madoc/projects/${projectId}/random`, {
      method: 'POST',
      body: {
        collectionId,
        type: 'manifest',
        claim: false,
      },
    });
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

  async userAutocomplete(q: string, roles?: string[]) {
    return this.request<{
      users: Array<{
        id: number;
        name: string;
        role?: string;
      }>;
    }>(`/api/madoc/users?${stringify({ q, roles }, { arrayFormat: 'comma' })}`, {
      method: 'GET',
    });
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

  async unassignTask(taskId: string) {
    return this.request<BaseTask>(`/api/tasks/${taskId}/unassign`, {
      method: 'POST',
    });
  }

  async createDelegatedRequest(request: ApiRequest<any, any>, subject?: string) {
    return this.request(subject ? `/api/madoc/delegated?subject=${subject}` : `/api/madoc/delegated`, {
      method: 'POST',
      body: request,
    });
  }

  async runDelegatedRequest(id: string) {
    return this.request(`/api/madoc/delegated/${id}`, {
      method: 'POST',
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
      sort_by?: 'newest';
      modified_date_start?: Date;
      modified_date_end?: Date;
      modified_date_interval?: string;
      created_date_start?: Date;
      created_date_end?: Date;
      created_date_interval?: string;
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

  async saveStorageXml(bucket: string, fileName: string, xml: string, isPublic = false) {
    return this.request<{
      success: boolean;
      stats: {
        modified: string;
        size: number;
      };
    }>(
      isPublic
        ? `/api/storage/data/${bucket}/public/${fileName.endsWith('.xml') ? fileName : `${fileName}.xml`}`
        : `/api/storage/data/${bucket}/${fileName.endsWith('.xml') ? fileName : `${fileName}.xml`}`,
      {
        method: 'POST',
        body: xml,
        xml: true,
      }
    );
  }

  async saveStoragePlainText(bucket: string, fileName: string, text: string, isPublic = false) {
    return this.request<{
      success: boolean;
      stats: {
        modified: string;
        size: number;
      };
    }>(
      isPublic
        ? `/api/storage/data/${bucket}/public/${fileName.endsWith('.txt') ? fileName : `${fileName}.txt`}`
        : `/api/storage/data/${bucket}/${fileName.endsWith('.txt') ? fileName : `${fileName}.txt`}`,
      {
        method: 'POST',
        body: text,
        plaintext: true,
      }
    );
  }

  async convertLinkingProperty(id: number) {
    return this.request<{
      link: ResourceLinkRow;
    }>(`/api/madoc/iiif/linking/${id}/convert`, {
      method: 'POST',
    });
  }

  async getStorageRaw(bucket: string, fileName: string, isPublic = false) {
    return this.request<Response>(
      isPublic ? `/api/storage/data/${bucket}/public/${fileName}` : `/api/storage/data/${bucket}/${fileName}`,
      {
        raw: true,
      }
    );
  }

  async getStorageXmlData<T = any>(bucket: string, fileName: string, isPublic = false) {
    return this.request<T>(
      isPublic
        ? `/api/storage/data/${bucket}/public/${fileName.endsWith('.xml') ? fileName : `${fileName}.xml`}`
        : `/api/storage/data/${bucket}/${fileName.endsWith('.xml') ? fileName : `${fileName}.xml`}`,
      {
        xml: true,
        returnText: true,
      }
    );
  }

  async deleteStorageItem(bucket: string, fileName: string, isPublic = false) {
    // deleteFile
    return this.request(
      isPublic ? `/api/storage/details/${bucket}/public/${fileName}` : `/api/storage/details/${bucket}/${fileName}`,
      {
        method: 'DELETE',
      }
    );
  }

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
      if (err && (!err.status || err.status !== 404)) {
        console.log(err);
      }
    });
  }

  async getSiteDetails(siteId: number) {
    return this.request<Site>(`/api/madoc/site/${siteId}/details`);
  }

  // Activity stream
  postToActivityStream(
    {
      primaryStream,
      secondaryStream,
      action,
    }: {
      primaryStream: string;
      secondaryStream?: string;
      action: 'create' | 'update' | 'delete' | 'move' | 'add' | 'remove';
    },
    request: ChangeDiscoveryActivityRequest,
    options?: ActivityOptions
  ) {
    const body = { ...request, options };

    if (secondaryStream) {
      return this.request(`/api/madoc/activity/${primaryStream}/stream/${secondaryStream}/action/${action}`, {
        method: 'POST',
        body,
      });
    }

    return this.request(`/api/madoc/activity/${primaryStream}/action/${action}`, {
      method: 'POST',
      body,
    });
  }

  getActivityStream(options: { primaryStream: string; secondaryStream?: string }): Promise<ActivityOrderedCollection>;
  getActivityStream(options: {
    primaryStream: string;
    secondaryStream?: string;
    page: number;
  }): Promise<ActivityOrderedCollectionPage>;
  getActivityStream({
    primaryStream,
    secondaryStream,
    page,
  }: {
    primaryStream: string;
    secondaryStream?: string;
    page?: number;
  }) {
    if (typeof page !== 'undefined') {
      if (secondaryStream) {
        return this.request(`/api/madoc/activity/${primaryStream}/stream/${secondaryStream}/page/${page}`);
      }

      return this.request(`/api/madoc/activity/${primaryStream}/page/${page}`);
    }

    if (secondaryStream) {
      return this.request(`/api/madoc/activity/${primaryStream}/stream/${secondaryStream}/changes`);
    }

    return this.request(`/api/madoc/activity/${primaryStream}/changes`);
  }

  // Search API
  async searchQuery(query: SearchQuery, page = 1, madoc_id?: string) {
    return this.request<SearchResponse>(`/api/search/search?${stringify({ page, madoc_id })}`, {
      method: 'POST',
      body: query,
    });
  }
  // can be used for both canvases and manifests
  async searchIngest(resource: SearchIngestRequest) {
    return this.request<SearchIndexTask>(`/api/search/iiif`, {
      method: 'POST',
      body: resource,
    });
  }

  async searchReIngest(resource: SearchIngestRequest) {
    return this.request<SearchIndexTask>(`/api/search/iiif/${resource.id}`, {
      method: 'PUT',
      body: resource,
    });
  }

  async fullSearchIndex() {
    return this.request<BaseTask>(`/api/madoc/iiif/reindex`, {
      method: 'POST',
    });
  }

  async indexCaptureModel(
    id: string,
    contentId: string,
    resource: CaptureModel | { [term: string]: Array<BaseField> | Array<Document> }
  ) {
    const modelPayload: {
      resource_id: string;
      content_id: string;
      resource: CaptureModel | { [term: string]: Array<BaseField> | Array<Document> };
    } = {
      resource_id: contentId,
      content_id: id,
      resource: resource,
    };

    return this.request<any>(`/api/search/model`, {
      method: 'POST',
      body: modelPayload,
    });
  }

  // Search index api
  async indexManifest(id: number) {
    try {
      return this.request<SearchIndexTask>(`/api/madoc/iiif/manifests/${id}/index`, {
        method: 'POST',
      });
    } catch (err) {
      // no-op this will fail silently.
      return undefined;
    }
  }

  async getIndexedManifestById(madoc_id: string) {
    return this.request<SearchResponse>(`/api/search/search?${stringify({ madoc_id })}`, {
      method: 'GET',
    });
  }

  async searchListIndexables() {
    return this.request(`/api/search/indexables`);
  }

  async searchGetIndexable(id: number) {
    return this.request(`/api/search/indexables/${id}`);
  }

  async searchListModels(query?: { iiif__madoc_id?: string }) {
    return this.request(`/api/search/model?${query ? stringify(query) : ''}`);
  }

  async searchGetModel(id: number) {
    return this.request(`/api/search/model/${id}`);
  }

  async searchListIIIF() {
    return this.request(`/api/search/iiif`);
  }

  async searchGetIIIF(id: string) {
    try {
      return this.request(`/api/search/iiif/${id}`);
    } catch (err) {
      return undefined;
    }
  }

  async searchListContexts() {
    return this.request(`/api/search/contexts`);
  }

  async searchGetContext(id: string) {
    return this.request(`/api/search/contexts/${id}`);
  }

  async indexRawSearchIndexable(indexable: SearchIndexable) {
    return this.request(`/api/search/indexables`, {
      method: 'POST',
      body: indexable,
    });
  }

  async indexCanvas(id: number) {
    try {
      await this.request<SearchIndexTask>(`/api/madoc/iiif/canvases/${id}/index`, {
        method: 'POST',
      });
    } catch (err) {
      // no-op this will fail silently.
    }
  }

  async getIndexedCanvasById(madoc_id: string) {
    return this.request<SearchResponse>(`/api/search/search?${stringify({ madoc_id })}`, {
      method: 'GET',
    });
  }

  async batchIndexResources(
    resources: Array<{ id: number; type: string }>,
    config: { indexAllResources?: boolean; recursive?: boolean; resourceStack?: number[] } = {}
  ) {
    return this.request<BaseTask>(`/api/madoc/iiif/batch-index`, {
      method: 'POST',
      body: {
        resources,
        config,
      },
    });
  }

  // Public API.
  async getSiteCanvas(id: number, query?: import('../routes/site/site-canvas').SiteCanvasQuery) {
    return this.publicRequest<CanvasFull>(`/madoc/api/canvases/${id}`, query);
  }

  async getSiteCanvasSource(source: string) {
    return this.publicRequest<{ id: number }>(`/madoc/api/canvas-source`, {
      source_id: source,
    });
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

  async getSiteConfiguration(query?: import('../routes/site/site-configuration').SiteConfigurationQuery) {
    return this.publicRequest<ProjectConfiguration>(`/madoc/api/configuration`, query);
  }

  async getSiteModelConfiguration(
    query: import('../routes/site/site-model-configuration').SiteModelConfigurationQuery
  ) {
    return this.publicRequest<ConfigInjectionSettings>(`/madoc/api/configuration/model`, query);
  }

  async getSiteSearchFacetConfiguration() {
    return this.publicRequest<{ facets: FacetConfig[] }>(`/madoc/api/configuration/search-facets`);
  }

  async getSiteMetadataConfiguration(query?: { project_id?: string; collection_id?: number }) {
    return this.publicRequest<{ metadata: FacetConfig[] }>(`/madoc/api/configuration/metadata`, query);
  }

  async getSiteCanvasPublishedModels(
    canvasId: number,
    query?: import('../routes/site/site-published-models').SitePublishedModelsQuery
  ) {
    return this.publicRequest<any>(`/madoc/api/canvases/${canvasId}/models`, query);
  }

  async getSiteSearchQuery(query: SearchQuery, page = 1, madoc_id?: string) {
    return this.publicRequest<SearchResponse>(
      `/madoc/api/search`,
      { page, madoc_id },
      {
        method: 'POST',
        body: query,
      }
    );
  }

  async getSiteProjectCanvasTasks(projectId: string | number, canvasId: number) {
    return this.publicRequest<{
      canvasTask?: CrowdsourcingCanvasTask;
      manifestTask?: CrowdsourcingManifestTask;
      userTasks?: CrowdsourcingTask[];
      canUserSubmit?: boolean;
      totalContributors?: number;
      maxContributors?: number;
      isManifestComplete?: boolean;
    }>(`/madoc/api/projects/${projectId}/canvas-tasks/${canvasId}`);
  }

  async getSiteProjectManifestTasks(projectId: string | number, manifestId: number) {
    return this.publicRequest<{
      manifestTask?: CrowdsourcingTask | CrowdsourcingManifestTask;
      userManifestTask?: CrowdsourcingTask;
      canClaimManifest?: boolean;
      userTasks?: CrowdsourcingTask[];
      canUserSubmit?: boolean;
      totalContributors?: number;
      maxContributors?: number;
      userManifestStats?: { done: number; progress: number };
    }>(`/madoc/api/projects/${projectId}/manifest-tasks/${manifestId}`);
  }

  async getUserDetails() {
    return this.publicRequest<UserDetails>(`/madoc/api/me`);
  }
}
