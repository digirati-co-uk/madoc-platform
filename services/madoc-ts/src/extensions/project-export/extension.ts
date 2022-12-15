import { ApiClient } from '../../gateway/api';
import { BaseExtension, defaultDispose } from '../extension-manager';
import { RegistryExtension } from '../registry-extension';
import { canvasApiExport } from './export-configs/canvas/canvas-api-export';
import { canvasPlaintextExport } from './export-configs/canvas/canvas-plaintext-export';
import { manifestApiExport } from './export-configs/manifest/manifest-api-export';
import { ExportConfig } from './types';

export class ProjectExportExtension extends RegistryExtension<ExportConfig> implements BaseExtension {
  api: ApiClient;

  static REGISTRY = 'project-export';

  constructor(api: ApiClient) {
    super({
      registryName: ProjectExportExtension.REGISTRY,
    });
    this.api = api;
    // List of default export options.
    ProjectExportExtension.register(canvasApiExport);
    ProjectExportExtension.register(canvasPlaintextExport);
    ProjectExportExtension.register(manifestApiExport);
  }

  dispose() {
    defaultDispose(this);
    super.dispose();
  }

  static register(definition: ExportConfig) {
    RegistryExtension.emitter.emit(ProjectExportExtension.REGISTRY, definition);
  }

  static removePlugin(event: { pluginId: string; siteId?: number; type: string }) {
    RegistryExtension.emitter.emit(`remove-plugin-${ProjectExportExtension.REGISTRY}`, event);
  }

  static registerPlugin(event: { pluginId: string; siteId?: number; definition: ExportConfig }) {
    RegistryExtension.emitter.emit(`plugin-${ProjectExportExtension.REGISTRY}`, event);
  }
}
