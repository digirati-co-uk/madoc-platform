import type { TypesenseSearchOptions } from '../../types/schemas/project-configuration';

export type TypesenseResourceType = 'Project' | 'Collection' | 'Manifest' | 'Canvas';

const allResourceTypes: TypesenseResourceType[] = ['Project', 'Collection', 'Manifest', 'Canvas'];
const resourceTypeOptionKeys: Record<TypesenseResourceType, keyof TypesenseSearchOptions> = {
  Project: 'projects',
  Collection: 'collections',
  Manifest: 'manifests',
  Canvas: 'canvases',
};

export function resolveTypesenseTabOptions(
  options?: TypesenseSearchOptions,
  onlyShowManifests = false,
  constraints: {
    projectSearch?: boolean;
    allowCollectionNavigation?: boolean;
    allowManifestNavigation?: boolean;
    allowCanvasNavigation?: boolean;
  } = {}
): Required<TypesenseSearchOptions> {
  const defaultEnabled = !onlyShowManifests;

  return {
    allResources: options?.allResources ?? defaultEnabled,
    projects: !constraints.projectSearch && (options?.projects ?? defaultEnabled),
    collections: constraints.allowCollectionNavigation !== false && (options?.collections ?? defaultEnabled),
    manifests: constraints.allowManifestNavigation !== false && (options?.manifests ?? true),
    canvases: constraints.allowCanvasNavigation !== false && (options?.canvases ?? defaultEnabled),
  };
}

export function getTypesenseResourceTypes(options: Required<TypesenseSearchOptions>): TypesenseResourceType[] {
  return allResourceTypes.filter(type => options[resourceTypeOptionKeys[type]]);
}

export function getTypesenseProjectFilter(projectId?: number) {
  return projectId && Number.isInteger(projectId) ? `contexts:=\`urn:madoc:project:${projectId}\`` : undefined;
}

export function getTypesenseCollectionFilter(collectionId?: number) {
  return collectionId && Number.isInteger(collectionId)
    ? `contexts:=\`urn:madoc:collection:${collectionId}\``
    : undefined;
}

export function getTypesenseSearchFilter(
  projectId?: number,
  resourceTypes?: TypesenseResourceType[],
  collectionId?: number
) {
  const resourceTypeFilter =
    resourceTypes && resourceTypes.length < allResourceTypes.length
      ? resourceTypes.length
        ? `(${resourceTypes.map(type => `resource_type:=\`${type}\``).join(' || ')})`
        : 'resource_type:=`__none__`'
      : undefined;
  const filters = [
    getTypesenseProjectFilter(projectId),
    getTypesenseCollectionFilter(collectionId),
    resourceTypeFilter,
  ];
  return filters.filter(Boolean).join(' && ') || undefined;
}
