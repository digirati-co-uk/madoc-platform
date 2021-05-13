import { ApiClient } from '../../gateway/api';
import { SitePlugin } from '../../types/schemas/plugins';
import { BaseExtension } from '../extension-manager';

export class SystemExtension implements BaseExtension {
  api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  // 'list-plugins': [TypedRouter.GET, '/api/madoc/system/plugins', listPlugins],
  //   'get-plugin': [TypedRouter.GET, '/api/madoc/system/plugins/:id', getPlugin],
  //   'install-plugin': [TypedRouter.POST, '/api/madoc/system/plugins', installPlugin, 'SitePlugin'],

  listPlugins() {
    return this.api.request<{ plugins: SitePlugin[] }>(`/api/madoc/system/plugins`, {
      method: 'GET',
    });
  }

  async createPlugin(plugin: SitePlugin) {
    return this.api.request<SitePlugin>(`/api/madoc/system/plugins`, {
      method: 'POST',
      body: plugin,
    });
  }
}
