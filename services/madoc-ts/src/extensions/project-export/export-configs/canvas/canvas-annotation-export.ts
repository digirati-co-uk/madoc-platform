import { parseUrn } from '../../../../utility/parse-urn';
import { ExportFile } from '../../server-export';
import { ExportConfig } from '../../types';

export const canvasAnnotationExport: ExportConfig = {
  type: 'canvas-annotation-export',
  metadata: {
    label: { en: ['Canvas annotation export'] },
    description: { en: ['Export capture models as annotations'] },
    filePatterns: [
      // Make this work...
      // - project_id would make multiple file patterns
      // - uuid would be a placeholder.
      // - format would come from config
      `/manifests/{manifest}/annotations/{project_id}/{format}/{canvas}.json`,
    ],
  },
  supportedTypes: ['canvas'],
  configuration: {
    filePerProject: false,
    defaultValues: {
      format: 'w3c-annotation',
    },
    editor: {
      project_id: {
        type: 'autocomplete-field',
        label: 'Project',
        dataSource: 'madoc-api://iiif/manifests/:manifest/projects-autocomplete?all=true',
        requestInitial: true,
        outputIdAsString: false,
        clearable: true,
      } as any,
      format: {
        label: 'Format',
        type: 'dropdown-field',
        options: [
          { value: 'w3c-annotation', text: 'w3c-annotation' },
          { value: 'open-annotation', text: 'open-annotation' },
          { value: 'w3c-annotation-pages', text: 'w3c-annotation-pages' },
        ],
      } as any,
    },
  },
  hookConfig(subject, options, config) {
    if (config && options.subjectParent && options.subjectParent.type === 'manifest') {
      const editor = config.editor as any;
      return {
        ...config,
        editor: {
          ...((editor as any) || {}),
          project_id: {
            ...editor.project_id,
            dataSource: editor.project_id.dataSource.replace(':manifest', options.subjectParent.id),
          },
        },
      };
    }
  },

  async exportData(subject, options) {
    const project = options.config && options.config.project_id ? parseUrn(options.config.project_id.uri) : undefined;

    const resp = await options.api.getSiteCanvasPublishedModels(subject.id, {
      project_id: project?.id,
      format: options.config.format || 'w3c-annotation',
    });

    return [
      ExportFile.json(
        resp,
        `/manifests/${options.subjectParent?.id}/annotations/${project?.id || 'unknown'}/${options.config.format ||
          'json'}/${subject.id}.json`,
        true
      ),
    ];
  },
};
