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
  allowPersonalNotes?: boolean;
  defaultEditorOrientation: 'vertical' | 'horizontal';
  skipManifestListingPage?: boolean; // @todo move to manifest page options
  hideStatistics?: boolean; // @todo move to project page options
  hideProjectCollectionNavigation?: boolean; // @todo move to project page options
  hideProjectManifestNavigation?: boolean; // @todo move to project page options
  searchStrategy?: 'string';
  hideManifestMetadataOnCanvas?: boolean;
  hideCanvasThumbnailNavigation?: boolean;
  showSearchFacetCount?: boolean; // @todo move to searchOptions
  miradorCanvasPage?: boolean;
  contributionMode?: 'transcription' | 'annotation';
  // New search options - need to migrate others to this.
  searchOptions?: {
    nonLatinFulltext?: boolean;
    searchMultipleFields?: boolean;
    onlyShowManifests?: boolean;
  };
  shortExpiryTime?: string;
  longExpiryTime?: string;
  modelPageOptions?: {
    fixedTranscriptionBar?: boolean;
    preventContributionAfterRejection?: boolean;
    preventContributionAfterSubmission?: boolean;
    preventMultipleUserSubmissionsPerResource?: boolean;
    preventContributionAfterManifestUnassign?: boolean;
    hideViewerControls?: boolean;
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
    showIIIFLogo?: boolean;
  };
  headerOptions?: {
    hideSiteTitle?: boolean;
    hideProjectsLink?: boolean;
    hideCollectionsLink?: boolean;
    hideDashboardLink?: boolean;
    hidePageNavLinks?: boolean;
    hideSearchBar?: boolean;
  };
  activityStreams?: {
    manifest?: boolean;
    canvas?: boolean;
    curated?: boolean;
    published?: boolean;
  };
  metadataSuggestions?: {
    manifest?: boolean;
    collection?: boolean;
    canvas?: boolean;
  };
};
