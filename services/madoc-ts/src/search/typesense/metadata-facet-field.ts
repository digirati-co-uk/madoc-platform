export function getTypesenseMetadataFacetFieldName(key: string): string | null {
  const normalized = key
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');

  return normalized ? `metadata_${normalized}` : null;
}
