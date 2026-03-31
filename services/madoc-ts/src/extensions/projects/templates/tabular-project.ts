import React from 'react';
import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import type { TabularRowOffsetAdjustment } from '../../../frontend/shared/utility/tabular-types';
import type { CustomReviewRendererProps } from '../../../frontend/site/pages/tasks/review-renderers/types';
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
  dropdownOptionsText?: string;
  saved?: boolean;
};

type TabularCaptureModelField = {
  type?: string;
  label?: string;
  description?: string;
  options?: Array<{ value?: string; text?: string; label?: string }>;
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
    rowOffsetAdjustments?: TabularRowOffsetAdjustment[];
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
  crowdsourcingInstructions?: string;
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
const TabularProjectReviewRendererLazy = React.lazy(async () => {
  const module = await import('../editors/tabular-project-review-renderer');
  return { default: module.TabularProjectReviewRenderer };
});

const TabularProjectCustomEditorLoader: React.FC = () => {
  if (typeof window === 'undefined') {
    return null;
  }

  return React.createElement(React.Suspense, { fallback: null }, React.createElement(TabularProjectCustomEditorLazy));
};

const TabularProjectReviewRendererLoader: React.FC<CustomReviewRendererProps> = props => {
  if (typeof window === 'undefined') {
    return null;
  }

  return React.createElement(
    React.Suspense,
    { fallback: null },
    React.createElement(TabularProjectReviewRendererLazy, props)
  );
};

export const tabularProject: ProjectTemplate<TabularProjectTemplateOptions> = {
  type: 'tabular-project',
  metadata: {
    label: 'Tabular data project',
    description: 'Build a tabular capture model to support transcribing data for your project, using a table structure',
    version: '1.0.0',
    actionLabel: 'Create tabular data project',
    thumbnail: `<svg width="109" height="109" viewBox="0 0 109 109" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" fill-rule="evenodd">
    <rect x="1" y="1" width="107" height="107" rx="5" stroke="#E7E9EC" stroke-width="2"/>
    <g stroke="#E7E9EC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round">
      <rect x="18" y="18" width="66" height="66" rx="5"/>
      <path d="M40 18V84"/>
      <path d="M62 18V84"/>
      <path d="M18 40H84"/>
      <path d="M18 62H84"/>
    </g>
    <g fill-rule="nonzero">
      <path fill="#9DAEF0" fill-opacity=".7"
        d="M82 43 84.5 37.6 90 35 84.5 32.4 82 27 79.5 32.4 74 35 79.5 37.6z"/>
      <path fill="#5B78E5"
        d="M60 55 53.5 41 47 55 33 61.5 47 68 53.5 82 60 68 74 61.5z"/>
      <path fill="#5B78E5" fill-opacity=".45"
        d="M82 70 79.5 75.4 74 78 79.5 80.6 82 86 84.5 80.6 90 78 84.5 75.4z"/>

    </g>

  </g>
</svg>`,
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
      allowPersonalNotes: true,
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
      crowdsourcingInstructions: '',
      iiif: {},
      tabular: {},
    },
    async beforeForkDocument(doc, { options }) {
      const captureModelTemplate = getCaptureModelTemplateFromOptions(options);
      const nextDocument = captureModelTemplate ? captureModelShorthand(captureModelTemplate) : doc;
      const instructions = options.crowdsourcingInstructions;
      return instructions ? { ...nextDocument, instructions } : nextDocument;
    },
    async beforeForkStructure(fullModel, { options }) {
      const instructions = options.crowdsourcingInstructions;
      const structure = fullModel.structure;
      if (!instructions || !structure?.items?.length) {
        return structure;
      }

      const [firstItem, ...remainingItems] = structure.items;
      return {
        ...structure,
        items: [{ ...firstItem, instructions }, ...remainingItems],
      };
    },
  },
  components: {
    customEditor: TabularProjectCustomEditorLoader,
    customReviewRenderer: TabularProjectReviewRendererLoader,
  },
};
