import { ApiClient } from '../../gateway/api';
import { BaseExtension, defaultDispose } from '../extension-manager';
import { RegistryExtension } from '../registry-extension';
import { ProjectTemplate } from './types';

export class ProjectTemplateExtension extends RegistryExtension<ProjectTemplate> implements BaseExtension {
  api: ApiClient;

  static REGISTRY = 'project-template';

  constructor(api: ApiClient) {
    super({
      registryName: ProjectTemplateExtension.REGISTRY,
    });
    this.api = api;
  }

  dispose() {
    defaultDispose(this);
    super.dispose();
  }

  static register(definition: ProjectTemplate) {
    RegistryExtension.emitter.emit(ProjectTemplateExtension.REGISTRY, definition);
  }

  static removePlugin(event: { pluginId: string; siteId?: number; type: string }) {
    RegistryExtension.emitter.emit(`remove-plugin-${ProjectTemplateExtension.REGISTRY}`, event);
  }

  static registerPlugin(event: { pluginId: string; siteId?: number; definition: ProjectTemplate }) {
    RegistryExtension.emitter.emit(`plugin-${ProjectTemplateExtension.REGISTRY}`, event);
  }
}
