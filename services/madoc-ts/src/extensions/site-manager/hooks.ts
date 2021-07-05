import { QueryConfig, QueryResult } from 'react-query';
import { createApiHook, MethodArgs, MethodReturn } from '../../frontend/shared/hooks/use-api-query';
import { ApiClient } from '../../gateway/api';
import { SiteManagerExtension } from './extension';

type GetApiMethods = keyof Pick<ApiClient['siteManager'], 'getAllSites'>;

const keys = Object.getOwnPropertyNames(SiteManagerExtension.prototype);

export const siteManagerHooks: {
  [Key in GetApiMethods]: (
    creator: () => undefined | MethodArgs<ApiClient['siteManager'][Key]>,
    config?: QueryConfig<MethodReturn<ApiClient['siteManager'][Key]>>
  ) => QueryResult<MethodReturn<ApiClient['siteManager'][Key]>>;
} = {} as any;
for (const key of keys) {
  if (key.startsWith('get')) {
    (siteManagerHooks as any)[key] = createApiHook(key, { extension: 'siteManager' });
  }
}
