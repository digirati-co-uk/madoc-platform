import { ApiClient } from '../../gateway/api';
import { BaseExtension, defaultDispose } from '../extension-manager';
import { RegistryExtension } from '../registry-extension';
import { canvasAnnotationExport } from './export-configs/canvas/canvas-annotation-export';
import { canvasApiExport } from './export-configs/canvas/canvas-api-export';
import { canvasModelExport } from './export-configs/canvas/canvas-model-export';
import { canvasPlaintextExport } from './export-configs/canvas/canvas-plaintext-export';
import { manifestApiExport } from './export-configs/manifest/manifest-api-export';
import { projectApiExport } from './export-configs/project/project-api-export';
import { projectCsvSimpleExport } from './export-configs/project/project-csv-simple-export';
import { projectCsvContributionsExport } from './export-configs/project/project-cvs-contributions-export';
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
    ProjectExportExtension.register(canvasModelExport);
    ProjectExportExtension.register(canvasPlaintextExport);
    ProjectExportExtension.register(canvasAnnotationExport);
    ProjectExportExtension.register(manifestApiExport);
    ProjectExportExtension.register(projectApiExport);
    ProjectExportExtension.register(projectCsvSimpleExport);
    ProjectExportExtension.register(projectCsvContributionsExport);
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
