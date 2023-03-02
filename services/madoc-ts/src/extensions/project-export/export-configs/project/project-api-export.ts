import { ExportFile } from '../../server-export';
import { ExportConfig, ExportDataOptions, ExportFileDefinition, SupportedExportResource } from '../../types';

export const projectApiExport: ExportConfig = {
  type: 'project-api-export',
  metadata: {
    label: { en: ['Project API Export'] },
    description: { en: ['Export project metadata from the Madoc API'] },
  },
  supportedContexts: ['project_id'],
  supportedTypes: ['project'],
  async exportData(
    subject: SupportedExportResource,
    options: ExportDataOptions<any>
  ): Promise<ExportFileDefinition[] | undefined> {
    return [ExportFile.json(await options.api.getProject(subject.id), `/project-metadata.json`, true, {})];
  },
};
