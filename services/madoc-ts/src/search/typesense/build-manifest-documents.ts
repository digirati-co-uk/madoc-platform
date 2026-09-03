import { ManifestSearchExportRow, SearchExportMetadataField } from '../../database/queries/search-index-export';
import { CaptureModelSearchAggregate } from './flatten-capture-model-fields';
import type { Project } from '../../types/project-full';
import type { InternationalString } from '@iiif/presentation-3';
import { getTypesenseMetadataFacetFieldName } from './metadata-facet-field';

export interface ManifestDocumentContext {
  siteId: number;
  siteUrn: string;
  captureModelByResource?: Record<string, CaptureModelSearchAggregate>;
}

export interface TypesenseManifestSearchDocument {
  id: string;
  resource_id: string;
  manifest_id: string;
  manifest_ids: string[];
  resource_type: string;
  resource_label: string;
  sort_label: string;
  thumbnail: string | null;
  rights: string | null;
  site_id: number;
  project_ids: string[];
  project_facets: string[];
  collection_ids: string[];
  contexts: string[];
  search_text: string[];
  search_context: string[];
  metadata_keys: string[];
  metadata_pairs: string[];
  languages: string[];
  nav_date: number | null;
  item_index: number | null;
  sort_index: number;
  [key: `metadata_${string}`]: string[];
  [key: `capture_model_${string}`]: string[];
}

function ensureString(value: unknown) {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return `${value}`;
  }

  return '';
}

function uniq(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function findLabel(metadata: SearchExportMetadataField[]) {
  const labels = metadata
    .filter(field => field.key === 'label')
    .map(field => ensureString(field.value))
    .filter(Boolean);

  return labels[0] || '';
}

function getResourceUrn(resourceType: ManifestSearchExportRow['resource_type'], resourceId: number) {
  if (resourceType === 'Manifest') {
    return `urn:madoc:manifest:${resourceId}`;
  }

  if (resourceType === 'Collection') {
    return `urn:madoc:collection:${resourceId}`;
  }

  return `urn:madoc:canvas:${resourceId}`;
}

function getPrimaryManifestUrn(row: ManifestSearchExportRow) {
  if (row.resource_type === 'Manifest') {
    return `urn:madoc:manifest:${row.resource_id}`;
  }

  if (row.primary_manifest_id) {
    return `urn:madoc:manifest:${row.primary_manifest_id}`;
  }

  if (row.manifest_ids.length) {
    return `urn:madoc:manifest:${row.manifest_ids[0]}`;
  }

  return getResourceUrn(row.resource_type, row.resource_id);
}

export function buildManifestTypesenseDocument(
  row: ManifestSearchExportRow,
  context: ManifestDocumentContext
): TypesenseManifestSearchDocument {
  const metadata = Array.isArray(row.metadata) ? row.metadata : [];
  const metadataValues: string[] = [];
  const metadataKeys: string[] = [];
  const metadataPairs: string[] = [];
  const languages = uniq(metadata.map(field => ensureString(field.language)));
  const metadataFacetValues: Record<string, string[]> = {};
  const labelsByMetadataIndex: Record<string, string[]> = {};
  const valuesByMetadataIndex: Record<string, string[]> = {};

  for (const field of metadata) {
    const key = ensureString(field.key);
    const value = ensureString(field.value);

    if (!value) {
      continue;
    }

    const labelMatch = key.match(/^metadata\.(\d+)\.label$/i);
    if (labelMatch) {
      labelsByMetadataIndex[labelMatch[1]] = uniq([...(labelsByMetadataIndex[labelMatch[1]] || []), value]);
      continue;
    }

    const valueMatch = key.match(/^metadata\.(\d+)\.value$/i);
    if (valueMatch) {
      valuesByMetadataIndex[valueMatch[1]] = uniq([...(valuesByMetadataIndex[valueMatch[1]] || []), value]);
      metadataValues.push(value);
      continue;
    }

    metadataValues.push(value);
    metadataKeys.push(key.toLowerCase());
    metadataPairs.push(`${key.toLowerCase()}:${value}`);

    const fallbackFacetFieldName = getTypesenseMetadataFacetFieldName(key);
    if (fallbackFacetFieldName) {
      metadataFacetValues[fallbackFacetFieldName] = uniq([
        ...(metadataFacetValues[fallbackFacetFieldName] || []),
        value,
      ]);
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

      const facetFieldName = getTypesenseMetadataFacetFieldName(label);
      if (!facetFieldName) {
        continue;
      }
      metadataFacetValues[facetFieldName] = uniq([...(metadataFacetValues[facetFieldName] || []), ...values]);
    }
  }

  const label = findLabel(metadata) || `${row.resource_type} ${row.resource_id}`;
  const resourceUrn = getResourceUrn(row.resource_type, row.resource_id);
  const captureModel = context.captureModelByResource?.[resourceUrn];
  const manifestUrns = uniq(row.manifest_ids.map(manifestId => `urn:madoc:manifest:${manifestId}`));
  const projectUrns = uniq(row.project_ids.map(projectId => `urn:madoc:project:${projectId}`));
  const collectionUrns = uniq(row.collection_ids.map(collectionId => `urn:madoc:collection:${collectionId}`));
  const contexts = uniq([context.siteUrn, ...manifestUrns, ...projectUrns, ...collectionUrns, resourceUrn]);

  return {
    id: `${resourceUrn}:site:${context.siteId}`,
    resource_id: resourceUrn,
    manifest_id: getPrimaryManifestUrn(row),
    manifest_ids: row.manifest_ids.map(manifestId => `${manifestId}`),
    resource_type: row.resource_type,
    resource_label: label,
    sort_label: label.toLocaleLowerCase(),
    thumbnail: row.thumbnail || row.default_thumbnail || row.placeholder_image || null,
    rights: row.rights,
    site_id: context.siteId,
    project_ids: row.project_ids.map(projectId => `${projectId}`),
    project_facets: row.project_facets,
    collection_ids: row.collection_ids.map(collectionId => `${collectionId}`),
    contexts,
    search_text: uniq([label, ...metadataValues, ...(captureModel?.searchText || [])]),
    search_context: captureModel?.labels || [],
    metadata_keys: uniq(metadataKeys),
    metadata_pairs: uniq(metadataPairs),
    ...metadataFacetValues,
    ...(captureModel?.fields || {}),
    languages,
    nav_date: row.nav_date ? Math.floor(new Date(row.nav_date).getTime() / 1000) : null,
    item_index: row.item_index ?? null,
    sort_index: row.resource_type === 'Manifest' ? 0 : (row.item_index ?? 0) + 1,
  };
}

function getInternationalStringValues(value: InternationalString | string | null | undefined) {
  if (!value) {
    return [];
  }
  return uniq(
    typeof value === 'string'
      ? [value]
      : Object.values(value)
          .flat()
          .filter((item): item is string => typeof item === 'string')
  );
}

export function buildProjectTypesenseDocument(
  project: Project,
  context: Pick<ManifestDocumentContext, 'siteId' | 'siteUrn'>
): TypesenseManifestSearchDocument {
  const projectUrn = `urn:madoc:project:${project.id}`;
  const labels = getInternationalStringValues(project.label);
  const summaries = getInternationalStringValues(project.summary);
  const label = labels[0] || `Project ${project.id}`;

  return {
    id: `${projectUrn}:site:${context.siteId}`,
    resource_id: projectUrn,
    manifest_id: projectUrn,
    manifest_ids: [],
    resource_type: 'Project',
    resource_label: label,
    sort_label: label.toLocaleLowerCase(),
    thumbnail: project.placeholderImage || null,
    rights: null,
    site_id: context.siteId,
    project_ids: [`${project.id}`],
    project_facets: [],
    collection_ids: [`${project.collection_id}`],
    contexts: [context.siteUrn],
    search_text: summaries,
    search_context: labels.slice(1),
    metadata_keys: [],
    metadata_pairs: [],
    languages: uniq([...Object.keys(project.label || {}), ...Object.keys(project.summary || {})]),
    nav_date: null,
    item_index: null,
    sort_index: 0,
  };
}

export function* streamManifestTypesenseDocuments(rows: ManifestSearchExportRow[], context: ManifestDocumentContext) {
  for (const row of rows) {
    yield buildManifestTypesenseDocument(row, context);
  }
}

export function buildManifestTypesenseDocuments(rows: ManifestSearchExportRow[], context: ManifestDocumentContext) {
  return rows.map(row => buildManifestTypesenseDocument(row, context));
}
