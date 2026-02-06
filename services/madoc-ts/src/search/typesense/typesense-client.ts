import { castBool } from '../../utility/cast-bool';

type TypesenseImportLine = {
  success: boolean;
  error?: string;
};

type TypesenseCollectionField = {
  name: string;
  type: string;
  facet?: boolean;
  optional?: boolean;
};

type TypesenseCollectionSchema = {
  name: string;
  fields: TypesenseCollectionField[];
  default_sorting_field: string;
};

export function isTypesenseSearchEnabled() {
  return castBool(process.env.SEARCH_USE_TYPESENSE, false);
}

function getCollectionPrefix() {
  const prefix = process.env.TYPESENSE_COLLECTION_PREFIX || 'madoc';
  return prefix.endsWith('_') ? prefix : `${prefix}_`;
}

export function getTypesenseSiteCollectionName(siteId: number) {
  return `${getCollectionPrefix()}site_${siteId}`;
}

export function getTypesenseIndexablesCollectionName(siteId: number) {
  return `${getCollectionPrefix()}indexables_site_${siteId}`;
}

function getTypesenseBaseUrl() {
  const protocol = process.env.TYPESENSE_PROTOCOL || 'http';
  const host = process.env.TYPESENSE_HOST || 'localhost';
  const port = process.env.TYPESENSE_PORT || '8108';

  return `${protocol}://${host}:${port}`;
}

export class TypesenseClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;

  constructor() {
    this.baseUrl = getTypesenseBaseUrl();
    this.apiKey = process.env.TYPESENSE_API_KEY || '';
  }

  private async request<T = any>(
    path: string,
    options: {
      method?: 'GET' | 'POST' | 'DELETE' | 'PUT';
      body?: string;
      contentType?: string;
      expectText?: boolean;
      allow404?: boolean;
    } = {}
  ): Promise<T | null> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: options.method || 'GET',
      headers: {
        'X-TYPESENSE-API-KEY': this.apiKey,
        ...(options.contentType ? { 'Content-Type': options.contentType } : {}),
      },
      body: options.body,
    });

    if (response.status === 404 && options.allow404) {
      return null;
    }

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Typesense request failed (${response.status}) ${path}: ${body}`);
    }

    if (options.expectText) {
      return (await response.text()) as T;
    }

    return (await response.json()) as T;
  }

  private getSearchCollectionSchema(name: string): TypesenseCollectionSchema {
    return {
      name,
      default_sorting_field: 'sort_index',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'resource_id', type: 'string' },
        { name: 'manifest_id', type: 'string', facet: true },
        { name: 'resource_type', type: 'string', facet: true },
        { name: 'resource_label', type: 'string', optional: true },
        { name: 'sort_label', type: 'string', optional: true },
        { name: 'thumbnail', type: 'string', optional: true },
        { name: 'rights', type: 'string', optional: true, facet: true },
        { name: 'site_id', type: 'int32', facet: true },
        { name: 'project_ids', type: 'string[]', facet: true, optional: true },
        { name: 'contexts', type: 'string[]', facet: true },
        { name: 'search_text', type: 'string[]' },
        { name: 'metadata_keys', type: 'string[]', facet: true, optional: true },
        { name: 'metadata_pairs', type: 'string[]', facet: true, optional: true },
        { name: 'languages', type: 'string[]', facet: true, optional: true },
        { name: 'nav_date', type: 'int64', optional: true },
        { name: 'item_index', type: 'int32', optional: true },
        { name: 'sort_index', type: 'int32' },
      ],
    };
  }

  private getIndexablesCollectionSchema(name: string): TypesenseCollectionSchema {
    return {
      name,
      default_sorting_field: 'sort_index',
      fields: [
        { name: 'id', type: 'string' },
        { name: 'site_id', type: 'int32', facet: true },
        { name: 'resource_id', type: 'string', facet: true },
        { name: 'content_id', type: 'string', facet: true },
        { name: 'type', type: 'string', facet: true },
        { name: 'subtype', type: 'string', facet: true, optional: true },
        { name: 'indexable', type: 'string' },
        { name: 'original_content', type: 'string', optional: true },
        { name: 'language_iso639_1', type: 'string', facet: true, optional: true },
        { name: 'selector_json', type: 'string', optional: true },
        { name: 'indexable_date', type: 'int64', optional: true },
        { name: 'indexable_int', type: 'int64', optional: true },
        { name: 'indexable_float', type: 'float', optional: true },
        { name: 'sort_index', type: 'int32' },
      ],
    };
  }

  async ensureSearchCollection(name: string) {
    if (!this.apiKey) {
      throw new Error('Missing TYPESENSE_API_KEY');
    }

    const existing = await this.request(`/collections/${encodeURIComponent(name)}`, { allow404: true });

    if (existing) {
      return;
    }

    const schema = this.getSearchCollectionSchema(name);
    await this.request('/collections', {
      method: 'POST',
      contentType: 'application/json',
      body: JSON.stringify(schema),
    });
  }

  async ensureIndexablesCollection(name: string) {
    if (!this.apiKey) {
      throw new Error('Missing TYPESENSE_API_KEY');
    }

    const existing = await this.request(`/collections/${encodeURIComponent(name)}`, { allow404: true });

    if (existing) {
      return;
    }

    const schema = this.getIndexablesCollectionSchema(name);
    await this.request('/collections', {
      method: 'POST',
      contentType: 'application/json',
      body: JSON.stringify(schema),
    });
  }

  async upsertDocuments(collectionName: string, documents: Array<Record<string, any>>) {
    if (!documents.length) {
      return {
        total: 0,
        failed: 0,
      };
    }

    const body = documents.map(doc => JSON.stringify(doc)).join('\n');
    const result = await this.request<string>(
      `/collections/${encodeURIComponent(collectionName)}/documents/import?action=upsert`,
      {
        method: 'POST',
        body,
        contentType: 'text/plain',
        expectText: true,
      }
    );

    const lines = (result || '')
      .split('\n')
      .map(line => line.trim())
      .filter(Boolean)
      .map(line => JSON.parse(line) as TypesenseImportLine);
    const failed = lines.filter(line => !line.success);

    if (failed.length) {
      throw new Error(
        `Typesense import failed for ${failed.length}/${lines.length} documents${failed[0].error ? `: ${failed[0].error}` : ''}`
      );
    }

    return {
      total: lines.length,
      failed: 0,
    };
  }

  async search(
    collectionName: string,
    params: {
      q: string;
      query_by: string;
      page?: number;
      per_page?: number;
      filter_by?: string;
      facet_by?: string;
      max_facet_values?: number;
      highlight_fields?: string;
      highlight_full_fields?: string;
    }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set('q', params.q);
    searchParams.set('query_by', params.query_by);

    if (typeof params.page !== 'undefined') {
      searchParams.set('page', `${params.page}`);
    }
    if (typeof params.per_page !== 'undefined') {
      searchParams.set('per_page', `${params.per_page}`);
    }
    if (typeof params.filter_by !== 'undefined' && params.filter_by !== '') {
      searchParams.set('filter_by', params.filter_by);
    }
    if (typeof params.facet_by !== 'undefined' && params.facet_by !== '') {
      searchParams.set('facet_by', params.facet_by);
    }
    if (typeof params.max_facet_values !== 'undefined') {
      searchParams.set('max_facet_values', `${params.max_facet_values}`);
    }
    if (typeof params.highlight_fields !== 'undefined') {
      searchParams.set('highlight_fields', params.highlight_fields);
    }
    if (typeof params.highlight_full_fields !== 'undefined') {
      searchParams.set('highlight_full_fields', params.highlight_full_fields);
    }

    return this.request(
      `/collections/${encodeURIComponent(collectionName)}/documents/search?${searchParams.toString()}`
    );
  }

  async getDocument(collectionName: string, id: string, { allow404 = false }: { allow404?: boolean } = {}) {
    return this.request(`/collections/${encodeURIComponent(collectionName)}/documents/${encodeURIComponent(id)}`, {
      allow404,
    });
  }

  async deleteDocument(collectionName: string, id: string, { allow404 = false }: { allow404?: boolean } = {}) {
    return this.request(`/collections/${encodeURIComponent(collectionName)}/documents/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      allow404,
    });
  }

  async deleteByFilter(collectionName: string, filterBy: string) {
    const params = new URLSearchParams();
    params.set('filter_by', filterBy);
    return this.request(`/collections/${encodeURIComponent(collectionName)}/documents?${params.toString()}`, {
      method: 'DELETE',
    });
  }
}
