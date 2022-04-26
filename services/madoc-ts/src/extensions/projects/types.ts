import React from 'react';
import { ModelEditorConfig } from '../../frontend/admin/pages/crowdsourcing/model-editor/use-model-editor-config';
import { ProjectStatusMap } from '../../frontend/shared/atoms/ProjectStatus';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';
import { BaseField } from '../../frontend/shared/capture-models/types/field-types';
import { RevisionRequest } from '../../frontend/shared/capture-models/types/revision-request';
import { MadocTheme } from '../../frontend/themes/definitions/types';
import { ApiClient } from '../../gateway/api';
import { ProjectRow } from '../../types/projects';
import { ProjectConfiguration } from '../../types/schemas/project-configuration';
import { SlotMappingRequest } from '../../types/schemas/site-page';

export type JsonProjectTemplate = {
  type: string; // Required unique type used to register and index.
  metadata: {
    label: string;
    description: string;
    version?: string;
    thumbnail?: string;
    documentation?: string;
    actionLabel?: string;
  };
  captureModel?: {
    document: CaptureModel['document'];
    structure?: CaptureModel['structure'];
  };
  configuration?: {
    defaults?: Partial<ProjectConfiguration>;
    immutable?: Array<keyof ProjectConfiguration>;
    frozen?: boolean;
    captureModels?: ModelEditorConfig;
    tasks?: {
      generateOnCreate?: boolean;
      generateOnNewContent?: boolean;
    };
    status?: {
      disabled?: boolean;
      defaultStatus?: number;
      statusMap?: ProjectStatusMap;
    };
    // Disabled this option for now.
    // slots?: {
    //   immutable?: boolean;
    // };
    activity?: {
      noActivity?: boolean;
    };
  };
  theme?: Partial<MadocTheme>;
  slots?: SlotMappingRequest;
};

export type CaptureModelShorthand<Keys extends string | number | symbol> = Record<
  Keys,
  string | Partial<CaptureModel['document']> | Partial<BaseField>
>;

export type ProjectTemplateConfig<T extends ProjectTemplate> = T extends ProjectTemplate<any, any, infer R> ? R : never;

export type ModelDefinition<Options = any> =
  | { verboseDocument: true; model: CaptureModel['document'] }
  | { verboseDocument: false; model?: CaptureModelShorthand<keyof Options> }
  | { model?: CaptureModelShorthand<keyof Options> };

export type ProjectTemplate<
  Options extends Record<string, any> = any,
  RevSession extends Record<string, any> = any,
  CustomConfig extends Record<string, any> = any
> = JsonProjectTemplate & {
  // Unknown parameters.
  setup?: ModelDefinition<Options> & {
    modelPreview?: React.FC<Options>;
    defaults?: Options;
    beforeForkDocument?: (
      model: Readonly<CaptureModel['document']>,
      extra: {
        api: ApiClient;
        options: Options;
      }
    ) =>
      | Promise<CaptureModel['document'] | Readonly<CaptureModel['document']> | undefined | void>
      | CaptureModel['document']
      | Readonly<CaptureModel['document']>
      | void
      | undefined;
    beforeForkStructure?: (
      model: Readonly<CaptureModel>,
      extra: {
        api: ApiClient;
        options: Options;
      }
    ) =>
      | Promise<CaptureModel['structure'] | Readonly<CaptureModel['structure']> | undefined | void>
      | CaptureModel['structure']
      | Readonly<CaptureModel['structure']>
      | void
      | undefined;
    onCreateConfiguration?: (
      config: ProjectConfiguration,
      extra: {
        api: ApiClient;
        options: Options;
      }
    ) => ProjectConfiguration | void | undefined | Promise<ProjectConfiguration | void | undefined>;
    onCreateProject?: (
      project: ProjectRow,
      extra: {
        api: ApiClient;
        options: Options;
      }
    ) => void | Promise<void>;

    // This will be used in the set up to generate initial values for the custom config. If this does not exist,
    // customConfig.defaultConfig will be used instead. The default config will also be used if this function
    // failed for any reason.
    onCreateCustomConfiguration?: (
      config: ProjectConfiguration,
      extra: { api: ApiClient; options: Options }
    ) => CustomConfig | Promise<CustomConfig>;
  };
  customConfig?: {
    replacesProjectConfig?: boolean;
    defaults: CustomConfig;
    model: CaptureModelShorthand<keyof CustomConfig>;
    applyConfig: (newConfig: CustomConfig, prevConfig: CustomConfig) => void | Promise<void>;
  };
  customActions?: Array<{
    label: string;
    roles?: string[]; // Default = admin only
    doAction: (extra: { api: ApiClient; config: CustomConfig }) => void | Promise<void>;
  }>;
  hooks?: {
    onCreateUserRevisionSession?: () => RevSession;
    onAddContentToProject?: () => void | Promise<void>;
    onRemoveContentFromProject?: () => void | Promise<void>;
    canContentBeAddedToProject?: () => boolean | Promise<boolean>;
    onProjectStatus?: (status: number) => void | Promise<void>;
    onLoadRevision?: () => void | Promise<void>;
    beforeSaveRevision?: () => void | Promise<void>;
    beforeCloneModel?: (opts: {
      captureModel: CaptureModel;
      api: ApiClient;
      config: CustomConfig;
    }) => void | Promise<void>;
    onSubmitRevision?: () => void | Promise<void>;
    onRevisionApproved?: (opts: {
      revision: RevisionRequest;
      captureModel: CaptureModel;
      api: ApiClient;
      config: CustomConfig;
    }) => void | Promise<void>;
    onRevisionRejected?: () => void | Promise<void>;
    onResourceComplete?: () => void | Promise<void>;
    onCreateReview?: () => void | Promise<void>;
    onAssignReview?: () => void | Promise<void>;
  };
  migrations?: Array<{
    version: string;
    upgrade: () => void | Promise<void>;
  }>;
  components?: {
    customEditor?: React.FC<any>;
  };
  source?: { type: string; id?: string; name: string };
};
