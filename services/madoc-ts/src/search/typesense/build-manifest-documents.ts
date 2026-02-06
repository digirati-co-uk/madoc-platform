import { ManifestSearchExportRow, SearchExportMetadataField } from '../../database/queries/search-index-export';

export interface ManifestDocumentContext {
  siteId: number;
  siteUrn: string;
  manifestId: number;
  projectIds: number[];
  collectionIds: number[];
}

export interface TypesenseManifestSearchDocument {
  id: string;
  resource_id: string;
  manifest_id: string;
  resource_type: string;
  resource_label: string;
  sort_label: string;
  thumbnail: string | null;
  rights: string | null;
  site_id: number;
  project_ids: string[];
  contexts: string[];
  search_text: string[];
  metadata_keys: string[];
  metadata_pairs: string[];
  languages: string[];
  nav_date: number | null;
  item_index: number | null;
  sort_index: number;
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

function createMetadataPair(field: SearchExportMetadataField) {
  const key = ensureString(field.key);
  const value = ensureString(field.value);
  const language = ensureString(field.language);

  if (!key || !value) {
    return '';
  }

  if (!language || language === 'none' || language === '@none') {
    return `${key}:${value}`;
  }

  return `${key}@${language}:${value}`;
}

function getResourceUrn(resourceType: ManifestSearchExportRow['resource_type'], resourceId: number) {
  if (resourceType === 'Manifest') {
    return `urn:madoc:manifest:${resourceId}`;
  }

  return `urn:madoc:canvas:${resourceId}`;
}

export function buildManifestTypesenseDocuments(
  rows: ManifestSearchExportRow[],
  context: ManifestDocumentContext
): TypesenseManifestSearchDocument[] {
  const projectUrns = context.projectIds.map(projectId => `urn:madoc:project:${projectId}`);
  const collectionUrns = context.collectionIds.map(collectionId => `urn:madoc:collection:${collectionId}`);
  const manifestUrn = `urn:madoc:manifest:${context.manifestId}`;

  return rows.map(row => {
    const metadata = Array.isArray(row.metadata) ? row.metadata : [];
    const metadataValues = metadata.map(field => ensureString(field.value)).filter(Boolean);
    const metadataKeys = uniq(metadata.map(field => ensureString(field.key)));
    const metadataPairs = uniq(metadata.map(createMetadataPair));
    const languages = uniq(metadata.map(field => ensureString(field.language)));
    const label = findLabel(metadata) || `${row.resource_type} ${row.resource_id}`;
    const resourceUrn = getResourceUrn(row.resource_type, row.resource_id);
    const contexts = uniq([context.siteUrn, ...projectUrns, ...collectionUrns, manifestUrn, resourceUrn]);

    return {
      id: `${resourceUrn}:site:${context.siteId}`,
      resource_id: resourceUrn,
      manifest_id: manifestUrn,
      resource_type: row.resource_type,
      resource_label: label,
      sort_label: label.toLocaleLowerCase(),
      thumbnail: row.default_thumbnail || row.placeholder_image || null,
      rights: row.rights,
      site_id: context.siteId,
      project_ids: context.projectIds.map(projectId => `${projectId}`),
      contexts,
      search_text: uniq([label, ...metadataValues]),
      metadata_keys: metadataKeys,
      metadata_pairs: metadataPairs,
      languages,
      nav_date: row.nav_date ? Math.floor(new Date(row.nav_date).getTime() / 1000) : null,
      item_index: row.item_index ?? null,
      sort_index: row.resource_type === 'Manifest' ? 0 : (row.item_index ?? 0) + 1,
    };
  });
}
