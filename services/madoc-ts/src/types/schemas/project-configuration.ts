export type ProjectConfiguration = {
  _source?: {
    siteConfig: Array<{ property: string; original: any; override: any }>;
    staticConfig: Array<{ property: string; original: any; override: any }>;
  };
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
  randomCanvas?: boolean;
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

export type ProjectConfigurationNEW = {
  _source?: {
    siteConfig: Array<{ property: string; original: any; override: any }>;
    staticConfig: Array<{ property: string; original: any; override: any }>;
  };
  globalSiteNavigation?: {
    hideSiteTitle?: boolean;
    hideProjectsLink?: boolean;
    hideCollectionsLink?: boolean;
    hideDashboardLink?: boolean;
    hidePageNavLinks?: boolean;
    hideSearchBar?: boolean;
  };
  projectPageOptions?: {
    hideStatistics?: boolean;
    hideProjectCollectionNavigation?: boolean;
    hideProjectManifestNavigation?: boolean;
    hideStartContributing?: boolean;
    hideSearchButton?: boolean;
    hideRandomManifest?: boolean;
    hideRandomCanvas?: boolean;
    reviewerDashboard?: boolean;
  };
  collectionPageOptions?: {
    hideSearchButton?: false;
    hideRandomManifest?: false;
    hideRandomCanvas?: false;
  };
  manifestPageOptions?: {
    hideManifestMetadataOnCanvas?: boolean;
    hideStartContributing?: boolean;
    hideOpenInMirador?: boolean;
    hideSearchButton?: boolean;
    hideRandomCanvas?: boolean;
    hideFilterImages?: boolean;
    directModelPage?: boolean;
    showIIIFLogo?: boolean;
    generatePDF?: boolean;
    coveredImages?: boolean;
    rectangularImages?: boolean;
    hideCanvasLabels?: boolean;
    skipManifestListingPage?: boolean;
  };

  atlasBackground?: string;
  miradorCanvasPage?: boolean;
  universalViewerCanvasPage?: boolean;
  hideCanvasThumbnailNavigation?: boolean;

  navigation?: {
    allowCollectionNavigation: boolean;
    allowManifestNavigation: boolean;
    allowCanvasNavigation: boolean;
  };

  searchStrategy?: 'string';
  searchOptions?: {
    nonLatinFulltext?: boolean;
    searchMultipleFields?: boolean;
    onlyShowManifests?: boolean;
    showSearchFacetCount?: boolean;
  };

  contributionMode?: 'transcription' | 'annotation';
  maxContributionsPerResource: false | number;
  preventMultipleUserSubmissionsPerResource?: boolean;
  forkMode?: boolean;
  claimGranularity: 'canvas' | 'manifest';
  assigningCanvas?: {
    randomlyAssignCanvas?: boolean;
    priorityRandomness?: boolean;
  };
  randomCanvas?: boolean;
  defaultEditorOrientation: 'vertical' | 'horizontal';
  contributionPanelOptions?: {
    hideViewerControls?: boolean;
    enableRotation?: boolean;
    fixedTranscriptionBar?: boolean;
    disableSaveForLater?: boolean;
    allowPersonalNotes?: boolean;
  };
  contributionWarningTime: false | number;
  shortExpiryTime?: string;
  longExpiryTime?: string;

  submissionOptions?: {
    disablePreview?: boolean;
    disableNextCanvas?: boolean;
    preventContributionAfterManifestUnassign?: boolean;
    preventContributionAfterRejection?: boolean;
    preventContributionAfterSubmission?: boolean;
  };

  modelPageShowAnnotations?: 'always' | 'when-open' | 'highlighted';
  modelPageShowDocument?: 'always' | 'when-open' | 'highlighted';
  canvasPageShowAnnotations?: 'always' | 'when-open' | 'highlighted';
  canvasPageShowDocument?: 'always' | 'when-open' | 'highlighted';

  randomlyAssignReviewer: boolean;
  adminsAreReviewers: boolean;
  manuallyAssignedReviewer?: number | null;
  revisionApprovalsRequired: number;
  reviewOptions?: {
    allowMerging?: boolean;
    enableAutoReview?: boolean;
  };
  hideCompletedResources: boolean;
  allowSubmissionsWhenCanvasComplete: boolean;

  //other
  skipAutomaticOCRImport?: boolean;
  metadataSuggestions?: {
    manifest?: boolean;
    collection?: boolean;
    canvas?: boolean;
  };
  activityStreams?: {
    manifest?: boolean;
    canvas?: boolean;
    curated?: boolean;
    published?: boolean;
  };

  // Configuration that's not available from the editor.
  shadow?: {
    showCaptureModelOnManifest?: boolean;
  };
};
