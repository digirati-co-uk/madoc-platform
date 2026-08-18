import { ApiClientWithoutExtensions } from '../gateway/api';
import {
  ProjectSearchIndexConfiguration,
  ProjectSearchIndexPreset,
} from '../types/schemas/project-search-index';
import { parseEtag } from '../utility/parse-etag';

export const PROJECT_SEARCH_INDEX_SERVICE = 'project-search-indexes';

export function getProjectSearchIndexScope(siteId: number, projectId: number) {
  return [`urn:madoc:site:${siteId}`, `urn:madoc:project:${projectId}`];
}

export async function getProjectSearchIndexConfiguration(
  api: ApiClientWithoutExtensions,
  siteId: number,
  projectId: number
) {
  const scope = getProjectSearchIndexScope(siteId, projectId);
  const response = await api.getConfiguration<ProjectSearchIndexConfiguration>(PROJECT_SEARCH_INDEX_SERVICE, scope);
  const stored = response.config.find(
    item => item?.scope.length === scope.length && item.scope.every(value => scope.includes(value))
  );

  return {
    stored,
    config: {
      available: stored?.config_object.available || [],
      indexes: stored?.config_object.indexes || [],
    } satisfies ProjectSearchIndexConfiguration,
  };
}

export async function saveProjectSearchIndexConfiguration(
  api: ApiClientWithoutExtensions,
  siteId: number,
  projectId: number,
  config: ProjectSearchIndexConfiguration
) {
  const scope = getProjectSearchIndexScope(siteId, projectId);
  const { stored } = await getProjectSearchIndexConfiguration(api, siteId, projectId);

  if (!stored?.id) {
    await api.addConfiguration(PROJECT_SEARCH_INDEX_SERVICE, scope, config);
    return config;
  }

  const raw = await api.getSingleConfigurationRaw(stored.id);
  const etag = raw.headers.get('etag');
  if (!etag) {
    throw new Error(`Could not save project search indexes ${stored.id}: missing ETag`);
  }
  await api.replaceConfiguration(stored.id, parseEtag(etag) || etag, config);
  return config;
}

export async function createProjectSearchIndexConfiguration(
  api: ApiClientWithoutExtensions,
  siteId: number,
  projectId: number,
  available: ProjectSearchIndexPreset[] = []
) {
  if (!available.length) {
    return;
  }
  await saveProjectSearchIndexConfiguration(api, siteId, projectId, { available, indexes: [] });
}
