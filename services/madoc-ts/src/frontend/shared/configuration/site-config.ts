import { ProjectConfiguration, ProjectConfigurationNEW } from '../../../types/schemas/project-configuration';
import { BaseField } from '../capture-models/types/field-types';

export function postProcessConfiguration(config: Partial<ProjectConfiguration>): ProjectConfiguration {
  if (config.revisionApprovalsRequired) {
    config.revisionApprovalsRequired = Number(config.revisionApprovalsRequired);
  }

  if ((config.maxContributionsPerResource as any) === '') {
    config.maxContributionsPerResource = false;
  }

  return config as any;
}

export const siteConfigurationModel: {
  [key in keyof ProjectConfiguration]: string | (Partial<BaseField> & any);
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

export const NonProjectOptions: {
  [key in keyof Partial<ProjectConfigurationNEW>]: string | (Partial<BaseField> & any);
} = {
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

export const ProjectConfigInterface: {
  [key in keyof Partial<ProjectConfigurationNEW>]: string | (Partial<BaseField> & any);
} = {
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

export const ProjectConfigSearch: {
  [key in keyof Partial<ProjectConfigurationNEW>]: string | (Partial<BaseField> & any);
} = {
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

export const ProjectConfigContributions: {
  [key in keyof Partial<ProjectConfigurationNEW>]: string | (Partial<BaseField> & any);
} = {
  contributionMode: {
    label: 'Contribution mode',
    description: 'This changes many aspects of how contributions work. (default = annotation)',
    type: 'dropdown-field',
    options: [
      { value: 'annotation', text: 'Annotation mode (default)' },
      { value: 'transcription', text: 'Transcription mode' },
    ],
  },
  maxContributionsPerResource: {
    label: 'Contributors per resource',
    type: 'text-field',
  },
  preventMultipleUserSubmissionsPerResource: {
    label: 'Only one submission per user, per resource',
    type: 'checkbox-field',
  },
  showRandomManifestAfterSubmission: {
    label: 'Show random manifest button after last canvas submission',
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
    options: [
      { value: 'canvas', text: 'Canvas' },
      // Disabled option.
      { value: 'manifest', text: 'Manifest' },
    ],
  },
  assigningCanvas: {
    label: 'Assigning a canvas',
    description: '',
    type: 'checkbox-list-field',
    options: [
      {
        label: 'Prioritise canvases sequentially',
        value: 'priorityRandomness',
      },
      {
        label: 'Randomly assign canvas to a user',
        value: 'randomlyAssignCanvas',
      },
    ],
  },
  randomCanvas: {
    label: 'Randomly select canvas when randomly selecting resource',
    type: 'checkbox-field',
    inlineLabel: 'Randomly select canvas',
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
    options: [
      {
        label: 'Hide viewer controls (zoom + home)',
        value: 'hideViewerControls',
      },
      {
        label: 'Enable rotation of images',
        value: 'enableRotation',
      },
      {
        label: 'Fixed transcription bar',
        value: 'fixedTranscriptionBar',
      },
      {
        label: 'Disable save for later button',
        value: 'disableSaveForLater',
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
        label: 'Allow personal notes',
        description: 'allow users to take personal notes only visible to themselves on canvases in a project',
        value: 'allowPersonalNotes',
      },
      {
        label: 'Enable split view',
        value: 'enableSplitView',
      },
    ],
  },
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
    options: [
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
};

export const ProjectConfigReview: {
  [key in keyof Partial<ProjectConfigurationNEW>]: string | (Partial<BaseField> & any);
} = {
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

export const ProjectConfigOther: {
  [key in keyof Partial<ProjectConfigurationNEW>]: string | (Partial<BaseField> & any);
} = {
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
