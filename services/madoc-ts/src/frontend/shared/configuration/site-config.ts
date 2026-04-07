import { ProjectConfiguration, ProjectConfigurationNEW } from '../../../types/schemas/project-configuration';
import { BaseField } from '../capture-models/types/field-types';
import { parseTabularRowCount, TABULAR_OVERLAY_DEFAULT_COLORS } from '../utility/tabular-project-config';

export type ProjectConfigTemplate = {
  [_key in keyof Partial<ProjectConfigurationNEW>]: string | (Partial<BaseField> & any);
};

const TABULAR_OVERLAY_COLOR_FIELDS = {
  tabularHeaderOverlayColor: {
    label: 'Canvas overlay color: header row',
    description: 'Color used to highlight the header row overlay.',
    type: 'color-field',
    defaultValue: TABULAR_OVERLAY_DEFAULT_COLORS.header,
  },
  tabularActiveRowOverlayColor: {
    label: 'Canvas overlay color: highlighted row',
    description: 'Color used for the highlighted row overlay.',
    type: 'color-field',
    defaultValue: TABULAR_OVERLAY_DEFAULT_COLORS.row,
  },
  tabularActiveCellOverlayColor: {
    label: 'Canvas overlay color: highlighted cell',
    description: 'Color used for the highlighted cell overlay.',
    type: 'color-field',
    defaultValue: TABULAR_OVERLAY_DEFAULT_COLORS.cell,
  },
} as const;

export function postProcessConfiguration(config: Partial<ProjectConfiguration>): ProjectConfiguration {
  if (config.revisionApprovalsRequired) {
    config.revisionApprovalsRequired = Number(config.revisionApprovalsRequired);
  }

  if ((config.maxContributionsPerResource as any) === '') {
    config.maxContributionsPerResource = false;
  }

  const tabularDefaultRowCount = (config as any).tabularDefaultRowCount;
  if (tabularDefaultRowCount === '') {
    delete (config as any).tabularDefaultRowCount;
  } else if (typeof tabularDefaultRowCount !== 'undefined') {
    const parsedRowCount = parseTabularRowCount(tabularDefaultRowCount);
    if (typeof parsedRowCount === 'number') {
      (config as any).tabularDefaultRowCount = parsedRowCount;
    }
  }

  return config as any;
}

export const siteConfigurationModel: {
  [_key in keyof ProjectConfiguration]: string | (Partial<BaseField> & any);
} = {
  allowCollectionNavigation: {
    label: 'Collection navigation',
    description:
      'Allow users to navigate through the collections. If this option is disabled then users will have to be assigned canvases or manifests to see them, or optionally pick up a random resource.',
    type: 'checkbox-field',
    inlineLabel: 'Allow collection navigation',
  },
  allowManifestNavigation: {
    label: 'Manifest navigation',
    description:
      'Allow users to navigate through a manifest of images. If this option is disabled then users will have to be assigned canvases or the whole manifest to navigate them.',
    type: 'checkbox-field',
    inlineLabel: 'Allow manifest navigation',
  },
  allowCanvasNavigation: {
    label: 'Canvas navigation',
    inlineLabel: 'Allow canvas navigation',
    type: 'checkbox-field',
  },
  randomlyAssignCanvas: {
    type: 'checkbox-field',
    label: 'Assigning a canvas',
    inlineLabel: 'Randomly assign canvas to user',
  },
  priorityRandomness: {
    label: 'Strategy for assigning canvases',
    type: 'checkbox-field',
    inlineLabel: 'Prioritise canvases sequentially',
  },
  randomCanvas: {
    label: 'Randomly select canvas when randomly selecting resource',
    type: 'checkbox-field',
    inlineLabel: 'Randomly select canvas',
  },
  claimGranularity: {
    label: 'Claim granularity',
    description: 'When a user claims something to work on, should they receive a single image or the whole manifest',
    type: 'dropdown-field',
    options: [
      { value: 'canvas', text: 'Canvas' },
      // Disabled option.
      { value: 'manifest', text: 'Manifest' },
    ],
  },
  forkMode: {
    type: 'checkbox-field',
    label: 'Unique submissions',
    description:
      'When enabled each submission by a user will be a distinct submission and not contributing to a single document',
    inlineLabel: 'Enable unique submissions',
  },
  maxContributionsPerResource: {
    label: 'Contributors per resource',
    type: 'text-field',
  },
  allowSubmissionsWhenCanvasComplete: {
    label: 'After a canvas has been marked as complete',
    type: 'checkbox-field',
    inlineLabel: 'Allow further submissions',
  },
  randomlyAssignReviewer: {
    label: 'When assigning a reviewer',
    type: 'checkbox-field',
    inlineLabel: 'Randomly assign a reviewer',
  },
  manuallyAssignedReviewer: {
    label: 'Custom reviewer (numeric id)',
    type: 'text-field',
  },
  adminsAreReviewers: {
    label: 'When assigning a reviewer',
    type: 'checkbox-field',
    inlineLabel: 'Admins count as reviewers',
  },
  hideCompletedResources: {
    label: 'Once a resource (canvas or manifest) is complete',
    type: 'checkbox-field',
    inlineLabel: 'Hide it from the resource page in the project',
  },
  revisionApprovalsRequired: {
    label: 'Submission approvals required',
    type: 'text-field',
  },
  contributionWarningTime: {
    label: 'Contribution warning time',
    description:
      'If a contribution takes longer than this time (in seconds) then they will receive a message to let them know',
    type: 'text-field',
  },
  skipAutomaticOCRImport: {
    label: 'OCR import',
    type: 'checkbox-field',
    inlineLabel: 'Skip automatically processing OCR during IIIF manifest import',
  },
  allowPersonalNotes: {
    label: 'Personal notes',
    type: 'checkbox-field',
    inlineLabel: 'Allow users to take personal notes only visible to themselves on canvases in a project.',
  },
  defaultEditorOrientation: {
    label: 'Default editor orientation',
    description:
      'When a user makes a contribution they will see the form either to the right of (horizontal) or below the image (vertical). The user can still change this if they want.',
    type: 'dropdown-field',
    options: [
      { value: 'vertical', text: 'Vertical (under)' },
      { value: 'horizontal', text: 'Horizontal (to the right) ' },
    ],
  },
  skipManifestListingPage: {
    label: 'Manifest display options',
    type: 'checkbox-field',
    inlineLabel: 'Skip showing list of manifest thumbnails',
  },
  hideStatistics: {
    label: 'Hide statistics on projects page',
    type: 'checkbox-field',
    inlineLabel: 'Hide statistics',
  },
  hideProjectCollectionNavigation: {
    label: 'Hide collection list from project homepage',
    type: 'checkbox-field',
    inlineLabel: 'Hide collections on project',
  },
  hideProjectManifestNavigation: {
    label: 'Hide manifest list from project homepage',
    type: 'checkbox-field',
    inlineLabel: 'Hide manifests on project',
  },
  searchStrategy: {
    label: 'Search strategy',
    description: 'This is the type of search to use in constructing the query.',
    type: 'dropdown-field',
    options: [
      { value: 'websearch', text: 'Web search' },
      { value: 'phrase', text: 'Phrase' },
      { value: 'plain', text: 'Plain' },
      { value: 'raw', text: 'Raw' },
    ],
  },
  hideManifestMetadataOnCanvas: {
    label: 'Hide manifest metadata on canvas page',
    type: 'checkbox-field',
    inlineLabel: 'Hide manifest metadata',
  },
  hideCanvasThumbnailNavigation: {
    label: 'Hide manifest thumbnail navigation on canvas page',
    type: 'checkbox-field',
    inlineLabel: 'Hide manifest thumbnail navigation',
  },
  showSearchFacetCount: {
    label: 'Show search facet count',
    type: 'checkbox-field',
    inlineLabel: 'Show number of matches manifests in search facets',
  },
  miradorCanvasPage: {
    label: 'Use Mirador on canvas page',
    type: 'checkbox-field',
    inlineLabel: 'Use Mirador in place of the default viewer',
  },
  universalViewerCanvasPage: {
    label: 'Use Universal Viewer on canvas page',
    type: 'checkbox-field',
    inlineLabel: 'Use UniversalViewer in place of the default viewer',
  },
  atlasBackground: {
    label: 'Atlas background',
    type: 'color-field',
    description: 'Change the background of the deep zoom viewer',
    defaultValue: '#f9f9f9',
  },

  contributionMode: {
    label: 'Contribution mode',
    description: 'This changes many aspects of how contributions work. (default = annotation)',
    type: 'dropdown-field',
    options: [
      { value: 'annotation', text: 'Annotation mode (default)' },
      { value: 'transcription', text: 'Transcription mode' },
    ],
  },
  shortExpiryTime: {
    label: 'Short expiry time (minutes)',
    description: 'The number of minutes after which to expire an un-started manifest task (default = 10 mins)',
    type: 'text-field',
  },
  longExpiryTime: {
    label: 'Long expiry time (minutes)',
    description: 'The number of minutes after which to expire an accepted manifest task (default = 1440 mins = 1 day)',
    type: 'text-field',
  },
  // Annotation options.

  canvasPageShowAnnotations: {
    label: 'Canvas page annotations',
    description: 'Decide when annotations are shown on the canvas page',
    type: 'dropdown-field',
    options: [
      { value: 'when-open', text: 'Show when panel is open' },
      { value: 'highlighted', text: 'Only show if highlighted' },
      { value: 'always', text: 'Always show' },
    ],
  },

  canvasPageShowDocument: {
    label: 'Canvas page document regions',
    description: 'Decide when document regions are shown on the canvas page',
    type: 'dropdown-field',
    options: [
      { value: 'when-open', text: 'Show when panel is open' },
      { value: 'highlighted', text: 'Only show if highlighted' },
      { value: 'always', text: 'Always show' },
    ],
  },

  modelPageShowAnnotations: {
    label: 'Contribution page annotations',
    description: 'Decide when annotations are shown when a user is on the contributing page',
    type: 'dropdown-field',
    options: [
      { value: 'when-open', text: 'Show when panel is open' },
      { value: 'highlighted', text: 'Only show if highlighted' },
      { value: 'always', text: 'Always show' },
    ],
  },

  modelPageShowDocument: {
    label: 'Contribution page document regions',
    description: 'Decide when document regions are shown when a user is on the contributing page',
    type: 'dropdown-field',
    options: [
      { value: 'when-open', text: 'Show when panel is open' },
      { value: 'highlighted', text: 'Only show if highlighted' },
      { value: 'always', text: 'Always show' },
    ],
  },

  // Page options.
  modelPageOptions: {
    label: 'Contribution page',
    description: 'View options for the contributions page',
    type: 'checkbox-list-field',
    allowMultiple: false,
    options: [
      {
        label: 'Fixed transcription bar',
        value: 'fixedTranscriptionBar',
      },
      {
        label: 'Prevent contribution after rejection',
        value: 'preventContributionAfterRejection',
      },
      {
        label: 'Prevent contribution after submission',
        value: 'preventContributionAfterSubmission',
      },
      {
        label: 'Only one submission per user, per resource',
        value: 'preventMultipleUserSubmissionsPerResource',
      },
      {
        label: 'Show random manifest button after last canvas submission',
        value: 'showRandomManifestAfterSubmission',
      },
      {
        label: 'Prevent submissions after expiry (existing canvases)',
        value: 'preventContributionAfterManifestUnassign',
      },
      {
        label: 'Hide viewer controls (zoom + home)',
        value: 'hideViewerControls',
      },
      {
        label: 'Disable save for later button',
        value: 'disableSaveForLater',
      },
      {
        label: 'Disable preview popup (direct submit)',
        value: 'disablePreview',
      },
      {
        label: 'Disable next canvas prompt after submission',
        value: 'disableNextCanvas',
      },
      {
        label: 'Enable rotation of images',
        value: 'enableRotation',
      },
      {
        label: 'Enable autosave',
        value: 'enableAutoSave',
      },
      {
        label: 'Enable tooltip descriptions',
        value: 'enableTooltipDescriptions',
      },
      {
        label: 'Enable split-view',
        value: 'enableSplitView',
      },
    ],
  },
  reviewOptions: {
    label: 'Review options',
    description: 'Options for review listing and pages',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Allow merging submissions',
        value: 'allowMerging',
      },
      {
        label: 'Allow auto-review if assigned to automated user',
        value: 'enableAutoReview',
      },
    ],
  },
  projectPageOptions: {
    label: 'Project landing page',
    description: 'View options for the project landing page',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Hide contributing button',
        value: 'hideStartContributing',
      },
      {
        label: 'Hide search button',
        value: 'hideSearchButton',
      },
      {
        label: 'Hide go to random manifest',
        value: 'hideRandomManifest',
      },
      {
        label: 'Hide go to random canvas',
        value: 'hideRandomCanvas',
      },
    ],
  },
  manifestPageOptions: {
    label: 'Manifest page',
    description: 'View options for the manifest landing page',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Hide start contributing button',
        value: 'hideStartContributing',
      },
      {
        label: 'Hide open in mirador button',
        value: 'hideOpenInMirador',
      },
      {
        label: 'Hide open in Theseus button',
        value: 'hideOpenInTheseus',
      },
      {
        label: 'Hide search button',
        value: 'hideSearchButton',
      },
      {
        label: 'Hide go to random canvas button',
        value: 'hideRandomCanvas',
      },
      {
        label: 'Show button to generate PDF',
        value: 'generatePDF',
      },
      {
        label: 'Hide image filtering',
        description: 'Hide the ability to filter images by their contribution status',
        value: 'hideFilterImages',
      },
      {
        label: 'Navigate directly to model page from manifest',
        value: 'directModelPage',
      },
      {
        label: 'Show IIIF drag and drop logo',
        value: 'showIIIFLogo',
      },
      {
        label: 'Covered image style variation',
        value: 'coveredImages',
      },
      {
        label: 'Rectangular image variation',
        value: 'rectangularImages',
      },
      {
        label: 'Hide canvas labels on manifest listing',
        value: 'hideCanvasLabels',
      },
    ],
  },
  headerOptions: {
    label: 'Header options',
    description: 'View options for the global site navigation',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Hide the site title',
        value: 'hideSiteTitle',
      },
      {
        label: 'Hide the projects link',
        value: 'hideProjectsLink',
      },
      {
        label: 'Hide the collections link',
        value: 'hideCollectionsLink',
      },
      {
        label: 'Hide the dashboard link',
        value: 'hideDashboardLink',
      },
      {
        label: 'Hide the page navigation links',
        value: 'hidePageNavLinks',
      },
      {
        label: 'Show reviews link',
        value: 'showReviews',
      },
      {
        label: 'Hide the search bar',
        value: 'hideSearchBar',
      },
    ],
  },
  searchOptions: {
    label: 'Search options',
    description: 'View and query options for search pages',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Non-latin fulltext',
        value: 'nonLatinFulltext',
      },
      {
        label: 'Search multiple fields',
        value: 'searchMultipleFields',
      },
      {
        label: 'Only show manifests',
        value: 'onlyShowManifests',
      },
    ],
  },
  activityStreams: {
    label: 'Activity streams',
    description: 'Below are the enabled activity streams. When you enable them, only new activity will be recorded.',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Completed manifests activity',
        value: 'manifest',
      },
      {
        label: 'Completed canvas activity (not yet implemented)',
        value: 'canvas',
      },
      {
        label: 'Curated activity feed',
        value: 'curated',
      },
      {
        label: 'Project published feed (not yet implemented)',
        value: 'published',
      },
    ],
  },
  metadataSuggestions: {
    label: 'Metadata suggestions',
    description: 'Allow users to suggest additions or corrections to metadata',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Collection metadata',
        value: 'collection',
      },
      {
        label: 'Manifest metadata',
        value: 'manifest',
      },
      {
        label: 'Canvas metadata',
        value: 'canvas',
      },
    ],
  },
};

export const NonProjectOptions: ProjectConfigTemplate = {
  headerOptions: {
    label: 'Global site navigation',
    description: 'View options for the global site navigation',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Hide the site title',
        value: 'hideSiteTitle',
      },
      {
        label: 'Hide the projects link',
        value: 'hideProjectsLink',
      },
      {
        label: 'Hide the collections link',
        value: 'hideCollectionsLink',
      },
      {
        label: 'Hide the dashboard link',
        value: 'hideDashboardLink',
      },
      {
        label: 'Hide the page navigation links',
        value: 'hidePageNavLinks',
      },
      {
        label: 'Show reviews link',
        value: 'showReviews',
      },
      {
        label: 'Hide the search bar',
        value: 'hideSearchBar',
      },
    ],
  },
  skipAutomaticOCRImport: {
    label: 'OCR import',
    type: 'checkbox-field',
    inlineLabel: 'Skip automatically processing OCR during IIIF manifest import',
  },
};

export const ProjectConfigInterface: ProjectConfigTemplate = {
  projectPageOptions: {
    label: 'Project page options',
    description: 'UI customisations for the default page blocks on the project page',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Hide statistics',
        value: 'hideStatistics',
      },
      {
        label: 'Hide collection list',
        value: 'hideProjectCollectionNavigation',
      },
      {
        label: 'Hide manifest list',
        value: 'hideProjectManifestNavigation',
      },
      {
        label: 'Hide start contributing button',
        value: 'hideStartContributing',
      },
      {
        label: 'Hide start search button',
        value: 'hideSearchButton',
      },
      {
        label: 'Hide go to random manifest',
        value: 'hideRandomManifest',
      },
      {
        label: 'Hide go to random canvas',
        value: 'hideRandomCanvas',
      },
    ],
  },
  // collectionPageOptions: {
  //   label: 'Collection page options',
  //   description: '..todo',
  //   type: 'checkbox-list-field',
  //   options: [
  //     {
  //       label: 'Hide search button',
  //       value: 'hideSearchButton',
  //     },
  //     {
  //       label: 'Hide go to random manifest button',
  //       value: 'hideRandomManifest',
  //     },
  //     {
  //       label: 'Hide go to random canvas button',
  //       value: 'hideRandomCanvas',
  //     },
  //   ],
  // },
  manifestPageOptions: {
    label: 'Manifest page options',
    description: 'UI customisations for the default page blocks on the manifest page',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Hide manifest metadata',
        value: 'hideManifestMetadataOnCanvas',
      },
      {
        label: 'Hide start contributing button',
        value: 'hideStartContributing',
      },
      {
        label: 'Hide open in mirador button',
        value: 'hideOpenInMirador',
      },
      {
        label: 'Hide open in Theseus button',
        value: 'hideOpenInTheseus',
      },
      {
        label: 'Hide search button',
        value: 'hideSearchButton',
      },
      {
        label: 'Hide go to random canvas button',
        value: 'hideRandomCanvas',
      },
      {
        label: 'Hide image filtering',
        value: 'hideFilterImages',
      },
      {
        label: 'Navigate directly to model page from manifest',
        value: 'directModelPage',
      },
      {
        label: 'Show IIIF drag and drop logo',
        value: 'showIIIFLogo',
      },
      {
        label: 'Hide generate PDF button',
        value: 'generatePDF',
      },

      {
        label: 'Covered image style variation',
        value: 'coveredImages',
      },
      {
        label: 'Rectangular image variation',
        value: 'rectangularImages',
      },
      {
        label: 'Hide canvas labels on manifest listing',
        value: 'hideCanvasLabels',
      },
      {
        label: 'Skip showing list of manifest thumbnails',
        value: 'skipManifestListingPage',
      },
    ],
  },
  atlasBackground: {
    label: 'Atlas background',
    type: 'color-field',
    description: 'Change the background of the deep zoom viewer (default: #f9f9f9)',
    defaultValue: '#f9f9f9',
  },
  canvasPageOptions: {
    label: 'Canvas page options',
    description: 'These options can be overridden on the canvas page using page blocks',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Use Mirador Viewer',
        description: 'Use Mirador in place of the default viewer',
        value: 'miradorCanvasPage',
      },
      {
        label: 'Use Universal Viewer',
        description: 'Use UniversalViewer in place of the default viewer',
        value: 'universalViewerCanvasPage',
      },
      {
        label: 'Hide thumbnail navigation',
        description: 'Hide manifest thumbnail navigation',
        value: 'hideCanvasThumbnailNavigation',
      },
    ],
  },
};

export const ProjectConfigSearch: ProjectConfigTemplate = {
  navigation: {
    label: 'Navigation',
    description: '',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Allow collection navigation',
        value: 'allowCollectionNavigation',
      },
      {
        label: 'Allow manifest navigation',
        value: 'allowManifestNavigation',
      },
      {
        label: 'Allow canvas navigation',
        value: 'allowCanvasNavigation',
      },
    ],
  },
  searchStrategy: {
    label: 'Search strategy',
    description: 'This is the type of search to use in constructing the query.',
    type: 'dropdown-field',
    options: [
      { value: 'websearch', text: 'Web search' },
      { value: 'phrase', text: 'Phrase' },
      { value: 'plain', text: 'Plain' },
      { value: 'raw', text: 'Raw' },
    ],
  },
  searchOptions: {
    label: 'Search options',
    description: 'view and query options for search pages',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Non-latin fulltext',
        value: 'nonLatinFulltext',
      },
      {
        label: 'Search multiple fields',
        value: 'searchMultipleFields',
      },
      {
        label: 'Only show manifests',
        value: 'onlyShowManifests',
      },
      {
        label: 'Show search facet count (number of matching manifests)',
        value: 'showSearchFacetCount',
      },
    ],
  },
};

const CONTRIBUTION_MODE_OPTIONS = [
  { value: 'annotation', text: 'Annotation mode (default)' },
  { value: 'transcription', text: 'Transcription mode' },
];

const CLAIM_GRANULARITY_OPTIONS = [
  { value: 'canvas', text: 'Canvas' },
  { value: 'manifest', text: 'Manifest' },
];

const ASSIGNING_CANVAS_OPTIONS = [
  {
    label: 'Prioritise canvases sequentially',
    value: 'priorityRandomness',
  },
  {
    label: 'Randomly assign canvas to a user',
    value: 'randomlyAssignCanvas',
  },
];

const SUBMISSION_OPTIONS = [
  {
    label: 'Disable preview popup (direct submit)',
    value: 'disablePreview',
  },
  {
    label: 'Disable next canvas prompt after submission',
    value: 'disableNextCanvas',
  },
  {
    label: 'Prevent submissions after expiry (existing canvases)',
    value: 'preventContributionAfterManifestUnassign',
  },
  {
    label: 'Prevent contribution after submission',
    value: 'preventContributionAfterSubmission',
  },
  {
    label: 'Prevent contribution after rejection',
    value: 'preventContributionAfterRejection',
  },
];

const sharedProjectContributionFields = {
  contributionMode: {
    label: 'Contribution mode',
    description: 'This changes many aspects of how contributions work. (default = annotation)',
    type: 'dropdown-field',
    options: CONTRIBUTION_MODE_OPTIONS,
  },
  maxContributionsPerResource: {
    label: 'Contributors per resource',
    type: 'text-field',
  },
  preventMultipleUserSubmissionsPerResource: {
    label: 'Only one submission per user, per resource',
    type: 'checkbox-field',
  },
  forkMode: {
    type: 'checkbox-field',
    label: 'Unique submissions',
    description:
      'When enabled each submission by a user will be a distinct submission and not contributing to a single document',
    inlineLabel: 'Enable unique submissions',
  },
  claimGranularity: {
    label: 'Claim granularity',
    description: 'When a user claims something to work on, should they receive a single image or the whole manifest',
    type: 'dropdown-field',
    options: CLAIM_GRANULARITY_OPTIONS,
  },
  assigningCanvas: {
    label: 'Assigning a canvas',
    description: '',
    type: 'checkbox-list-field',
    options: ASSIGNING_CANVAS_OPTIONS,
  },
  randomCanvas: {
    label: 'Randomly select canvas when randomly selecting resource',
    type: 'checkbox-field',
    inlineLabel: 'Randomly select canvas',
  },
};

const sharedProjectContributionTailFields = {
  contributionWarningTime: {
    label: 'Contribution warning time',
    description:
      'If a contribution takes longer than this time (in seconds) then they will receive a message to let them know',
    type: 'text-field',
  },
  shortExpiryTime: {
    label: 'Short expiry time (minutes)',
    description: 'The number of minutes after which to expire an un-started manifest task (default = 10 mins)',
    type: 'text-field',
  },
  longExpiryTime: {
    label: 'Long expiry time (minutes)',
    description: 'The number of minutes after which to expire an accepted manifest task (default = 1440 mins = 1 day)',
    type: 'text-field',
  },
  submissionOptions: {
    label: 'Submission process',
    description: '',
    type: 'checkbox-list-field',
    options: SUBMISSION_OPTIONS,
  },
};

const HIDE_VIEWER_CONTROLS_MODEL_OPTION = {
  label: 'Hide viewer controls (zoom + home)',
  value: 'hideViewerControls',
};

const ENABLE_ROTATION_MODEL_OPTION = {
  label: 'Enable rotation of images',
  value: 'enableRotation',
};

const DISABLE_SAVE_FOR_LATER_MODEL_OPTION = {
  label: 'Disable save for later button',
  value: 'disableSaveForLater',
};

const ENABLE_TOOLTIP_DESCRIPTIONS_MODEL_OPTION = {
  label: 'Enable tooltip descriptions',
  value: 'enableTooltipDescriptions',
};

const genericAllowPersonalNotesModelOption = {
  label: 'Allow personal notes',
  description: 'allow users to take personal notes only visible to themselves on canvases in a project',
  value: 'allowPersonalNotes',
};

const tabularAllowPersonalNotesModelOption = {
  label: 'Allow personal notes',
  description: 'Allow users to take personal notes visible only to themselves.',
  value: 'allowPersonalNotes',
};

const genericContributionModelPageOptions = [
  HIDE_VIEWER_CONTROLS_MODEL_OPTION,
  ENABLE_ROTATION_MODEL_OPTION,
  {
    label: 'Fixed transcription bar',
    value: 'fixedTranscriptionBar',
  },
  DISABLE_SAVE_FOR_LATER_MODEL_OPTION,
  {
    label: 'Enable autosave',
    value: 'enableAutoSave',
  },
  ENABLE_TOOLTIP_DESCRIPTIONS_MODEL_OPTION,
  genericAllowPersonalNotesModelOption,
  {
    label: 'Enable split view',
    value: 'enableSplitView',
  },
];

const tabularContributionModelPageOptions = [
  {
    ...HIDE_VIEWER_CONTROLS_MODEL_OPTION,
    label: 'Hide viewer controls (home + zoom)',
    description: 'Hide the Home and Zoom buttons in the canvas toolbar.',
  },
  {
    ...ENABLE_ROTATION_MODEL_OPTION,
    description: 'Show the rotate control in the canvas toolbar.',
  },
  {
    ...DISABLE_SAVE_FOR_LATER_MODEL_OPTION,
    description: 'Remove the Save for later button from the submission bar.',
  },
  {
    ...ENABLE_TOOLTIP_DESCRIPTIONS_MODEL_OPTION,
    description: 'Show column descriptions as tooltips in the table header.',
  },
  tabularAllowPersonalNotesModelOption,
  {
    label: 'Enable cell flagging',
    description: 'Allow contributors to flag cells and add comments that can be turned into notes by reviewers.',
    value: 'enableCellFlagging',
  },
  {
    label: 'Enable zoom tracking/overlay',
    description: 'Keep the active table cell aligned with the canvas via the overlay.',
    value: 'enableZoomTracking',
  },
  {
    label: 'Hide zoom tracking toggle control',
    description: 'Hide the toolbar toggle and keep zoom tracking enabled.',
    value: 'hideZoomTrackingToggle',
  },
  {
    label: 'Hide zoom tracking nudge controls',
    description: 'Hide the up/down nudge controls for adjusting overlay alignment.',
    value: 'hideZoomTrackingNudgeControls',
  },
];

const annotationVisibilityOptions = [
  { value: 'when-open', text: 'Show when panel is open' },
  { value: 'highlighted', text: 'Only show if highlighted' },
  { value: 'always', text: 'Always show' },
];

export const ProjectConfigContributions: ProjectConfigTemplate = {
  ...sharedProjectContributionFields,
  showRandomManifestAfterSubmission: {
    label: 'Show random manifest button after last canvas submission',
    type: 'checkbox-field',
  },
  defaultEditorOrientation: {
    label: 'Default editor orientation',
    description:
      'When a user makes a contribution they will see the form either to the right of (horizontal) or below the image (vertical). The user can still change this if they want.',
    type: 'dropdown-field',
    options: [
      { value: 'vertical', text: 'Vertical (under)' },
      { value: 'horizontal', text: 'Horizontal (to the right) ' },
    ],
  },
  modelPageOptions: {
    label: 'Contribution Panel',
    description: 'View options for the contributions pnnel',
    type: 'checkbox-list-field',
    allowMultiple: false,
    options: genericContributionModelPageOptions,
  },
  ...sharedProjectContributionTailFields,
  modelPageShowAnnotations: {
    label: 'Contribution page annotations',
    description: 'Decide when annotations are shown when a user is on the contributing page',
    type: 'dropdown-field',
    options: annotationVisibilityOptions,
  },
  modelPageShowDocument: {
    label: 'Contribution page document regions',
    description: 'Decide when document regions are shown when a user is on the contributing page',
    type: 'dropdown-field',
    options: annotationVisibilityOptions,
  },
  canvasPageShowAnnotations: {
    label: 'Canvas page annotations',
    description: 'Decide when annotations are shown on the canvas page',
    type: 'dropdown-field',
    options: annotationVisibilityOptions,
  },
  canvasPageShowDocument: {
    label: 'Canvas page document regions',
    description: 'Decide when document regions are shown on the canvas page',
    type: 'dropdown-field',
    options: annotationVisibilityOptions,
  },
};

export const ProjectConfigContributionsTabular: ProjectConfigTemplate = {
  ...sharedProjectContributionFields,
  modelPageOptions: {
    label: 'Contribution panel',
    description: 'View options for the tabular contribution panel',
    type: 'checkbox-list-field',
    allowMultiple: false,
    options: tabularContributionModelPageOptions,
  },
  tabularDefaultRowCount: {
    label: 'Default number of table rows',
    description: 'Number of empty rows to pre-fill for new tabular draft revisions.',
    type: 'text-field',
  },
  ...TABULAR_OVERLAY_COLOR_FIELDS,
  ...sharedProjectContributionTailFields,
};

export const ProjectConfigReview: ProjectConfigTemplate = {
  randomlyAssignReviewer: {
    label: 'When assigning a reviewer',
    type: 'checkbox-field',
    inlineLabel: 'Randomly assign a reviewer',
  },
  adminsAreReviewers: {
    label: 'When assigning a reviewer',
    type: 'checkbox-field',
    inlineLabel: 'Admins count as reviewers',
  },
  manuallyAssignedReviewer: {
    label: 'Custom reviewer (numeric id)',
    type: 'text-field',
  },
  revisionApprovalsRequired: {
    label: 'Submission approvals required',
    type: 'text-field',
  },
  reviewOptions: {
    label: 'Review options',
    description: 'Options for review listing and pages',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Allow merging submissions',
        value: 'allowMerging',
      },
      {
        label: 'Allow auto-review if assigned to automated user',
        value: 'enableAutoReview',
      },
    ],
  },
  hideCompletedResources: {
    label: 'Once a resource (canvas or manifest) is complete',
    type: 'checkbox-field',
    inlineLabel: 'Hide it from the resource page in the project',
  },
  allowSubmissionsWhenCanvasComplete: {
    label: 'After a canvas has been marked as complete',
    type: 'checkbox-field',
    inlineLabel: 'Allow further submissions',
  },
};

export const ProjectConfigOther: ProjectConfigTemplate = {
  activityStreams: {
    label: 'Activity streams',
    description: 'Below are the enabled activity streams. When you enable them, only new activity will be recorded.',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Completed manifests activity',
        value: 'manifest',
      },
      {
        label: 'Completed canvas activity (not yet implemented)',
        value: 'canvas',
      },
      {
        label: 'Curated activity feed',
        value: 'curated',
      },
      {
        label: 'Project published feed (not yet implemented)',
        value: 'published',
      },
    ],
  },
  metadataSuggestions: {
    label: 'Metadata suggestions',
    description: 'Allow users to suggest additions or corrections to metadata',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Collection metadata',
        value: 'collection',
      },
      {
        label: 'Manifest metadata',
        value: 'manifest',
      },
      {
        label: 'Canvas metadata',
        value: 'canvas',
      },
    ],
  },
};
