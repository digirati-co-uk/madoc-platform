import { ProjectConfiguration, ProjectConfigurationNEW } from '../types/schemas/project-configuration';

function version1to2(config: ProjectConfiguration): ProjectConfigurationNEW {
  const {
    _version, // ignored
    projectPageOptions,
    hideProjectCollectionNavigation,
    hideProjectManifestNavigation,
    hideStatistics,
    manifestPageOptions,
    hideManifestMetadataOnCanvas,
    skipManifestListingPage,
    allowCollectionNavigation,
    allowManifestNavigation,
    allowCanvasNavigation,
    searchOptions,
    showSearchFacetCount,
    randomlyAssignCanvas,
    priorityRandomness,
    modelPageOptions,
    allowPersonalNotes,
    miradorCanvasPage,
    universalViewerCanvasPage,
    hideCanvasThumbnailNavigation,
    ...unchangedConfig
  } = config;

  return {
    _version: 2,
    _source: config._source,
    ...unchangedConfig,
    projectPageOptions: Object.assign({}, projectPageOptions || {}, {
      hideStatistics: hideStatistics,
      hideProjectCollectionNavigation: hideProjectCollectionNavigation,
      hideProjectManifestNavigation: hideProjectManifestNavigation,
    }),
    manifestPageOptions: Object.assign({}, manifestPageOptions || {}, {
      hideManifestMetadataOnCanvas: hideManifestMetadataOnCanvas,
      skipManifestListingPage: skipManifestListingPage,
    }),
    canvasPageOptions: {
      miradorCanvasPage: miradorCanvasPage,
      universalViewerCanvasPage: universalViewerCanvasPage,
      hideCanvasThumbnailNavigation: hideCanvasThumbnailNavigation,
    },
    navigation: {
      allowCollectionNavigation: allowCollectionNavigation,
      allowManifestNavigation: allowManifestNavigation,
      allowCanvasNavigation: allowCanvasNavigation,
    },
    searchOptions: Object.assign({}, searchOptions || {}, {
      showSearchFacetCount: showSearchFacetCount,
    }),
    assigningCanvas: {
      randomlyAssignCanvas: randomlyAssignCanvas,
      priorityRandomness: priorityRandomness,
    },
    modelPageOptions: Object.assign({}, modelPageOptions || {}, {
      allowPersonalNotes: allowPersonalNotes,
    }),
    submissionOptions: {
      disablePreview: modelPageOptions?.disablePreview,
      disableNextCanvas: modelPageOptions?.disableNextCanvas,
      preventContributionAfterManifestUnassign: modelPageOptions?.preventContributionAfterManifestUnassign,
      preventContributionAfterRejection: modelPageOptions?.preventContributionAfterRejection,
      preventContributionAfterSubmission: modelPageOptions?.preventContributionAfterSubmission,
    },
    preventMultipleUserSubmissionsPerResource: modelPageOptions?.preventMultipleUserSubmissionsPerResource,
  };
}

function version2to1(config: ProjectConfigurationNEW): ProjectConfiguration {
  const {
    _version, // ignored
    manifestPageOptions: { hideManifestMetadataOnCanvas, skipManifestListingPage, ...manifestPageOptions } = {},
    searchOptions: { showSearchFacetCount, ...searchOptions } = {},
    assigningCanvas: { randomlyAssignCanvas, priorityRandomness } = {},
    modelPageOptions: { allowPersonalNotes, ...modelPageOptions } = {},
    projectPageOptions: {
      hideStatistics,
      hideProjectCollectionNavigation,
      hideProjectManifestNavigation,
      ...projectPageOptions
    } = {},
    navigation: { allowCollectionNavigation, allowManifestNavigation, allowCanvasNavigation } = {},
    preventMultipleUserSubmissionsPerResource,
    submissionOptions: {
      disablePreview,
      disableNextCanvas,
      preventContributionAfterManifestUnassign,
      preventContributionAfterRejection,
      preventContributionAfterSubmission,
    } = {},
    canvasPageOptions: { miradorCanvasPage, universalViewerCanvasPage, hideCanvasThumbnailNavigation } = {},
    ...unchangedConfig
  } = config;

  return {
    _version: 1,
    _source: config._source,
    ...unchangedConfig,
    allowCollectionNavigation: allowCollectionNavigation || false,
    allowManifestNavigation: allowManifestNavigation || false,
    allowCanvasNavigation: allowCanvasNavigation || false,
    randomlyAssignCanvas,
    priorityRandomness,
    allowPersonalNotes,
    skipManifestListingPage,
    hideStatistics,
    hideProjectCollectionNavigation,
    hideProjectManifestNavigation,
    hideManifestMetadataOnCanvas,
    showSearchFacetCount,
    searchOptions,
    modelPageOptions: {
      ...modelPageOptions,
      preventMultipleUserSubmissionsPerResource,
      disablePreview,
      disableNextCanvas,
      preventContributionAfterSubmission,
      preventContributionAfterRejection,
      preventContributionAfterManifestUnassign,
    },
    projectPageOptions,
    manifestPageOptions,
    miradorCanvasPage,
    universalViewerCanvasPage,
    hideCanvasThumbnailNavigation,
  };
}

export const migrateConfig = {
  version1to2,
  version2to1,
};
