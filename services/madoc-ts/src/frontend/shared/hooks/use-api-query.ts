import { QueryConfig, QueryResult, useQuery } from 'react-query';
import { ApiClient } from '../../../gateway/api';
import { useApi } from './use-api';

export type ApiArgs<T extends keyof ApiClient> = MethodArgs<ApiClient[T]>;

type MethodArgs<T> = T extends (...arg: infer R) => Promise<any> ? R : never;
type MethodReturn<T> = T extends (...arg: any) => Promise<infer R> ? R : never;

type GetApiMethods = keyof Pick<
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
  | 'getProjectsByResource'
  | 'getCrowdsourcingTasks'
  | 'getRandomManifest'
  | 'getRangeCanvas'
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
  | 'getSiteProjects'
  | 'getSiteProjectCanvasModel'
  | 'getSiteProjectCanvasTasks'
  | 'getSiteProjectManifestTasks'
  | 'getUserDetails'
  | 'searchQuery'
  | 'getSiteConfiguration'
>;

const keys = Object.getOwnPropertyNames(ApiClient.prototype);

export const apiHooks: {
  [Key in GetApiMethods]: (
    creator: () => undefined | MethodArgs<ApiClient[Key]>,
    config?: QueryConfig<MethodReturn<ApiClient[Key]>>
  ) => QueryResult<MethodReturn<ApiClient[Key]>>;
} = {} as any;
for (const key of keys) {
  if (key.startsWith('get') || key === 'searchQuery') {
    (apiHooks as any)[key] = (args: any, config: any) => {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      const hookedApi = useApi();
      const argsToUse = args();

      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useQuery(
        [key, argsToUse],
        () => {
          return (hookedApi as any)[key](...argsToUse);
        },
        { enabled: typeof argsToUse !== 'undefined', ...(config || {}) }
      );
    };
  }
}
