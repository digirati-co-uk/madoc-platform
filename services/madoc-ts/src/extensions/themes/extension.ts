import { ApiClient } from '../../gateway/api';
import { ThemeListItem } from '../../types/themes';
import { BaseExtension, defaultDispose } from '../extension-manager';

export class ThemeExtension implements BaseExtension {
  api: ApiClient;

  constructor(api: ApiClient) {
    this.api = api;
  }

  dispose() {
    defaultDispose(this);
  }

  // List all themes
  listThemes() {
    return this.api.request<{ themes: ThemeListItem[] }>(`/api/madoc/system/themes`);
  }

  getTheme(id: string) {
    return this.api.request<ThemeListItem>(`/api/madoc/system/themes/${id}`);
  }

  getSiteTheme() {
    return this.api.request<{ theme: ThemeListItem | null }>(`/api/madoc/system/current-theme`);
  }

  installTheme(id: string) {
    return this.api.request<ThemeListItem>(`/api/madoc/system/themes/${id}/install`, {
      method: 'POST',
    });
  }

  enableTheme(id: string) {
    return this.api.request<ThemeListItem>(`/api/madoc/system/themes/${id}/enable`, {
      method: 'POST',
    });
  }

  disableTheme(id: string) {
    return this.api.request<ThemeListItem>(`/api/madoc/system/themes/${id}/disable`, {
      method: 'POST',
    });
  }

  uninstallTheme(id: string) {
    return this.api.request(`/api/madoc/system/themes/${id}/uninstall`, {
      method: 'POST',
    });
  }
}
