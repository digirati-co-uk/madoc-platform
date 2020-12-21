export const siteConfigurationModel = {
  allowCollectionNavigation: {
    label: 'Collection navigation',
    description:
      'Allow users to navigate through the collections. If this option is enabled then users will have to be assigned canvases or manifests to see them, or optionally pick up a random resource.',
    type: 'checkbox-field',
    inlineLabel: 'Allow collection navigation',
  },
  allowManifestNavigation: {
    label: 'Manifest navigation',
    description:
      'Allow users to navigate through a manifest of images. If this option is enabled then users will have to be assigned canvases or the whole manifest to navigate them.',
    type: 'checkbox-field',
    inlineLabel: 'Allow manifest navigation',
  },
  allowCanvasNavigation: 'checkbox-field',
  randomlyAssignCanvas: 'checkbox-field',
  priorityRandomness: 'checkbox-field',
  claimGranularity: {
    label: 'Claim granularity',
    description: 'When a user claims something to work on, should they receive a single image or the whole manifest',
    type: 'dropdown-field',
    options: [
      { value: 'canvas', text: 'Canvas' },
      { value: 'manifest', text: 'Manifest' },
    ],
  },
  maxContributionsPerResource: 'text-field',
  allowSubmissionsWhenCanvasComplete: 'checkbox-field',
  randomlyAssignReviewer: 'checkbox-field',
  manuallyAssignedReviewer: 'text-field',
  adminsAreReviewers: 'checkbox-field',
  hideCompletedResources: 'checkbox-field',
  revisionApprovalsRequired: 'text-field',
  contributionWarningTime: 'text-field',
};
