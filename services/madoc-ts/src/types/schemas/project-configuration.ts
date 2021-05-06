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
  skipAutomaticOCRImport?: boolean;
  defaultEditorOrientation: 'vertical' | 'horizontal';
  skipManifestListingPage?: boolean;
  hideStatistics?: boolean;
  hideProjectCollectionNavigation?: boolean;
  hideProjectManifestNavigation?: boolean;
  searchStrategy?: 'string';
  hideManifestMetadataOnCanvas?: boolean;
  hideCanvasThumbnailNavigation?: boolean;
  showSearchFacetCount?: boolean;
  miradorCanvasPage?: boolean;
  contributionMode?: 'transcription' | 'annotation';
  modelPageOptions?: {
    fixedTranscriptionBar?: boolean;
    preventContributionAfterRejection?: boolean;
    preventContributionAfterSubmission?: boolean;
    preventMultipleUserSubmissionsPerResource?: boolean;
    preventContributionAfterManifestUnassign?: boolean;
  };
  projectPageOptions?: {
    hideStartContributing?: boolean;
    hideSearchButton?: boolean;
    hideRandomManifest?: boolean;
    hideRandomCanvas?: boolean;
  };
  manifestPageOptions?: {
    hideStartContributing?: boolean;
    hideOpenInMirador?: boolean;
    hideSearchButton?: boolean;
    hideRandomCanvas?: boolean;
    hideFilterImages?: boolean;
    directModelPage?: boolean;
  };
  headerOptions?: {
    hideSiteTitle?: boolean;
    hideProjectsLink?: boolean;
    hideCollectionsLink?: boolean;
    hideDashboardLink?: boolean;
    hidePageNavLinks?: boolean;
    hideSearchBar?: boolean;
  }
};
