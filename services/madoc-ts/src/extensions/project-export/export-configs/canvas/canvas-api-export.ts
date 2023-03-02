import { ExportFile } from '../../server-export';
import { ExportConfig } from '../../types';

export const canvasApiExport: ExportConfig = {
  type: 'canvas-api-export',
  supportedTypes: ['canvas'],
  metadata: {
    label: { en: ['Canvas API'] },
    description: { en: ['Export from the internal Madoc API'] },
    filePatterns: ['/manifests/{manifest}/api/{canvas}.json'],
  },
  async exportData(subject, options) {
    if (!options.subjectParent) {
      return [];
    }

    return [
      ExportFile.json(
        (await options.api.getCanvasById(subject.id)).canvas,
        `/manifests/${options.subjectParent.id}/api/${subject.id}.json`,
        true,
        {}
      ),
    ];
  },
};
