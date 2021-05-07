import { BaseField } from '@capture-models/types';
import { ProjectConfiguration } from '../../../types/schemas/project-configuration';

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
  maxContributionsPerResource: {
    label: 'Max contributors per resource',
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
  contributionMode: {
    label: 'Contribution mode',
    description: 'This changes many aspects of how contributions work. (default = annotation)',
    type: 'dropdown-field',
    options: [
      { value: 'annotation', text: 'Annotation mode (default)' },
      { value: 'transcription', text: 'Transcription mode' },
    ],
  },
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
        label: 'Prevent submissions after expiry (existing canvases)',
        value: 'preventContributionAfterManifestUnassign',
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
        label: 'Hide image filtering',
        value: 'hideFilterImages',
      },
      {
        label: 'Navigate directly to model page from manifest',
        value: 'directModelPage',
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
    ],
  },
};
