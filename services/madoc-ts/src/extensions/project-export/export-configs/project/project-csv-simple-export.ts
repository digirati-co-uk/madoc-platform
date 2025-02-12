import { parseModelTarget } from '../../../../utility/parse-model-target';
import { ExportFile } from '../../server-export';
import { ExportConfig, ExportDataOptions, ExportFileDefinition, SupportedExportResource } from '../../types';
import { getValue } from '@iiif/helpers/i18n';

const labelCache: { manifestLabels: Record<string, string>; canvasLabels: Record<string, string> } = {
  manifestLabels: {},
  canvasLabels: {},
};

async function fetchLabels(api: any, manifestIds: number[], canvasIds: number[]) {
  const newManifestIds = manifestIds.filter(id => id !== undefined && !labelCache.manifestLabels[id.toString()]);
  const newCanvasIds = canvasIds.filter(id => id !== undefined && !labelCache.canvasLabels[id.toString()]);

  if (newManifestIds.length > 0) {
    const manifests = await Promise.all(newManifestIds.map(id => api.getManifestById(id)));
    manifests.forEach(response => {
      const manifest = response.manifest;
      if (manifest && manifest.id !== undefined) {
        labelCache.manifestLabels[manifest.id.toString()] = getValue(manifest.label);
      }
    });
  }

  if (newCanvasIds.length > 0) {
    const canvases = await Promise.all(newCanvasIds.map(id => api.getCanvasById(id)));
    canvases.forEach(response => {
      const canvas = response.canvas;
      if (canvas && canvas.id !== undefined) {
        labelCache.canvasLabels[canvas.id.toString()] = getValue(canvas.label);
      }
    });
  }

  return { manifestLabels: labelCache.manifestLabels, canvasLabels: labelCache.canvasLabels };
}

export const projectCsvSimpleExport: ExportConfig = {
  type: 'project-csv-simple-export',
  supportedTypes: ['project'],
  metadata: {
    label: { en: ['Simple CSV Export'] },
    description: { en: ['Exports simple capture models to CSV (no nested models)'] },
  },
  configuration: {
    defaultValues: {
      entity: '',
    },
    editor: {
      entity: {},
    },
  },
  hookConfig(subject, options, config) {
    if (config && subject.type === 'project') {
      const editor = config.editor as any;
      return {
        ...config,
        editor: {
          ...((editor as any) || {}),
          entity: {
            type: 'autocomplete-field',
            label: 'Entity from model',
            description: 'List will be empty if your capture model does not have any nested entities.',
            dataSource: `madoc-api://projects/${subject.id}/model-autocomplete`,
            requestInitial: true,
            outputIdAsString: true,
            clearable: true,
          },
          reviews: {
            type: 'checkbox-field',
            label: 'Submission filter',
            inlineLabel: 'Include reviews',
            description: 'Include submissions being reviewed in the export.',
          } as any,
        },
      };
    }
  },
  async exportData(
    subject: SupportedExportResource,
    options: ExportDataOptions<any>
  ): Promise<ExportFileDefinition[] | undefined> {
    const allPublished = await options.api.getProjectFieldsRaw(subject.id, {
      status: options.config.reviews ? 'all' : 'approved',
      entity: options.config.entity,
    });

    const rowRecord: Record<string, any> = {};
    const manifestIds: number[] = [];
    const canvasIds: number[] = [];

    for (const item of allPublished) {
      rowRecord[item.doc_id] = rowRecord[item.doc_id] || {
        target: item.target,
        model_id: item.model_id,
        doc_id: item.doc_id,
        __fields: [],
      };

      if (!rowRecord[item.doc_id].__fields.includes(item.key)) {
        rowRecord[item.doc_id].__fields.push(item.key);
      }

      rowRecord[item.doc_id][item.key] = rowRecord[item.doc_id][item.key] || [];
      rowRecord[item.doc_id][item.key].push({ value: item.value, id: item.id, revises: item.revises });

      const target = parseModelTarget(item.target);
      if (target.manifest && target.manifest.id !== undefined) {
        manifestIds.push(target.manifest.id);
      }
      if (target.canvas && target.canvas.id !== undefined) {
        canvasIds.push(target.canvas.id);
      }
    }

    const { manifestLabels, canvasLabels } = await fetchLabels(options.api, manifestIds, canvasIds);

    function findBest(fields: any[]) {
      const revises = fields.map(r => r.revises);
      return fields.filter(r => !revises.includes(r.id)).pop() || fields[0];
    }

    const mappedList = Object.entries(rowRecord)
      .map(([key, record]) => {
        const newRecord: any = {
          model_id: record.model_id,
          doc_id: record.doc_id,
        };

        if (record.__fields) {
          for (const field of record.__fields) {
            newRecord[field] = findBest(record[field])?.value;
          }

          const target = parseModelTarget(record.target);
          if (target.manifest && target.manifest.id !== undefined) {
            newRecord.manifest = target.manifest.id;
            newRecord.manifest_label = manifestLabels[target.manifest.id.toString()];
          }
          if (target.canvas && target.canvas.id !== undefined) {
            newRecord.canvas = target.canvas.id;
            newRecord.canvas_label = canvasLabels[target.canvas.id.toString()];
          }
          return newRecord;
        }
        return false;
      })
      .filter(Boolean) as any[];

    return [await ExportFile.csv(mappedList, 'project-data/data.csv')];
  },
};
