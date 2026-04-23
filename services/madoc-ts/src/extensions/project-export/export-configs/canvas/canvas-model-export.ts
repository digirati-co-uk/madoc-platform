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
import { compareFieldKeysByTabularOrder, getTabularFieldOrderMap } from '../project/tabular-export-order';

type NormalizedTabularCellReview = {
  row: number;
  column: string;
  comment?: string;
};

const projectFieldOrderMapCache = new Map<number, Promise<Map<string, number>>>();

function toNormalizedReview(flag: TabularCellFlag): NormalizedTabularCellReview {
  const trimmedComment = typeof flag.comment === 'string' ? flag.comment.trim() : '';
  return {
    row: flag.rowIndex + 1,
    column: flag.columnKey,
    ...(trimmedComment ? { comment: trimmedComment } : {}),
  };
}

function isObjectLike(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function toNumericProjectId(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function getProjectIdFromContext(context: unknown): number | undefined {
  if (!isObjectLike(context)) {
    return undefined;
  }

  if (context.type !== 'project') {
    return undefined;
  }

  return toNumericProjectId(context.id);
}

function withOrderedTabularRows(model: any, fieldOrderMap: Map<string, number>) {
  if (!fieldOrderMap.size || !isObjectLike(model) || !Array.isArray(model.rows)) {
    return model;
  }

  return {
    ...model,
    rows: model.rows.map((row: unknown) => {
      if (!isObjectLike(row)) {
        return row;
      }

      return Object.fromEntries(
        Object.entries(row).sort(([leftFieldKey], [rightFieldKey]) =>
          compareFieldKeysByTabularOrder(leftFieldKey, rightFieldKey, fieldOrderMap)
        )
      );
    }),
  };
}

function normalizeCanvasModelForExport(model: any, format: string, fieldOrderMap: Map<string, number>) {
  const modelWithOrderedRows = withOrderedTabularRows(model, fieldOrderMap);

  if (format !== 'json') {
    return modelWithOrderedRows;
  }

  if (!Object.prototype.hasOwnProperty.call(modelWithOrderedRows, TABULAR_CELL_FLAGS_PROPERTY)) {
    return modelWithOrderedRows;
  }

  const reviews = sortTabularCellFlags(parseTabularCellFlags(modelWithOrderedRows[TABULAR_CELL_FLAGS_PROPERTY]));
  const flags = reviews.filter(flag => isTabularCellFlagged(flag)).map(toNormalizedReview);
  const notes = reviews.filter(flag => !isTabularCellFlagged(flag)).map(toNormalizedReview);

  return {
    ...modelWithOrderedRows,
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
    const contextProjectId = getProjectIdFromContext(options.context);
    const configuredProjectId = toNumericProjectId(project?.id);
    const resolvedProjectId = configuredProjectId ?? contextProjectId;
    const format = options.config?.format || 'json';

    const resp = await options.api.getSiteCanvasPublishedModels(subject.id, {
      project_id: resolvedProjectId,
      format,
      reviews: !!options.config?.reviews,
    });

    const getFieldOrderMapForProject = async (projectId: number | undefined) => {
      if (projectId === undefined) {
        return new Map<string, number>();
      }

      const existing = projectFieldOrderMapCache.get(projectId);
      if (existing) {
        return existing;
      }

      const loadFieldOrderMap = (async () => {
        try {
          const projectDetails = await options.api.getProject(projectId);
          return getTabularFieldOrderMap(projectDetails?.template_config);
        } catch (err) {
          console.warn('Canvas model export: failed to load project template config for field ordering', {
            projectId,
            err: String(err),
          });
          return new Map<string, number>();
        }
      })();

      projectFieldOrderMapCache.set(projectId, loadFieldOrderMap);
      return loadFieldOrderMap;
    };

    // @todo it would be better if getSiteCanvasPublishedModels returned a project-id if known.
    return Promise.all(
      resp.models.map(async (model: any) => {
        const modelProjectId = toNumericProjectId(resolvedProjectId ?? model?.projectId);
        const fieldOrderMap = await getFieldOrderMapForProject(modelProjectId);
        const pathProjectId = resolvedProjectId ?? modelProjectId ?? model?.projectId ?? 'unknown';

        return ExportFile.json(
          normalizeCanvasModelForExport(model, format, fieldOrderMap),
          `/manifests/${options.subjectParent?.id}/models/${pathProjectId}/${options.config?.format || 'json'}/${subject
            .id}.json`,
          true
        );
      })
    );
  },
};
