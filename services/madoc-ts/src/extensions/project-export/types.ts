import { InternationalString } from '@iiif/presentation-3';
import React, { JSXElementConstructor } from 'react';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { ApiClient } from '../../gateway/api';
import { BaseTask } from '../../gateway/tasks/base-task';
import { CaptureModelShorthand } from '../projects/types';

export type SupportedExportResourceTypes = 'project' | 'manifest' | 'canvas';

export type SupportedExportResource = { type: SupportedExportResourceTypes; id: number };

export interface ExportResourceRequest {
  // What is being exported at the level.
  subject: SupportedExportResource;

  // Parent.
  subjectParent: SupportedExportResource;

  // Context of the export (usually project)
  context: SupportedExportResource;

  // Mapping of configuration for the current level, example:
  // [
  //   [“project-basic”, {}],
  //   [“project-reviews-by-user”, {}],
  //   [“project-task-tree”, {}]
  // ]
  subjectExports: ExportPlan[keyof ExportPlan];

  // Details on the file output.
  output:
    | {
        // A do-nothing output - could be used for pushing to an external system.
        type: 'none';
      }
    | {
        // Might not be used yet... but would be a good alternative.
        type: 'task-state';
      }
    | {
        // This will be used for sub-tasks, only the top level zips.
        type: 'disk';
        directory: string;
      }
    | {
        // This will be used for top level tasks to zip.
        type: 'zip';
        path: string;
        fileName: string;
        options?: any; // Unknown at this point.
      };

  // Mapping of configuration (only top level), example:
  // {
  //   “project”: [
  //     [“project-basic”, {}],
  //     [“project-reviews-by-user”, {}],
  //     [“project-task-tree”, {}]
  //   ],
  //   “manifest”: [
  //     [“manifest-iiif”, {“use-original-ids”: true}]
  //   ],
  //   “canvas”: [
  //     [“canvas-plaintext”, {}],
  //     [“canvas-mapping”, {}],
  //     [“canvas-model-json”, {}]
  //   ],
  // }
  exportPlan?: ExportPlan;
}

export type ExportPlan = Record<SupportedExportResourceTypes, Array<[string, any]>>;

export type ExportDataOptions<Config extends Record<string, any> = any> = {
  api: ApiClient;
  config: Config;
  // Optional.
  subjectParent?: SupportedExportResource;
  context?: SupportedExportResource;
  task?: BaseTask;
  subExport?: (exportType: string, exportSubject: SupportedExportResource, config?: any) => void;
};

export interface ExportConfig<Config extends Record<string, any> = any> {
  type: string;
  source?: { type: string; id?: string; name: string };
  supportedTypes: Array<SupportedExportResourceTypes>;

  // What data should the export get?
  exportData(
    subject: SupportedExportResource,
    options: ExportDataOptions<Config>
  ): Promise<ExportFileDefinition[] | undefined>;

  /**
   * This will run when
   */
  handleSubExports?: (
    subject: SupportedExportResource,
    options: ExportDataOptions<Config>
  ) => Promise<ExportFileDefinition[] | undefined>;

  hookConfig?: (
    subject: SupportedExportResource,
    options: ExportDataOptions<Config>,
    config: ExportConfig<Config>['configuration']
  ) => ExportConfig<Config>['configuration'] | undefined;

  // Display information.
  metadata: {
    label: InternationalString;
    description?: InternationalString;
    svgIcon?: string | JSXElementConstructor<React.SVGProps<SVGSVGElement>>;
    /**
     * File patterns
     *
     * If you set a list of file patterns then the export can be more easily previewed
     * with your changes.
     *
     * Supported replacements:
     * - {project}: numeric identifier of project
     * - {manifest}: numeric identifier of the manifest
     * - {canvas}: numeric identifier of canvas
     */
    filePatterns?: string[];
  };

  // Configuration, if available.
  configuration?: {
    filePerProject?: boolean;
    defaultValues: Config;
    editor: string | CaptureModelShorthand<keyof Config> | CaptureModel['document'];
  };
}

export interface ExportFileDefinition {
  path: string;
  text: boolean;
  content:
    | { type: 'text'; value: string } // Text - JSON or whatever
    | { type: 'html'; value: string } // HTML which could be previewed.
    | { type: 'url'; value: string }; // A URL to a remote resource (e.g. external API integration)
  metadata?: any;
}

export interface ExportManifest {
  creator: { id: number; name: string };
  created: string;
  files: Array<{ path: string; metadata?: any; extension: string }>[];
}
