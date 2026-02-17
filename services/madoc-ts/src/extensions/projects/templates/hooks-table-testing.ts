import React from 'react';
import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import type {
  CustomAdminPreviewRendererProps,
  CustomReviewRendererProps,
} from '../../../frontend/site/pages/tasks/review-renderers/types';
import { ProjectTemplate } from '../types';
import {
  hooksTableTestingRowFields,
  hooksTableTestingTopLevelFields,
  toCaptureModelFieldDefinition,
} from './hooks-table-testing-fields';

const HooksTableCustomEditorLazy = React.lazy(async () => {
  const module = await import('../editors/hooks-table-custom-editor');
  return { default: module.HooksTableCustomEditor };
});
const HooksTableReviewRendererLazy = React.lazy(async () => {
  const module = await import('../editors/hooks-table-review-renderer');
  return { default: module.HooksTableReviewRenderer };
});
const HooksTableAdminPreviewRendererLazy = React.lazy(async () => {
  const module = await import('../editors/hooks-table-admin-preview-renderer');
  return { default: module.HooksTableAdminPreviewRenderer };
});

const HooksTableCustomEditorLoader: React.FC = () => {
  // Avoid loading custom editor implementation during server bootstrap.
  if (typeof window === 'undefined') {
    return null;
  }

  return React.createElement(
    React.Suspense,
    { fallback: null },
    React.createElement(HooksTableCustomEditorLazy)
  );
};

const HooksTableReviewRendererLoader: React.FC<CustomReviewRendererProps> = props => {
  if (typeof window === 'undefined') {
    return null;
  }

  return React.createElement(
    React.Suspense,
    { fallback: null },
    React.createElement(HooksTableReviewRendererLazy, props)
  );
};

const HooksTableAdminPreviewRendererLoader: React.FC<CustomAdminPreviewRendererProps> = props => {
  if (typeof window === 'undefined') {
    return null;
  }

  return React.createElement(
    React.Suspense,
    { fallback: null },
    React.createElement(HooksTableAdminPreviewRendererLazy, props)
  );
};

const rowModelFields = hooksTableTestingRowFields.reduce<Record<string, Record<string, unknown>>>((acc, field) => {
  acc[`rows.${field.key}`] = toCaptureModelFieldDefinition(field);
  return acc;
}, {});

const topLevelModelFields = hooksTableTestingTopLevelFields.reduce<Record<string, Record<string, unknown>>>(
  (acc, field) => {
    acc[field.key] = toCaptureModelFieldDefinition(field);
    return acc;
  },
  {}
);

const hooksTableTestingModel = captureModelShorthand({
  __nested__: {
    rows: { label: 'Tabular row', allowMultiple: true },
  },
  ...rowModelFields,
  ...topLevelModelFields,
});

export const hooksTableTesting: ProjectTemplate = {
  type: 'hooks-table-testing',
  metadata: {
    label: '[TEST] Hooks table editor',
    description: 'Temporary local template for validating hooks-based custom capture model editor behavior.',
    version: '1.0.0',
    actionLabel: 'Create hooks table test project',
  },
  captureModel: {
    document: hooksTableTestingModel,
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
      preventChangeStructure: false,
      preventChangeDocument: false,
    },
  },
  components: {
    customEditor: HooksTableCustomEditorLoader,
    customReviewRenderer: HooksTableReviewRendererLoader,
    customAdminPreviewRenderer: HooksTableAdminPreviewRendererLoader,
  },
};
