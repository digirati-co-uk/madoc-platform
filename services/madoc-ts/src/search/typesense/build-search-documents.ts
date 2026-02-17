import { SearchIngestRequest } from '../../types/search';
import { SearchIndexable } from '../../utility/capture-model-to-indexables';
import { parseUrn } from '../../utility/parse-urn';

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function toStringValue(value: unknown): string {
  if (typeof value === 'string') {
    return value.trim();
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`;
  }
  return '';
}

function toWildcardFieldName(prefix: string, key: string): string | null {
  const normalized = key
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  if (!normalized) {
    return null;
  }

  return `${prefix}_${normalized}`;
}

function toMetadataFacetFieldName(key: string): string | null {
  return toWildcardFieldName('metadata', key);
}

function fromInternationalString(value: any): string[] {
  if (!value) {
    return [];
  }
  if (typeof value === 'string') {
    return [value];
  }
  if (Array.isArray(value)) {
    return value.map(toStringValue).filter(Boolean);
  }
  if (typeof value === 'object') {
    const list: string[] = [];
    for (const locale of Object.keys(value)) {
      const localeValues = Array.isArray(value[locale]) ? value[locale] : [value[locale]];
      for (const localeValue of localeValues) {
        const text = toStringValue(localeValue);
        if (text) {
          list.push(text);
        }
      }
    }
    return list;
  }
  return [];
}

function parseMetadata(payload: SearchIngestRequest['resource']) {
  const metadata = Array.isArray((payload as any).metadata) ? (payload as any).metadata : [];

  const metadataKeys: string[] = [];
  const metadataPairs: string[] = [];
  const metadataValues: string[] = [];
  const languages: string[] = [];
  const metadataFacetValues: Record<string, string[]> = {};
  const labelsByMetadataIndex: Record<string, string[]> = {};
  const valuesByMetadataIndex: Record<string, string[]> = {};

  for (const item of metadata) {
    const labels = fromInternationalString(item?.label);
    const values = fromInternationalString(item?.value);
    const key = labels[0] ? labels[0].toLowerCase() : '';

    const metadataLabelMatch = key.match(/^metadata\.(\d+)\.label$/i);
    if (metadataLabelMatch) {
      labelsByMetadataIndex[metadataLabelMatch[1]] = uniq([...(labelsByMetadataIndex[metadataLabelMatch[1]] || []), ...values]);
      continue;
    }

    const metadataValueMatch = key.match(/^metadata\.(\d+)\.value$/i);
    if (metadataValueMatch) {
      valuesByMetadataIndex[metadataValueMatch[1]] = uniq([...(valuesByMetadataIndex[metadataValueMatch[1]] || []), ...values]);
      metadataValues.push(...values);
      continue;
    }

    if (key) {
      metadataKeys.push(key);
    }

    for (const value of values) {
      metadataValues.push(value);
      if (key) {
        metadataPairs.push(`${key}:${value}`);
      }
    }

    const facetFieldName = key ? toMetadataFacetFieldName(key) : null;
    if (facetFieldName && values.length) {
      metadataFacetValues[facetFieldName] = uniq([...(metadataFacetValues[facetFieldName] || []), ...values]);
    }
  }

  for (const [metadataIndex, values] of Object.entries(valuesByMetadataIndex)) {
    const labels = labelsByMetadataIndex[metadataIndex] || [];
    for (const label of labels) {
      const normalizedKey = label.toLowerCase();
      if (normalizedKey) {
        metadataKeys.push(normalizedKey);
      }

      for (const value of values) {
        if (normalizedKey) {
          metadataPairs.push(`${normalizedKey}:${value}`);
        }
      }

      const facetFieldName = toMetadataFacetFieldName(label);
      if (facetFieldName) {
        metadataFacetValues[facetFieldName] = uniq([...(metadataFacetValues[facetFieldName] || []), ...values]);
      }
    }
  }

  const labelValue = fromInternationalString((payload as any).label);
  const summaryValue = fromInternationalString((payload as any).summary);
  return {
    label: labelValue[0] || `${(payload as any).type || 'Resource'}`,
    searchText: uniq([...labelValue, ...summaryValue, ...metadataValues]),
    metadataKeys: uniq(metadataKeys),
    metadataPairs: uniq(metadataPairs),
    languages: uniq(languages),
    metadataFacetValues,
  };
}

export function buildTypesenseDocumentFromIngest({
  siteId,
  request,
  captureModelValues = {},
  additionalSearchText = [],
}: {
  siteId: number;
  request: SearchIngestRequest;
  captureModelValues?: Record<string, string[]>;
  additionalSearchText?: string[];
}) {
  const parsed = parseMetadata(request.resource);
  const contexts = (request.contexts || []).map(context => context.id).filter(Boolean);
  const projectIds = contexts
    .map(id => parseUrn<{ id: number; type: string }>(id))
    .filter(parsedUrn => parsedUrn && parsedUrn.type.toLowerCase() === 'project')
    .map(project => `${project!.id}`);

  const navDate = (request.resource as any).navDate ? new Date((request.resource as any).navDate) : null;

  return {
    id: `${request.id}:site:${siteId}`,
    resource_id: request.id,
    manifest_id:
      request.type.toLowerCase() === 'manifest'
        ? request.id
        : contexts.find(context => context.startsWith('urn:madoc:manifest:')) || request.id,
    resource_type: request.type,
    resource_label: parsed.label,
    sort_label: parsed.label.toLocaleLowerCase(),
    thumbnail: request.thumbnail || (request.resource as any)?.thumbnail || null,
    rights: (request.resource as any)?.rights || null,
    site_id: siteId,
    project_ids: projectIds,
    contexts: uniq(contexts),
    search_text: uniq([
      ...(parsed.searchText.length ? parsed.searchText : [parsed.label]),
      ...additionalSearchText,
    ]),
    metadata_keys: parsed.metadataKeys,
    metadata_pairs: parsed.metadataPairs,
    ...parsed.metadataFacetValues,
    ...Object.fromEntries(
      Object.entries(captureModelValues)
        .filter(([fieldName, values]) => fieldName.startsWith('capture_model_') && Array.isArray(values) && values.length)
        .map(([fieldName, values]) => [fieldName, uniq(values)])
    ),
    languages: parsed.languages,
    nav_date: navDate ? Math.floor(navDate.getTime() / 1000) : null,
    item_index: null,
    sort_index: request.type.toLowerCase() === 'manifest' ? 0 : 1,
  };
}

function toTimestamp(value: string | null) {
  if (!value) {
    return null;
  }
  const asDate = new Date(value);
  if (Number.isNaN(asDate.getTime())) {
    return null;
  }
  return Math.floor(asDate.getTime() / 1000);
}

export function buildTypesenseIndexableDocument(siteId: number, indexable: SearchIndexable, index: number) {
  return {
    id: `${indexable.resource_id}:${indexable.content_id}:site:${siteId}:${index}`,
    site_id: siteId,
    resource_id: indexable.resource_id,
    content_id: indexable.content_id,
    type: indexable.type,
    subtype: indexable.subtype,
    indexable: indexable.indexable,
    original_content: indexable.original_content,
    language_iso639_1: indexable.language_iso639_1,
    selector_json: indexable.selector ? JSON.stringify(indexable.selector) : undefined,
    indexable_date: toTimestamp(indexable.indexable_date),
    indexable_int: indexable.indexable_int,
    indexable_float: indexable.indexable_float,
    sort_index: index,
  };
}
