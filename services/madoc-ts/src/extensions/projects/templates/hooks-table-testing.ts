import React from 'react';
import { captureModelShorthand } from '../../../frontend/shared/capture-models/helpers/capture-model-shorthand';
import { ProjectTemplate } from '../types';

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

const HooksTableReviewRendererLoader: React.FC<any> = props => {
  if (typeof window === 'undefined') {
    return null;
  }

  return React.createElement(
    React.Suspense,
    { fallback: null },
    React.createElement(HooksTableReviewRendererLazy, props)
  );
};

const HooksTableAdminPreviewRendererLoader: React.FC<any> = props => {
  if (typeof window === 'undefined') {
    return null;
  }

  return React.createElement(
    React.Suspense,
    { fallback: null },
    React.createElement(HooksTableAdminPreviewRendererLazy, props)
  );
};

const hooksTableTestingModel = captureModelShorthand({
  __nested__: {
    rows: { label: 'Tabular row', allowMultiple: true },
  },
  'rows.entry': {
    type: 'text-field',
    label: 'Entry',
  },
  'rows.value': {
    type: 'text-field',
    label: 'Value',
  },
  'rows.comment': {
    type: 'text-field',
    label: 'Comment',
    multiline: true,
    minLines: 2,
  },
  pageNotes: {
    type: 'text-field',
    label: 'Page notes',
    multiline: true,
    minLines: 3,
  },
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
      preventChangeStructure: true,
      preventChangeDocument: true,
    },
  },
  components: {
    customEditor: HooksTableCustomEditorLoader,
    customReviewRenderer: HooksTableReviewRendererLoader,
    customAdminPreviewRenderer: HooksTableAdminPreviewRendererLoader,
  },
};
