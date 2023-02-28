import { ApiClient } from '../../gateway/api';
import { BaseExtension, defaultDispose } from '../extension-manager';
import { DjangoPagination } from './types';

export class BaseDjangoExtension implements BaseExtension {
  api: ApiClient;

  allTasks: Array<{ service: string; name: string }> = [];

  constructor(api: ApiClient) {
    this.api = api;
  }

  getServiceName(): string {
    throw new Error('No service name');
  }

  /**
   * NOTE: This extension is run in "light" mode, and cannot have side effects.
   */
  dispose() {
    defaultDispose(this);
  }

  djangoCreate<T>(app: string, view: string, data: T) {
    return this.api.request<T>(`/api/enrichment/internal/${app}/${view}/`, {
      method: 'POST',
      body: data,
    });
  }

  djangoList<T>(app: string, view: string) {
    return this.api.request<T[]>(`/api/enrichment/internal/${app}/${view}/`);
  }

  djangoPaginatedList<T>(app: string, view: string, page = 1) {
    return this.api.request<DjangoPagination<T>>(`/api/enrichment/internal/${app}/${view}/?page=${page}`);
  }

  djangoRead<T>(app: string, view: string, id: string) {
    return this.api.request<T>(`/api/enrichment/internal/${app}/${view}/${id}/`);
  }

  djangoUpdate<T>(app: string, view: string, id: string, data: T) {
    return this.api.request<T>(`/api/enrichment/internal/${app}/${view}/${id}/`, {
      method: 'PUT',
      body: data,
    });
  }

  djangoDelete(app: string, view: string, id: string) {
    return this.api.request(`/api/enrichment/internal/${app}/${view}/${id}/`, {
      method: 'DELETE',
    });
  }

  createPaginatedServiceHelper<Full, Snippet = Full>(service: string, view: string) {
    return {
      list: (page: number) => this.djangoPaginatedList<Snippet>(service, view, page),
      get: (name: string) => this.djangoRead<Full>(service, view, name),
      create: (data: Partial<Full>) => this.djangoCreate(service, view, data),
      update: (id: string, data: Partial<Full>) => this.djangoUpdate(service, view, id, data),
      delete: (name: string) => this.djangoDelete(service, view, name),
    };
  }

  createServiceHelper<Full, Snippet = Full>(service: string, view: string) {
    return {
      list: () => this.djangoList<Snippet[]>(service, view),
      get: (name: string) => this.djangoRead<Full>(service, view, name),
      create: (data: Full) => this.djangoCreate(service, view, data),
      update: (id: string, data: Partial<Full>) => this.djangoUpdate(service, view, id, data),
      delete: (name: string) => this.djangoDelete(service, view, name),
    };
  }

  triggerTask<P, Ret = null>(
    taskName: string,
    subject: string | { id: number; type: string },
    params: P,
    isAsync = true
  ) {
    const service = this.getServiceName();
    const payload = {
      task: {
        subject: typeof subject === 'string' ? subject : `urn:madoc:${subject.type}:${subject.id}`,
        parameters: params,
      },
      async: isAsync,
    };

    return this.api.request<Ret>(`/api/enrichment/internal/${service}/tasks/${taskName}/`, {
      method: 'POST',
      body: payload,
    });
  }

  //
  // /api/nlp_service/tasks/
  // /api/nlp_service/tasks/spacy_logged_task/
  //
  // /api/task_service/task_log/
  // /api/task_service/task_log/<id>/
  // /api/task_service/tasks/
  // /api/task_service/tasks/base_logged_task/
  // /api/task_service/tasks/base_parent_task/
  // /api/task_service/tasks/base_pipeline_task/
  // /api/task_service/tasks/base_resource_task/
  // /api/task_service/tasks/base_search_service_indexing_task/
  // /api/task_service/tasks/base_stateless_task/
  // /api/task_service/tasks/base_task/
  // /api/task_service/tasks/raw_task/
  //
  // /madoc/entity/
  // /madoc/entity/<id>/
  // /madoc/resource/
  // /madoc/resource/<madoc_id>/
  // /madoc/search/
  // /madoc/task_log/
  // /madoc/task_log/<id>/
}
