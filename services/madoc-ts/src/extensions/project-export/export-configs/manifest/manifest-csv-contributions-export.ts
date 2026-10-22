import { parseUrn } from '../../../../utility/parse-urn';
import { exportContributionsCsv } from '../project/project-cvs-contributions-export';
import type { ExportConfig, ExportDataOptions } from '../../types';
import type { CaptureModelShorthand } from '../../../projects/types';

export interface ManifestCsvConfiguration {
  project_id?: string | { uri: string };
  entity?: string;
  reviews?: boolean;
}

/** Entity identifiers belong to the selected project's model. */
export function resetManifestCsvProjectConfiguration(
  previous: ManifestCsvConfiguration | undefined,
  next: ManifestCsvConfiguration
): ManifestCsvConfiguration {
  const projectUri = (selection: ManifestCsvConfiguration['project_id']) =>
    typeof selection === 'string' ? selection : selection?.uri;
  return projectUri(previous?.project_id) === projectUri(next.project_id) ? next : { ...next, entity: '' };
}

function getProjectId(options: ExportDataOptions<ManifestCsvConfiguration>): number | undefined {
  if (options.context?.type === 'project') {
    return options.context.id;
  }
  const selection = options.config?.project_id;
  const uri = typeof selection === 'string' ? selection : selection?.uri;
  if (!uri || !/^urn:madoc:project:[1-9]\d*$/.test(uri)) {
    return undefined;
  }
  return parseUrn(uri)?.id;
}

export const manifestCsvContributionsExport: ExportConfig<ManifestCsvConfiguration> = {
  type: 'manifest-csv-contributions-export',
  supportedTypes: ['manifest'],
  supportedContexts: ['project_id'],
  metadata: {
    label: { en: ['Contributions CSV per manifest'] },
    description: { en: ['Exports one CSV per manifest and project, preserving individual contribution rows'] },
    filePatterns: ['/manifests/{manifest}/csv/{project_id}/contributions.csv'],
  },
  configuration: {
    defaultValues: { entity: '', reviews: false },
    editor: { project_id: {}, entity: {}, reviews: {} },
  },
  hookConfig(subject, options, config) {
    if (!config) return config;
    const projectId = subject.type === 'project' ? subject.id : getProjectId(options);
    const editor: CaptureModelShorthand<keyof ManifestCsvConfiguration> = {
      project_id:
        subject.type === 'manifest'
          ? {
              type: 'autocomplete-field',
              label: 'Project',
              description: 'Choose a project to export its contributions for this manifest.',
              dataSource: `madoc-api://iiif/manifests/${subject.id}/projects-autocomplete?all=true`,
              requestInitial: true,
              outputIdAsString: false,
              clearable: true,
            }
          : {},
      entity: projectId
        ? {
            type: 'autocomplete-field',
            label: 'Entity from model',
            description: 'Optional: filter export to contributions for a single nested entity.',
            dataSource: `madoc-api://projects/${projectId}/model-autocomplete`,
            requestInitial: true,
            outputIdAsString: true,
            clearable: true,
          }
        : {},
      reviews: {
        type: 'checkbox-field',
        label: 'Submission filter',
        inlineLabel: 'Include reviews',
        description: 'Include submissions being reviewed in the export.',
      },
    };
    return {
      ...config,
      defaultValues: {
        ...config.defaultValues,
        ...(subject.type === 'project' ? { project_id: `urn:madoc:project:${subject.id}` } : {}),
      },
      editor,
    };
  },
  async exportData(subject, options) {
    const projectId = getProjectId(options);
    if (subject.type !== 'manifest' || !projectId) return [];
    return exportContributionsCsv(projectId, { ...options, config: options.config || {} }, subject.id);
  },
};
