export type ProjectConfiguration = {
  allowCollectionNavigation: boolean;
  allowManifestNavigation: boolean;
  allowCanvasNavigation: boolean;
  claimGranularity: 'canvas' | 'manifest';
  maxContributionsPerResource: false | number;
  randomlyAssignReviewer: boolean;
  manuallyAssignedReviewer?: number;
  adminsAreReviewers: boolean;
};
