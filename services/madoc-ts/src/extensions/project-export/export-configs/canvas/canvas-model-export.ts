import { parseUrn } from '../../../../utility/parse-urn';
import { ExportFile } from '../../server-export';
import { ExportConfig } from '../../types';
import {
  isTabularCellFlagged,
  parseTabularCellFlags,
  sortTabularCellFlags,
  TABULAR_CELL_FLAGS_PROPERTY,
  type TabularCellFlag,
} from '../../../../frontend/shared/utility/tabular-cell-flags';

type NormalizedTabularCellReview = {
  row: number;
  column: string;
  comment?: string;
};

function toNormalizedReview(flag: TabularCellFlag): NormalizedTabularCellReview {
  const trimmedComment = typeof flag.comment === 'string' ? flag.comment.trim() : '';
  return {
    row: flag.rowIndex + 1,
    column: flag.columnKey,
    ...(trimmedComment ? { comment: trimmedComment } : {}),
  };
}

function withNormalizedTabularCellReviews(model: any, format: string) {
  if (format !== 'json') {
    return model;
  }

  if (!Object.prototype.hasOwnProperty.call(model, TABULAR_CELL_FLAGS_PROPERTY)) {
    return model;
  }

  const reviews = sortTabularCellFlags(parseTabularCellFlags(model[TABULAR_CELL_FLAGS_PROPERTY]));
  const flags = reviews.filter(flag => isTabularCellFlagged(flag)).map(toNormalizedReview);
  const notes = reviews.filter(flag => !isTabularCellFlagged(flag)).map(toNormalizedReview);

  return {
    ...model,
    tabular_cell_reviews: {
      flag_count: flags.length,
      note_count: notes.length,
      flags,
      notes,
    },
  };
}

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
    const format = options.config?.format || 'json';

    const resp = await options.api.getSiteCanvasPublishedModels(subject.id, {
      project_id: project?.id,
      format,
      reviews: !!options.config?.reviews,
    });

    // @todo it would be better if getSiteCanvasPublishedModels returned a project-id if known.
    return resp.models.map((model: any) =>
      ExportFile.json(
        withNormalizedTabularCellReviews(model, format),
        `/manifests/${options.subjectParent?.id}/models/${project?.id || model.projectId || 'unknown'}/${options.config
          ?.format || 'json'}/${subject.id}.json`,
        true
      )
    );
  },
};
