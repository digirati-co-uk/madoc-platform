import { ExportFile } from '../../server-export';
import { ExportConfig } from '../../types';

export const canvasPlaintextExport: ExportConfig = {
  type: 'canvas-plaintext',
  supportedTypes: ['canvas'],
  metadata: {
    label: { en: ['Canvas Plaintext'] },
    description: { en: ['Export transcription as plaintext'] },
    filePatterns: ['/manifests/{manifest}/plaintext/{canvas}.txt'],
  },
  async exportData(subject, options) {
    if (!options.subjectParent) {
      return [];
    }

    const { transcription, found } = await options.api.getCanvasPlaintext(subject.id);
    if (found && transcription) {
      return [
        // Single text file with transcription
        ExportFile.text(transcription, `/manifests/${options.subjectParent.id}/plaintext/${subject.id}.txt`, {}),
      ];
    }
  },
};
