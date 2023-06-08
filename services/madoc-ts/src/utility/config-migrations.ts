import { ProjectConfiguration, ProjectConfigurationNEW } from '../types/schemas/project-configuration';

function version1to2(config: ProjectConfiguration): ProjectConfigurationNEW {
  return {
    _version: 2,
    _source: config._source,
    headerOptions: config.headerOptions,
    projectPageOptions: Object.assign({}, config.projectPageOptions || {}, {
      hideStatistics: config.hideStatistics,
      hideProjectCollectionNavigation: config.hideProjectCollectionNavigation,
      hideProjectManifestNavigation: config.hideProjectManifestNavigation,
    }),
    manifestPageOptions: Object.assign({}, config.manifestPageOptions || {}, {
      hideManifestMetadataOnCanvas: config.hideManifestMetadataOnCanvas,
      skipManifestListingPage: config.skipManifestListingPage,
    }),
    atlasBackground: config.atlasBackground,
    miradorCanvasPage: config.miradorCanvasPage,
    universalViewerCanvasPage: config.universalViewerCanvasPage,
    hideCanvasThumbnailNavigation: config.hideCanvasThumbnailNavigation,
    navigation: {
      allowCollectionNavigation: config.allowCollectionNavigation,
      allowManifestNavigation: config.allowManifestNavigation,
      allowCanvasNavigation: config.allowCanvasNavigation,
    },
    searchStrategy: config.searchStrategy,
    searchOptions: Object.assign({}, config.searchOptions || {}, {
      showSearchFacetCount: config.showSearchFacetCount,
    }),
    contributionMode: config.contributionMode,
    maxContributionsPerResource: config.maxContributionsPerResource,
    forkMode: config.forkMode,
    claimGranularity: config.claimGranularity,
    assigningCanvas: {
      randomlyAssignCanvas: config.randomlyAssignCanvas,
      priorityRandomness: config.priorityRandomness,
    },
    defaultEditorOrientation: config.defaultEditorOrientation,
    modelPageOptions: Object.assign({}, config.modelPageOptions || {}, {
      allowPersonalNotes: config.allowPersonalNotes,
    }),
    contributionWarningTime: config.contributionWarningTime,
    shortExpiryTime: config.shortExpiryTime,
    longExpiryTime: config.longExpiryTime,
    submissionOptions: {
      disablePreview: config.modelPageOptions?.disablePreview,
      disableNextCanvas: config.modelPageOptions?.disableNextCanvas,
      preventContributionAfterManifestUnassign: config.modelPageOptions?.preventContributionAfterManifestUnassign,
      preventContributionAfterRejection: config.modelPageOptions?.preventContributionAfterRejection,
      preventContributionAfterSubmission: config.modelPageOptions?.preventContributionAfterSubmission,
    },
    randomCanvas: config.randomCanvas,
    preventMultipleUserSubmissionsPerResource: config.modelPageOptions?.preventMultipleUserSubmissionsPerResource,
    modelPageShowAnnotations: config.modelPageShowAnnotations,
    modelPageShowDocument: config.modelPageShowDocument,
    canvasPageShowAnnotations: config.canvasPageShowAnnotations,
    canvasPageShowDocument: config.canvasPageShowDocument,
    randomlyAssignReviewer: config.randomlyAssignReviewer,
    adminsAreReviewers: config.adminsAreReviewers,
    manuallyAssignedReviewer: config.manuallyAssignedReviewer,
    revisionApprovalsRequired: config.revisionApprovalsRequired,
    reviewOptions: config.reviewOptions,
    hideCompletedResources: config.hideCompletedResources,
    allowSubmissionsWhenCanvasComplete: config.allowSubmissionsWhenCanvasComplete,
    skipAutomaticOCRImport: config.skipAutomaticOCRImport,
    metadataSuggestions: config.metadataSuggestions,
    activityStreams: config.activityStreams,
    shadow: config.shadow,
  };
}

function version2to1(config: ProjectConfigurationNEW): ProjectConfiguration {
  const { hideManifestMetadataOnCanvas, skipManifestListingPage, ...manifestPageOptions } =
    config.manifestPageOptions || {};
  const { showSearchFacetCount, ...searchOptions } = config.searchOptions || {};
  const { allowPersonalNotes, ...modelPageOptions } = config.modelPageOptions || {};
  const { hideStatistics, hideProjectCollectionNavigation, hideProjectManifestNavigation, ...projectPageOptions } =
    config.projectPageOptions || {};
  const { randomlyAssignCanvas, priorityRandomness } = config.assigningCanvas || {};
  const { allowCollectionNavigation, allowManifestNavigation, allowCanvasNavigation } = config.navigation || {};

  return {
    _version: 1,
    _source: config._source,
    allowCollectionNavigation: allowCollectionNavigation || false,
    allowManifestNavigation: allowManifestNavigation || false,
    allowCanvasNavigation: allowCanvasNavigation || false,
    claimGranularity: config.claimGranularity,
    maxContributionsPerResource: config.maxContributionsPerResource,
    revisionApprovalsRequired: config.revisionApprovalsRequired,
    allowSubmissionsWhenCanvasComplete: config.allowSubmissionsWhenCanvasComplete,
    randomlyAssignReviewer: config.randomlyAssignReviewer,
    manuallyAssignedReviewer: config.manuallyAssignedReviewer,
    adminsAreReviewers: config.adminsAreReviewers,
    hideCompletedResources: config.hideCompletedResources,
    contributionWarningTime: config.contributionWarningTime,
    randomlyAssignCanvas: randomlyAssignCanvas,
    priorityRandomness: priorityRandomness,
    randomCanvas: config.randomCanvas,
    skipAutomaticOCRImport: config.skipAutomaticOCRImport,
    allowPersonalNotes: allowPersonalNotes,
    defaultEditorOrientation: config.defaultEditorOrientation,
    skipManifestListingPage: skipManifestListingPage,
    hideStatistics: hideStatistics,
    hideProjectCollectionNavigation: hideProjectCollectionNavigation,
    hideProjectManifestNavigation: hideProjectManifestNavigation,
    searchStrategy: config.searchStrategy,
    hideManifestMetadataOnCanvas: hideManifestMetadataOnCanvas,
    hideCanvasThumbnailNavigation: config.hideCanvasThumbnailNavigation,
    showSearchFacetCount: showSearchFacetCount,
    miradorCanvasPage: config.miradorCanvasPage,
    universalViewerCanvasPage: config.universalViewerCanvasPage,
    contributionMode: config.contributionMode,
    atlasBackground: config.atlasBackground,
    forkMode: config.forkMode,
    searchOptions: searchOptions,
    shortExpiryTime: config.shortExpiryTime,
    longExpiryTime: config.longExpiryTime,
    modelPageShowAnnotations: config.modelPageShowAnnotations,
    modelPageShowDocument: config.modelPageShowDocument,
    canvasPageShowAnnotations: config.canvasPageShowAnnotations,
    canvasPageShowDocument: config.canvasPageShowDocument,
    modelPageOptions: modelPageOptions,
    projectPageOptions: projectPageOptions,
    reviewOptions: config.reviewOptions,
    manifestPageOptions: manifestPageOptions,
    headerOptions: config.headerOptions,
    activityStreams: config.activityStreams,
    metadataSuggestions: config.metadataSuggestions,
    shadow: config.shadow,
  };
}

export const migrateConfig = {
  version1to2,
  version2to1,
};
