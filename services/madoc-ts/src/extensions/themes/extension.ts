import { ApiClient } from '../../gateway/api';
import { DiskTheme, ThemeListItem } from '../../types/themes';
import { BaseExtension, defaultDispose } from '../extension-manager';
import { RegistryExtension } from '../registry-extension';

type ThemeDef = DiskTheme & { type: string };

export class ThemeExtension extends RegistryExtension<ThemeDef> implements BaseExtension {
  api: ApiClient;

  static REGISTRY = 'themes';

  constructor(api: ApiClient) {
    super({
      registryName: ThemeExtension.REGISTRY,
    });
    this.api = api;
  }

  dispose() {
    defaultDispose(this);
    super.dispose();
  }

  static register(definition: ThemeDef) {
    RegistryExtension.emitter.emit(ThemeExtension.REGISTRY, definition);
  }

  static removePlugin(event: { pluginId: string; siteId?: number; type: string }) {
    RegistryExtension.emitter.emit(`remove-plugin-${ThemeExtension.REGISTRY}`, event);
  }

  static registerPlugin(event: { pluginId: string; siteId?: number; definition: ThemeDef }) {
    RegistryExtension.emitter.emit(`plugin-${ThemeExtension.REGISTRY}`, event);
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
