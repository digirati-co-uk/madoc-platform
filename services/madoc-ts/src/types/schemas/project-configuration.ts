export type ProjectConfiguration = {
  allowCollectionNavigation: boolean;
  allowManifestNavigation: boolean;
  allowCanvasNavigation: boolean;
  claimGranularity: 'canvas' | 'manifest';
  maxContributionsPerResource: false | number;
  revisionApprovalsRequired: number;
  allowSubmissionsWhenCanvasComplete: boolean;
  randomlyAssignReviewer: boolean;
  manuallyAssignedReviewer?: number | null;
  adminsAreReviewers: boolean;
  hideCompletedResources: boolean;
  contributionWarningTime: false | number;
  randomlyAssignCanvas?: boolean;
  priorityRandomness?: boolean;
};
