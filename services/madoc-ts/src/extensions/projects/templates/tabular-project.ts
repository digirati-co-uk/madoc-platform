import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
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

type TabularWizardSetup = {
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
    captureModelTemplate?: Record<string, TabularCaptureModelField | { label: string } | undefined>;
  };
};

type TabularProjectTemplateOptions = {
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
};

const getCaptureModelTemplateFromOptions = (options: TabularProjectTemplateOptions) => {
  const template = options.tabular?.model?.captureModelTemplate;
  if (!template) {
    return null;
  }

  const fieldKeys = Object.keys(template).filter(key => key !== '__entity__');
  if (!fieldKeys.length) {
    return null;
  }

  return template;
};

export const tabularProject: ProjectTemplate<TabularProjectTemplateOptions> = {
  type: 'tabular-project',
  metadata: {
    label: 'Tabular data project',
    description: 'Create a tabular data project using a guided setup flow.',
    version: '1.0.0',
    actionLabel: 'Create tabular project',
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
};
