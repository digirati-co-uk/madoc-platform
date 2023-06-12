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
    ...unchangedConfig
  } = config;

  return {
    _version: 1,
    _source: config._source,
    ...unchangedConfig,
    allowCollectionNavigation: allowCollectionNavigation || false,
    allowManifestNavigation: allowManifestNavigation || false,
    allowCanvasNavigation: allowCanvasNavigation || false,
    randomlyAssignCanvas: randomlyAssignCanvas,
    priorityRandomness: priorityRandomness,
    allowPersonalNotes: allowPersonalNotes,
    skipManifestListingPage: skipManifestListingPage,
    hideStatistics: hideStatistics,
    hideProjectCollectionNavigation: hideProjectCollectionNavigation,
    hideProjectManifestNavigation: hideProjectManifestNavigation,
    hideManifestMetadataOnCanvas: hideManifestMetadataOnCanvas,
    showSearchFacetCount: showSearchFacetCount,
    searchOptions: searchOptions,
    modelPageOptions: {
      ...modelPageOptions,
      preventMultipleUserSubmissionsPerResource,
      disablePreview,
      disableNextCanvas,
      preventContributionAfterSubmission,
      preventContributionAfterRejection,
      preventContributionAfterManifestUnassign,
    },
    projectPageOptions: projectPageOptions,
    manifestPageOptions: manifestPageOptions,
  };
}

export const migrateConfig = {
  version1to2,
  version2to1,
};
