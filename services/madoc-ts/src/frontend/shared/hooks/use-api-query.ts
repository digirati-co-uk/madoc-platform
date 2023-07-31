import { PaginatedQueryResult, QueryConfig, QueryResult, usePaginatedQuery, useQuery } from 'react-query';
import { ApiClient } from '../../../gateway/api';
import { useApi } from './use-api';

export type ApiArgs<T extends keyof ApiClient> = MethodArgs<ApiClient[T]>;

export type MethodArgs<T> = T extends (...arg: infer R) => Promise<any> ? R : never;
export type MethodReturn<T> = T extends (...arg: any) => Promise<infer R> ? R : never;

export type AdditionalHooks<Params = any, Query = any, Key extends GetApiMethods = GetApiMethods> = {
  name: GetApiMethods;
  creator: (params: Params, query: Query) => undefined | MethodArgs<ApiClient[Key]>;
};

export type GetApiMethods = keyof Pick<
  ApiClient,
  | 'getCurrentUser'
  | 'getIsServer'
  | 'getSiteSlug'
  | 'getStatistics'
  | 'getProjects'
  | 'getProject'
  | 'getProjectMetadata'
  | 'getProjectStructure'
  | 'getProjectTask'
  | 'getProjectModel'
  | 'getConfiguration'
  | 'getProjectConfiguration'
  | 'getCollections'
  | 'getManifests'
  | 'getManifestProjects'
  | 'getManifestLinking'
  | 'getManifestCanvasLinking'
  | 'getCollectionProjects'
  | 'getCollectionStatistics'
  | 'getCollectionById'
  | 'getCollectionStructure'
  | 'getManifestStructure'
  | 'getManifestById'
  | 'getManifestCollections'
  | 'getCollectionMetadata'
  | 'getManifestMetadata'
  | 'getCanvasMetadata'
  | 'getCanvasLinking'
  | 'getCanvasById'
  | 'getCanvasManifests'
  | 'getCaptureModel'
  | 'getAllCaptureModels'
  | 'getCaptureModelRevision'
  | 'getTaskStats'
  | 'getAllTaskStats'
  | 'getTaskSubjects'
  | 'getTask'
  | 'getTaskById'
  | 'getTasksByStatus'
  | 'getTasksBySubject'
  | 'getTasksByType'
  | 'getTasks'
  | 'getStorageJsonDetails'
  | 'getStorageJsonData'
  | 'getSiteCanvas'
  | 'getSiteCollection'
  | 'getSiteCollections'
  | 'getSiteManifest'
  | 'getSiteManifestStructure'
  | 'getSiteManifests'
  | 'getSitePage'
  | 'getSiteProject'
  | 'getSiteProjectRecent'
  | 'getSiteProjects'
  | 'getSiteProjectCanvasModel'
  | 'getSiteProjectCanvasTasks'
  | 'getSiteProjectManifestTasks'
  | 'getUserDetails'
  | 'searchQuery'
  | 'getSiteConfiguration'
  | 'getMetadataKeys'
  | 'getMetadataValues'
  | 'getSiteSearchFacetConfiguration'
  | 'getSiteMetadataConfiguration'
  | 'getSiteCanvasPublishedModels'
  | 'getSiteSearchQuery'
  | 'getSiteLocales'
  | 'getSiteLocale'
  | 'getLocaleAnalysis'
  | 'getPersonalNote'
  | 'getSiteCollectionMetadata'
  | 'getSiteManifestMetadata'
  | 'getSiteCanvasMetadata'
  | 'getSiteProjectManifestModel'
  | 'getLocale'
  | 'getAutomatedUsers'
  | 'getAllPersonalNotes'
  | 'getAllProjectFeedback'
>;

const keys = Object.getOwnPropertyNames(ApiClient.prototype);

export function createApiHook(
  key: string,
  { extension, queryMethod = useQuery }: { extension?: string; queryMethod?: any } = {}
) {
  return (args: any, config: any) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const hookedApi = useApi();
    const argsToUse = args();
    const keyToUse = extension ? `${extension}/${key}` : key;
    const apiToUse: any = extension ? (hookedApi as any)[extension] : (hookedApi as any);

    // eslint-disable-next-line react-hooks/rules-of-hooks
    return queryMethod(
      [keyToUse, { args: argsToUse }],
      () => {
        if (typeof argsToUse === 'undefined') {
          console.error(`Bad call to apiHook.${key}(undefined) with enabled.`);
        }
        return apiToUse[key](...argsToUse);
      },
      { enabled: typeof argsToUse !== 'undefined', cacheTime: 1000 * 60 * 60, ...(config || {}) }
    );
  };
}

export const apiHooks: {
  [Key in GetApiMethods]: (
    creator: () => undefined | MethodArgs<ApiClient[Key]>,
    config?: QueryConfig<MethodReturn<ApiClient[Key]>>
  ) => QueryResult<MethodReturn<ApiClient[Key]>>;
} = {} as any;
for (const key of keys) {
  if (key.startsWith('get') || key === 'searchQuery') {
    (apiHooks as any)[key] = createApiHook(key);
  }
}

export const paginatedApiHooks: {
  [Key in GetApiMethods]: (
    creator: () => undefined | MethodArgs<ApiClient[Key]>,
    config?: QueryConfig<MethodReturn<ApiClient[Key]>>
  ) => PaginatedQueryResult<MethodReturn<ApiClient[Key]>>;
} = {} as any;
for (const key of keys) {
  if (key.startsWith('get') || key === 'searchQuery') {
    (paginatedApiHooks as any)[key] = createApiHook(key, { queryMethod: usePaginatedQuery });
  }
}
