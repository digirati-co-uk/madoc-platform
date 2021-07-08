import { CaptureModel } from '@capture-models/types';
import React from 'react';
import { ModelEditorConfig } from '../../frontend/admin/pages/crowdsourcing/model-editor/use-model-editor-config';
import { ProjectStatusMap } from '../../frontend/shared/atoms/ProjectStatus';
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
  setupModel?: CaptureModel['document'];
  captureModel?: CaptureModel['document'];
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
    activity: {
      noActivity?: boolean;
    };
  };
  theme?: Partial<MadocTheme>;
  slots?: SlotMappingRequest;
};

export type ProjectTemplate<RevSession = any> = JsonProjectTemplate & {
  // Unknown parameters.
  setup?: {
    beforeForkDocument?: (
      model: Readonly<CaptureModel['document']>,
      extra: {
        api: ApiClient;
        options: any;
      }
    ) =>
      | Promise<CaptureModel['document'] | Readonly<CaptureModel['document']> | undefined | void>
      | CaptureModel['document']
      | Readonly<CaptureModel['document']>
      | void
      | undefined;
    onCreateConfiguration?: (
      config: ProjectConfiguration,
      extra: {
        api: ApiClient;
        options: any;
      }
    ) => ProjectConfiguration | void | undefined | Promise<ProjectConfiguration | void | undefined>;
    onCreateProject?: (
      project: ProjectRow,
      extra: {
        api: ApiClient;
        options: any;
      }
    ) => void | Promise<void>;
  };
  hooks?: {
    onCreateUserRevisionSession?: () => RevSession;
    onAddContentToProject?: () => void | Promise<void>;
    onRemoveContentFromProject?: () => void | Promise<void>;
    canContentBeAddedToProject?: () => boolean | Promise<boolean>;
    onProjectStatus?: (status: number) => void | Promise<void>;
    onLoadRevision?: () => void | Promise<void>;
    beforeSaveRevision?: () => void | Promise<void>;
    beforeCloneModel?: () => void | Promise<void>;
    onSubmitRevision?: () => void | Promise<void>;
    onRevisionApproved?: () => void | Promise<void>;
    onRevisionRejected?: () => void | Promise<void>;
    onResourceComplete?: () => void | Promise<void>;
    onCreateReview?: () => void | Promise<void>;
    onAssignReview?: () => void | Promise<void>;
  };
  components?: {
    customEditor?: React.FC<any>;
  };
  source?: { type: string; id?: string; name: string };
};
