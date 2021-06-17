import { ApiClient } from '../../gateway/api';
import { RemotePlugin } from '../../types/plugins';
import { SitePlugin } from '../../types/schemas/plugins';
import { BaseExtension } from '../extension-manager';

export class SystemExtension implements BaseExtension {
  api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

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

  async getPluginDependencies(id: string) {
    return this.api.request<{ dependencies: number }>(`/api/madoc/system/plugins/${id}/dependencies`);
  }

  async viewExternalPlugin(owner: string, repo: string) {
    return this.api.request<RemotePlugin>(`/api/madoc/system/plugins/external/${owner}/${repo}`);
  }

  async installExternalPlugin(owner: string, repository: string, version?: string) {
    return this.api.request<any>(`/api/madoc/system/plugins/external/install`, {
      method: 'POST',
      body: { owner, repository, version },
    });
  }

  async disablePlugin(id: string) {
    return this.api.request(`/api/madoc/system/plugins/${id}/disable`, {
      method: 'POST',
    });
  }

  async enablePlugin(id: string) {
    return this.api.request(`/api/madoc/system/plugins/${id}/enable`, {
      method: 'POST',
    });
  }

  async uninstallPlugin(id: string) {
    return this.api.request(`/api/madoc/system/plugins/${id}/uninstall`, {
      method: 'POST',
    });
  }
}
