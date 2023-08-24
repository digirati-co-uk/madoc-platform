import { parseUrn } from '../../../../utility/parse-urn';
import { ExportFile } from '../../server-export';
import { ExportConfig } from '../../types';

export const canvasModelExport: ExportConfig = {
  type: 'canvas-model-export',
  metadata: {
    label: { en: ['Canvas model export'] },
    description: { en: ['Export capture models from projects'] },
    filePatterns: [`/manifests/{manifest}/models/{project_id}/{format}/{canvas}.json`],
  },
  supportedTypes: ['canvas'],
  configuration: {
    filePerProject: true,
    defaultValues: {
      format: 'json',
      reviews: false,
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
          { value: 'json', text: 'json' },
          { value: 'capture-model', text: 'capture-model' },
          { value: 'capture-model-with-pages', text: 'capture-model-with-pages' },
          { value: 'capture-model-with-pages-resolved', text: 'capture-model-with-pages-resolved' },
        ],
      } as any,
      reviews: {
        type: 'checkbox-field',
        label: 'Submission filter',
        inlineLabel: 'Include reviews',
        description: 'Include submissions being reviewed in the export.',
      },
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
      format: options.config?.format || 'json',
      reviews: !!options.config?.reviews,
    });

    // @todo it would be better if getSiteCanvasPublishedModels returned a project-id if known.
    return resp.models.map((model: any) =>
      ExportFile.json(
        model,
        `/manifests/${options.subjectParent?.id}/models/${project?.id || model.projectId || 'unknown'}/${options.config
          ?.format || 'json'}/${subject.id}.json`,
        true
      )
    );
  },
};
