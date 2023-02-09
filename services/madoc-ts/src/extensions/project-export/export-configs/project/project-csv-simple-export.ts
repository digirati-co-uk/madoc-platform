import { parseModelTarget } from '../../../../utility/parse-model-target';
import { ExportFile } from '../../server-export';
import { ExportConfig, ExportDataOptions, ExportFileDefinition, SupportedExportResource } from '../../types';

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
        },
      };
    }
  },
  async exportData(
    subject: SupportedExportResource,
    options: ExportDataOptions<any>
  ): Promise<ExportFileDefinition[] | undefined> {
    // This will probably be a pretty long-running task.

    const allPublished = await options.api.getProjectFieldsRaw(subject.id, {
      status: 'approved',
      entity: options.config.entity,
    });

    const rowRecord: Record<string, any> = {};
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
    }

    function findBest(fields: any[]) {
      const revises = fields.map(r => r.revises);
      return fields.filter(r => !revises.includes(r.id)).pop() || fields[0];
    }

    const mappedList = Object.entries(rowRecord)
      .map(([key, record]) => {
        const newRecord: any = {};

        newRecord.model_id = record.model_id;
        newRecord.doc_id = record.doc_id;

        if (record.__fields) {
          for (const field of record.__fields) {
            newRecord[field] = findBest(record[field])?.value;
          }

          const target = parseModelTarget(record.target);
          if (target.manifest) {
            newRecord.manifest = target.manifest.id;
          }
          if (target.canvas) {
            newRecord.canvas = target.canvas.id;
          }
          return newRecord;
        }
        return false;
      })
      .filter(Boolean) as any[];

    return [await ExportFile.csv(mappedList, 'project-data/data.csv')];
  },
};
