export const siteConfigurationModel = {
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
};
