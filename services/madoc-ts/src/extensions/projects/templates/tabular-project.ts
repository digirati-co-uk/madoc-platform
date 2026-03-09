import React from 'react';
import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import {
  TABULAR_CELL_FLAGS_PROPERTY,
  createTabularCellFlagsCaptureModelField,
} from '../../../frontend/shared/utility/tabular-cell-flags';
import { ProjectTemplate } from '../types';

type TabularColumnConfig = {
  id?: string;
  label?: string;
  type?: string;
  fieldType?: string;
  helpText?: string;
  saved?: boolean;
};

type TabularCaptureModelField = {
  type?: string;
  label?: string;
  description?: string;
};

type TabularCaptureModelTemplate = {
  __entity__?: { label: string };
  [term: string]: TabularCaptureModelField | { label: string } | undefined;
};

export type TabularWizardSetup = {
  structure?: {
    topLeft?: { x: number; y: number };
    topRight?: { x: number; y: number };
    marginsPct?: {
      top: number;
      right: number;
      bottom: number;
      left: number;
    };
    columnCount?: number;
    columnWidthsPctOfPage?: number[];
    rowHeightsPctOfPage?: number[];
    blankColumnIndexes?: number[];
  };
  model?: {
    columns?: TabularColumnConfig[];
    captureModelFields?: Record<string, TabularCaptureModelField>;
    captureModelTemplate?: TabularCaptureModelTemplate;
  };
};

export type TabularProjectTemplateOptions = {
  enableZoomTracking?: boolean;
  iiif?: {
    manifestId?: string;
    canvasId?: string;
  };
  tabular?: TabularWizardSetup;
};

const fallbackCaptureModelTemplate = {
  __entity__: { label: 'Tabular row' },
  value: {
    type: 'text-field',
    label: 'Value',
  },
  [TABULAR_CELL_FLAGS_PROPERTY]: createTabularCellFlagsCaptureModelField(),
};

const getCaptureModelTemplateFromOptions = (options: TabularProjectTemplateOptions) => {
  const template = options.tabular?.model?.captureModelTemplate;
  if (!template) {
    return null;
  }

  const fieldKeys = Object.keys(template).filter(key => !key.startsWith('__'));
  if (!fieldKeys.length) {
    return null;
  }

  return template;
};

const TabularProjectCustomEditorLazy = React.lazy(async () => {
  const module = await import('../editors/tabular-project-custom-editor');
  return { default: module.TabularProjectCustomEditor };
});

const TabularProjectCustomEditorLoader: React.FC = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return React.createElement(React.Suspense, { fallback: null }, React.createElement(TabularProjectCustomEditorLazy));
};

export const tabularProject: ProjectTemplate<TabularProjectTemplateOptions> = {
  type: 'tabular-project',
  metadata: {
    label: 'Tabular data project',
    description: 'Build a tabular capture model to support transcribing data for your project, using a table structure',
    version: '1.0.0',
    actionLabel: 'Create tabular data project',
  },
  captureModel: {
    // Fallback model for non-wizard creation paths.
    document: captureModelShorthand(fallbackCaptureModelTemplate),
  },
  configuration: {
    defaults: {
      claimGranularity: 'canvas',
      contributionMode: 'annotation',
      allowCollectionNavigation: true,
      allowManifestNavigation: true,
      allowCanvasNavigation: true,
      randomlyAssignCanvas: false,
      maxContributionsPerResource: false,
      allowSubmissionsWhenCanvasComplete: false,
      modelPageOptions: {
        enableSplitView: true,
        enableTooltipDescriptions: true,
      },
    },
    immutable: [
      'claimGranularity',
      'contributionMode',
      'allowCollectionNavigation',
      'allowManifestNavigation',
      'allowCanvasNavigation',
      'randomlyAssignCanvas',
      'maxContributionsPerResource',
    ],
    captureModels: {
      // Tabular models are created from wizard inputs and should not be edited
      // with the generic structure/document editors.
      preventChangeStructure: true,
      preventChangeDocument: true,
    },
  },
  setup: {
    defaults: {
      enableZoomTracking: false,
      iiif: {},
      tabular: {},
    },
    async beforeForkDocument(doc, { options }) {
      const captureModelTemplate = getCaptureModelTemplateFromOptions(options);
      if (!captureModelTemplate) {
        return doc;
      }

      return captureModelShorthand(captureModelTemplate);
    },
  },
  components: {
    customEditor: TabularProjectCustomEditorLoader,
  },
};
