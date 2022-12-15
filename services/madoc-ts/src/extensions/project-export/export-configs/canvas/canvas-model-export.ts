import { parseUrl } from 'query-string';
import { parseUrn } from '../../../../utility/parse-urn';
import { ExportFile } from '../../server-export';
import { ExportConfig } from '../../types';

export const canvasModelExport: ExportConfig = {
  type: 'canvas-model-export',
  metadata: {
    label: { en: ['Canvas model export'] },
    description: { en: ['Export capture models from projects'] },
    filePatterns: [],
  },
  supportedTypes: ['canvas'],
  configuration: {
    defaultValues: {
      format: 'json',
    },
    editor: {
      project_id: {
        type: 'autocomplete-field',
        label: 'Topic type',
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
          { value: 'open-annotation', text: 'open-annotation' },
          { value: 'w3c-annotation', text: 'w3c-annotation' },
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
    console.log('options', options);

    const project = options.config && options.config.project_id ? parseUrn(options.config.project_id.uri) : undefined;

    const resp = await options.api.getSiteCanvasPublishedModels(subject.id, {
      project_id: project?.id,
      format: options.config.format || 'json',
    });

    if (resp.models) {
      return resp.models.map((model: any) => ExportFile.json(model, `/example/models/${model.id}.json`, true));
    }

    return [ExportFile.json(resp, `/example/models/anno.json`, true)];
  },
};
