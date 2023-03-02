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
  universalViewerCanvasPage?: boolean;
  contributionMode?: 'transcription' | 'annotation';
  atlasBackground?: string;
  forkMode?: boolean;
  // New search options - need to migrate others to this.
  searchOptions?: {
    nonLatinFulltext?: boolean;
    searchMultipleFields?: boolean;
    onlyShowManifests?: boolean;
  };
  shortExpiryTime?: string;
  longExpiryTime?: string;

  modelPageShowAnnotations?: 'always' | 'when-open' | 'highlighted';
  modelPageShowDocument?: 'always' | 'when-open' | 'highlighted';
  canvasPageShowAnnotations?: 'always' | 'when-open' | 'highlighted';
  canvasPageShowDocument?: 'always' | 'when-open' | 'highlighted';

  modelPageOptions?: {
    fixedTranscriptionBar?: boolean;
    preventContributionAfterRejection?: boolean;
    preventContributionAfterSubmission?: boolean;
    preventMultipleUserSubmissionsPerResource?: boolean;
    preventContributionAfterManifestUnassign?: boolean;
    hideViewerControls?: boolean;
    disableSaveForLater?: boolean;
    disablePreview?: boolean;
    disableNextCanvas?: boolean;
    enableRotation?: boolean;
  };
  projectPageOptions?: {
    hideStartContributing?: boolean;
    hideSearchButton?: boolean;
    hideRandomManifest?: boolean;
    hideRandomCanvas?: boolean;
    reviewerDashboard?: boolean;
  };
  reviewOptions?: {
    allowMerging?: boolean;
    enableAutoReview?: boolean;
  };
  manifestPageOptions?: {
    hideStartContributing?: boolean;
    hideOpenInMirador?: boolean;
    hideSearchButton?: boolean;
    hideRandomCanvas?: boolean;
    generatePDF?: boolean;
    hideFilterImages?: boolean;
    directModelPage?: boolean;
    showIIIFLogo?: boolean;
    coveredImages?: boolean;
    rectangularImages?: boolean;
    hideCanvasLabels?: boolean;
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

  // Configuration that's not available from the editor.
  shadow?: {
    showCaptureModelOnManifest?: boolean;
  };
};
