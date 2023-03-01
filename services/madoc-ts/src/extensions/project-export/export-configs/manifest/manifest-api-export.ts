import { ExportFile } from '../../server-export';
import { ExportConfig } from '../../types';

export const manifestApiExport: ExportConfig = {
  type: 'manifest-api-export',
  metadata: {
    label: { en: ['Manifest API'] },
    filePatterns: ['/manifests/{manifest}/api.json'],
    description: { en: ['Export Manifest from API (without canvases)'] },
  },
  async exportData(subject, options) {
    const { items: _, ...manifest } = (await options.api.getManifestById(subject.id)).manifest;

    return [ExportFile.json(manifest, `/manifests/${subject.id}/api.json`, true, {})];
  },

  supportedTypes: ['manifest'],
};
