import { createDelegatedRequest, delegatedRequest } from './routes/admin/deletegated-request';
import { acceptNewDevelopmentBundle, developmentPlugin } from './routes/admin/development-plugin';
import { exportSite } from './routes/admin/export-site';
import { getMetadataKeys } from './routes/admin/get-metadata-keys';
import { getMetadataValues } from './routes/admin/get-metadata-values';
import { getModelConfiguration } from './routes/admin/get-model-configuration';
import { importSite } from './routes/admin/import-site';
import { listJobs, runJob } from './routes/admin/list-jobs';
import { getLocalisation, listLocalisations, updateLocalisation } from './routes/admin/localisation';
import { getMetadataConfiguration, updateMetadataConfiguration } from './routes/admin/metadata-configuration';
import {
  disablePlugin,
  enablePlugin,
  getPlugin,
  getPluginDependencies,
  installPlugin,
  installRemotePlugin,
  listPlugins,
  uninstallPlugin,
  viewRemotePlugin,
} from './routes/admin/plugins';
import { pm2Status } from './routes/admin/pm2';
import { getSiteDetails } from './routes/admin/site-details';
import {
  disableTheme,
  enableTheme,
  installTheme,
  listThemes,
  serveThemeAsset,
  uninstallTheme,
} from './routes/admin/themes';
import { updateModelConfiguration } from './routes/admin/update-model-configuration';
import { updateSiteConfiguration } from './routes/admin/update-site-configuration';
import { createBlock } from './routes/content/create-block';
import { createPage } from './routes/content/create-page';
import { createSlot } from './routes/content/create-slot';
import { deleteBlock } from './routes/content/delete-block';
import { deletePage } from './routes/content/delete-page';
import { deleteSlot } from './routes/content/delete-slot';
import { getBlock } from './routes/content/get-block';
import { getPage } from './routes/content/get-page';
import { linkAutocomplete } from './routes/content/link-autocomplete';
import { resolveSlots } from './routes/content/resolve-slots';
import { getCanvasReference } from './routes/iiif/canvases/get-canvas-reference';
import { siteManifestBuild } from './routes/site/site-manifest-build';
import { createMedia } from './routes/media/create-media';
import { deleteMedia } from './routes/media/delete-media';
import { generateThumbnails } from './routes/media/generate-thumbnails';
import { getMedia } from './routes/media/get-media';
import { listMedia } from './routes/media/list-media';
import { deleteResourceClaim } from './routes/projects/delete-resource-claim';
import { getProjectNote } from './routes/projects/get-project-note';
import { updateCuratedFeed } from './routes/projects/update-curated-feed';
import { updateProjectNote } from './routes/projects/update-project-note';
import { fullReindex } from './routes/search/full-reindex';
import { siteCanvasSource } from './routes/site/site-canvas-reference';
import { siteModelConfiguration } from './routes/site/site-model-configuration';
import { sitePageNavigation } from './routes/site/site-page-navigation';
import { getSlot } from './routes/content/get-slot';
import { getAllPages } from './routes/content/list-pages';
import { updateBlock } from './routes/content/update-block';
import { updatePage } from './routes/content/update-page';
import { updateSlot } from './routes/content/update-slot';
import { updateSlotStructure } from './routes/content/update-slot-structure';
import { getCanvasPlaintext } from './routes/iiif/canvases/get-canvas-plaintext';
import { publishCollection } from './routes/iiif/collections/publish-collection';
import { publishManifest } from './routes/iiif/manifests/publish-manifest';
import { batchIndex } from './routes/search/batch-index';
import { getFacetConfiguration, updateFacetConfiguration } from './routes/search/facet-configuration';
import { siteConfiguration } from './routes/site/site-configuration';
import { convertLinking } from './routes/iiif/linking/convert-linking';
import { getParentLinking } from './routes/iiif/linking/get-parent-linking';
import { indexManifest } from './routes/search/index-manifest';
import { updateProjectStatus } from './routes/projects/update-project-status';
import { siteManifestTasks } from './routes/site/site-manifest-tasks';
import { getStaticPage, sitePages } from './routes/site/site-pages';
import { siteTaskMetadata } from './routes/site/site-task-metadata';
import { getUser } from './routes/user/get-user';
import {
  clearAllNotifications,
  clearNotification,
  createNotification, getNotificationCount,
  getNotifications,
  readAllNotifications,
  readNotification
} from "./routes/user/notifications";
import { userAutocomplete } from './routes/user/user-autocomplete';
import { TypedRouter } from './utility/typed-router';
import { ping } from './routes/ping';
import { madocNotFound } from './routes/madoc-not-found';
import { importCollection, importManifest, importManifestOcr } from './routes/iiif-import/import';
import { loginPage } from './routes/user/login';
import { getSiteScopes, saveSiteScopes } from './routes/admin/site-scopes';
import { logout } from './routes/user/logout';
import { frontendBundles, pluginBundles } from './routes/assets/frontend-bundles';
import { adminFrontend, siteFrontend } from './routes/admin/frontend';
import { createCollection } from './routes/iiif/collections/create-collection';
import { deleteCollection } from './routes/iiif/collections/delete-collection';
import { getCollection } from './routes/iiif/collections/get-collection';
import { getCollectionStructure } from './routes/iiif/collections/get-collection-structure';
import { getCollectionMetadata } from './routes/iiif/collections/get-collection-metadata';
import { listCollections } from './routes/iiif/collections/list-collections';
import { updateCollectionStructure } from './routes/iiif/collections/update-collection-structure';
import { listManifests } from './routes/iiif/manifests/list-manifests';
import { createManifest } from './routes/iiif/manifests/create-manifest';
import { getManifest } from './routes/iiif/manifests/get-manifest';
import { deleteManifest } from './routes/iiif/manifests/delete-manifest';
import { getManifestMetadata } from './routes/iiif/manifests/get-manifest-metadata';
import { listCanvases } from './routes/iiif/canvases/list-canvases';
import { createCanvas } from './routes/iiif/canvases/create-canvas';
import { getCanvas } from './routes/iiif/canvases/get-canvas';
import { getCanvasMetadata } from './routes/iiif/canvases/get-canvas-metadata';
import { indexCanvas } from './routes/search/index-canvas';
import { updateManifestStructure } from './routes/iiif/manifests/update-manifest-structure';
import { getManifestStructure } from './routes/iiif/manifests/get-manifest-structure';
import { getLocale, saveMissingLocale } from './routes/locales';
import { updateMetadata } from './routes/iiif/update-metadata';
import { getManifestAutocomplete } from './routes/iiif/manifests/get-manifest-autocomplete';
import { getCollectionAutocomplete } from './routes/iiif/collections/get-collection-autocomplete';
import { refreshToken } from './routes/user/refresh';
import { createNewProject } from './routes/projects/create-new-project';
import { listProjects } from './routes/projects/list-projects';
import { getProject } from './routes/projects/get-project';
import { getProjectMetadata } from './routes/projects/get-project-metadata';
import { updateProjectMetadata } from './routes/projects/update-project-metadata';
import { getProjectStructure } from './routes/projects/get-project-structure';
import { getCollectionProjects } from './routes/iiif/collections/get-collection-projects';
import { getManifestProjects } from './routes/iiif/manifests/get-manifest-projects';
import { siteCollections } from './routes/site/site-collections';
import { siteCollection } from './routes/site/site-collection';
import { siteCanvas } from './routes/site/site-canvas';
import { siteManifest } from './routes/site/site-manifest';
import { siteManifests } from './routes/site/site-manifests';
import { siteProject } from './routes/site/site-project';
import { siteProjects } from './routes/site/site-projects';
import { siteSearch } from './routes/site/site-search';
import { siteTopic } from './routes/site/site-topic';
import { siteTopicType } from './routes/site/site-topic-type';
import { siteTopicTypes } from './routes/site/site-topic-types';
import { createResourceClaim, prepareResourceClaim } from './routes/projects/create-resource-claim';
import { statistics } from './routes/iiif/statistics';
import { getCanvasManifests } from './routes/iiif/canvases/get-canvas-manifests';
import { getManifestCollections } from './routes/iiif/manifests/get-manifest-collections';
import { getFlatCollectionStatistics } from './routes/iiif/collections/get-flat-collection-statistics';
import { updateResourceClaim } from './routes/projects/update-resource-claim';
import { getSiteManifestStructure } from './routes/site/site-manifest-structure';
import { userDetails } from './routes/user/details';
import { sitePublishedModels } from './routes/site/site-published-models';
import { personalAccessToken } from './routes/user/personal-access-token';
import { addLinking } from './routes/iiif/linking/add-linking';
import { deleteLinking } from './routes/iiif/linking/delete-linking';
import { updateLinking } from './routes/iiif/linking/update-linking';
import { getLinking } from './routes/iiif/linking/get-linking';
import { searchManifest } from './routes/iiif/manifests/search-manifest';
import { assignReview } from './routes/projects/assign-review';
import { getProjectModel } from './routes/projects/get-project-model';
import { siteCanvasModels } from './routes/site/site-canvas-models';
import { siteCanvasTasks } from './routes/site/site-canvas-tasks';
import { getProjectTask } from './routes/projects/get-project-task';
import { assignRandomResource } from './routes/projects/assign-random-resource';
import { router as activityStreamRoutes } from './activity-streams/router';

export const router = new TypedRouter({
  // Normal route
  'get-ping': [TypedRouter.GET, '/api/madoc', ping],
  'get-scopes': [TypedRouter.GET, '/api/madoc/site/:siteId/permissions', getSiteScopes],
  'update-scopes': [TypedRouter.POST, '/api/madoc/site/:siteId/permissions', saveSiteScopes],
  'pm2-list': [TypedRouter.GET, '/api/madoc/pm2/list', pm2Status],
  'export-site': [TypedRouter.POST, '/api/madoc/site/:siteId/export', exportSite],
  'import-site': [TypedRouter.POST, '/api/madoc/site/:siteId/import', importSite],
  'cron-jobs': [TypedRouter.GET, '/api/madoc/cron/jobs', listJobs],
  'run-cron-jobs': [TypedRouter.POST, '/api/madoc/cron/jobs/:jobId/run', runJob],

  // Plugins
  'list-plugins': [TypedRouter.GET, '/api/madoc/system/plugins', listPlugins],
  'get-plugin': [TypedRouter.GET, '/api/madoc/system/plugins/:id', getPlugin],
  'install-plugin': [TypedRouter.POST, '/api/madoc/system/plugins', installPlugin, 'SitePlugin'],
  'view-remote-plugin': [TypedRouter.GET, '/api/madoc/system/plugins/external/:author/:repo', viewRemotePlugin],
  'install-remote-plugin': [TypedRouter.POST, '/api/madoc/system/plugins/external/install', installRemotePlugin],
  'enable-plugin': [TypedRouter.POST, '/api/madoc/system/plugins/:id/enable', enablePlugin],
  'disable-plugin': [TypedRouter.POST, '/api/madoc/system/plugins/:id/disable', disablePlugin],
  'uninstall-plugin': [TypedRouter.POST, '/api/madoc/system/plugins/:id/uninstall', uninstallPlugin],
  'plugin-dependencies': [TypedRouter.GET, '/api/madoc/system/plugins/:id/dependencies', getPluginDependencies],

  // Delegated tasks
  'run-delegated-task': [TypedRouter.POST, '/api/madoc/delegated/:id', delegatedRequest],
  'create-delegated-task': [TypedRouter.POST, '/api/madoc/delegated', createDelegatedRequest],

  'update-site-configuration': [TypedRouter.POST, '/api/madoc/configuration', updateSiteConfiguration],
  'get-model-configuration': [TypedRouter.GET, '/api/madoc/configuration/model', getModelConfiguration],
  'update-model-configuration': [TypedRouter.POST, '/api/madoc/configuration/model', updateModelConfiguration],
  'update-search-facet-configuration': [
    TypedRouter.POST,
    '/api/madoc/configuration/search-facets',
    updateFacetConfiguration,
  ],
  'update-metadata-configuration': [TypedRouter.POST, '/api/madoc/configuration/metadata', updateMetadataConfiguration],
  'site-details': [TypedRouter.GET, '/api/madoc/site/:siteId/details', getSiteDetails],

  // User API.
  'get-user': [TypedRouter.GET, '/api/madoc/users/:id', getUser],
  'get-user-autocomplete': [TypedRouter.GET, '/api/madoc/users', userAutocomplete],

  // Notifications.
  'get-all-notifications': [TypedRouter.GET, '/api/madoc/notifications', getNotifications],
  'get-notification-count': [TypedRouter.GET, '/api/madoc/notifications/count', getNotificationCount],
  'read-notification': [TypedRouter.POST, '/api/madoc/notifications/:id/read', readNotification],
  'read-all-notifications': [TypedRouter.POST, '/api/madoc/notifications/read-all', readAllNotifications],
  'clear-notification': [TypedRouter.DELETE, '/api/madoc/notifications/:id', clearNotification],
  'clear-all-notifications': [TypedRouter.POST, '/api/madoc/notifications/clear-all', clearAllNotifications],
  'create-notification': [TypedRouter.POST, '/api/madoc/notifications', createNotification],

  // Localisation
  'i18n-list-locales': [TypedRouter.GET, '/api/madoc/locales', listLocalisations],
  'i18n-get-locale': [TypedRouter.GET, '/api/madoc/locales/:code', getLocalisation],
  'i18n-update-locale': [TypedRouter.POST, '/api/madoc/locales/:code', updateLocalisation],

  // Collection API.
  'list-collections': [TypedRouter.GET, '/api/madoc/iiif/collections', listCollections],
  'get-collection': [TypedRouter.GET, '/api/madoc/iiif/collections/:id', getCollection],
  'create-collection': [TypedRouter.POST, '/api/madoc/iiif/collections', createCollection, 'CreateCollection'],
  'delete-collection': [TypedRouter.DELETE, '/api/madoc/iiif/collections/:id', deleteCollection],
  'publish-collection': [TypedRouter.POST, '/api/madoc/iiif/collections/:id/publish', publishCollection],
  'get-collection-metadata': [TypedRouter.GET, '/api/madoc/iiif/collections/:id/metadata', getCollectionMetadata],
  'get-collection-structure': [TypedRouter.GET, '/api/madoc/iiif/collections/:id/structure', getCollectionStructure],
  'get-collection-projects': [TypedRouter.GET, '/api/madoc/iiif/collections/:id/projects', getCollectionProjects],
  'put-collection-metadata': [
    TypedRouter.PUT,
    '/api/madoc/iiif/collections/:id/metadata',
    updateMetadata,
    'MetadataUpdate',
  ],
  'put-collection-structure': [
    TypedRouter.PUT,
    '/api/madoc/iiif/collections/:id/structure',
    updateCollectionStructure,
    'UpdateStructureList',
  ],
  'get-collection-autocomplete': [
    TypedRouter.GET,
    '/api/madoc/iiif/autocomplete/collections',
    getCollectionAutocomplete,
  ],
  'get-flat-collection-statistics': [
    TypedRouter.GET,
    '/api/madoc/iiif/collections/:id/statistics',
    getFlatCollectionStatistics,
  ],
  'get-collection-linking': [TypedRouter.GET, '/api/madoc/iiif/collections/:id/linking', getLinking],
  'get-collection-member-linking': [
    TypedRouter.GET,
    '/api/madoc/iiif/collections/:id/member-linking',
    getParentLinking,
  ],

  // Manifest API.
  'list-manifests': [TypedRouter.GET, '/api/madoc/iiif/manifests', listManifests],
  'get-manifest': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id', getManifest],
  'create-manifest': [TypedRouter.POST, '/api/madoc/iiif/manifests', createManifest, 'CreateManifest'],
  'delete-manifest': [TypedRouter.DELETE, '/api/madoc/iiif/manifests/:id', deleteManifest],
  'publish-manifest': [TypedRouter.POST, '/api/madoc/iiif/manifests/:id/publish', publishManifest],
  'get-manifest-metadata': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id/metadata', getManifestMetadata],
  'get-manifest-structure': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id/structure', getManifestStructure],
  'get-manifest-projects': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id/projects', getManifestProjects],
  'put-manifest-metadata': [
    TypedRouter.PUT,
    '/api/madoc/iiif/manifests/:id/metadata',
    updateMetadata,
    'MetadataUpdate',
  ],
  'put-manifest-structure': [
    TypedRouter.PUT,
    '/api/madoc/iiif/manifests/:id/structure',
    updateManifestStructure,
    'UpdateStructureList',
  ],
  'get-manifest-collections': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id/collections', getManifestCollections],
  'get-manifest-autocomplete': [TypedRouter.GET, '/api/madoc/iiif/autocomplete/manifests', getManifestAutocomplete],
  'get-manifest-linking': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id/linking', getLinking],
  'get-manifest-canvas-linking': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id/canvas-linking', getParentLinking],
  'search-index-manifest': [TypedRouter.POST, '/api/madoc/iiif/manifests/:id/index', indexManifest],

  // Canvas API
  'list-canvases': [TypedRouter.GET, '/api/madoc/iiif/canvases', listCanvases],
  'get-canvas': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id', getCanvas],
  'create-canvas': [TypedRouter.POST, '/api/madoc/iiif/canvases', createCanvas],
  'get-canvas-metadata': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id/metadata', getCanvasMetadata],
  'put-canvas-metadata': [TypedRouter.PUT, '/api/madoc/iiif/canvases/:id/metadata', updateMetadata, 'MetadataUpdate'],
  'get-canvas-manifests': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id/manifests', getCanvasManifests],
  'get-canvas-linking': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id/linking', getLinking],
  'search-index-canvas': [TypedRouter.POST, '/api/madoc/iiif/canvases/:id/index', indexCanvas],
  'convert-linking-property': [TypedRouter.POST, '/api/madoc/iiif/linking/:id/convert', convertLinking],
  'get-canvas-plaintext': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id/plaintext', getCanvasPlaintext],
  'get-canvas-source': [TypedRouter.GET, '/api/madoc/iiif/canvas-source', getCanvasReference],

  // Import API
  'import-manifest': [TypedRouter.POST, '/api/madoc/iiif/import/manifest', importManifest],
  'import-manifest-ocr': [TypedRouter.POST, '/api/madoc/iiif/import/manifest-ocr', importManifestOcr],
  'import-collection': [TypedRouter.POST, '/api/madoc/iiif/import/collection', importCollection],

  // Linking API.
  'add-linking': [TypedRouter.POST, '/api/madoc/iiif/linking', addLinking],
  'delete-linking': [TypedRouter.DELETE, '/api/madoc/iiif/linking/:id', deleteLinking],
  'update-linking': [TypedRouter.PUT, '/api/madoc/iiif/linking/:id', updateLinking],

  // Stats.
  'get-statistics': [TypedRouter.GET, '/api/madoc/iiif/statistics', statistics],
  'post-batch-index': [TypedRouter.POST, '/api/madoc/iiif/batch-index', batchIndex],
  'post-full-index': [TypedRouter.POST, '/api/madoc/iiif/reindex', fullReindex],
  'get-metadata-keys': [TypedRouter.GET, '/api/madoc/iiif/metadata-keys', getMetadataKeys],
  'get-metadata-values': [TypedRouter.GET, '/api/madoc/iiif/metadata-values', getMetadataValues],

  // Projects
  'create-project': [TypedRouter.POST, '/api/madoc/projects', createNewProject],
  'list-projects': [TypedRouter.GET, '/api/madoc/projects', listProjects],
  'get-project': [TypedRouter.GET, '/api/madoc/projects/:id', getProject],
  'get-project-structure': [TypedRouter.GET, '/api/madoc/projects/:id/structure', getProjectStructure],
  'get-project-metadata': [TypedRouter.GET, '/api/madoc/projects/:id/metadata', getProjectMetadata],
  'update-project-metadata': [TypedRouter.PUT, '/api/madoc/projects/:id/metadata', updateProjectMetadata],
  'update-project-status': [TypedRouter.PUT, '/api/madoc/projects/:id/status', updateProjectStatus],
  'create-project-resource-claim': [TypedRouter.POST, '/api/madoc/projects/:id/claim', createResourceClaim],
  'update-project-curated-feed': [TypedRouter.POST, '/api/madoc/projects/:id/feeds/:feed', updateCuratedFeed],
  'create-project-resource-prepare-claim': [
    TypedRouter.POST,
    '/api/madoc/projects/:id/prepare-claim',
    prepareResourceClaim,
  ],
  'delete-project-resource-claim': [TypedRouter.POST, '/api/madoc/projects/:id/revoke-claim', deleteResourceClaim],
  'update-project-resource-claim': [TypedRouter.POST, '/api/madoc/projects/:id/claim/:claimId', updateResourceClaim],
  'assign-review': [TypedRouter.POST, '/api/madoc/projects/:id/reviews', assignReview],
  'get-project-model': [TypedRouter.GET, '/api/madoc/projects/:id/models/:subject', getProjectModel],
  'get-project-task': [TypedRouter.GET, '/api/madoc/projects/:id/task', getProjectTask],
  'assign-random-resource': [TypedRouter.POST, '/api/madoc/projects/:id/random', assignRandomResource],
  'get-project-personal-note': [TypedRouter.GET, '/api/madoc/projects/:id/personal-notes/:resourceId', getProjectNote],
  'update-project-personal-note': [
    TypedRouter.PUT,
    '/api/madoc/projects/:id/personal-notes/:resourceId',
    updateProjectNote,
  ],

  // Themes
  'list-themes': [TypedRouter.GET, '/api/madoc/system/themes', listThemes],
  // 'get-theme': [TypedRouter.GET, '/api/madoc/system/themes/:theme_id', getTheme],
  'install-theme': [TypedRouter.POST, '/api/madoc/system/themes/:theme_id/install', installTheme],
  'uninstall-theme': [TypedRouter.POST, '/api/madoc/system/themes/:theme_id/uninstall', uninstallTheme],
  'enable-theme': [TypedRouter.POST, '/api/madoc/system/themes/:theme_id/enable', enableTheme],
  'disable-theme': [TypedRouter.POST, '/api/madoc/system/themes/:theme_id/disable', disableTheme],
  'theme-asset': [TypedRouter.GET, '/s/:slug/madoc/themes/:theme_id/public/:bundleName', serveThemeAsset],

  // Pages
  'create-page': [TypedRouter.POST, '/api/madoc/pages', createPage],
  'get-page': [TypedRouter.GET, '/api/madoc/pages/root/:paths*', getPage],
  'delete-page': [TypedRouter.DELETE, '/api/madoc/pages/root/:paths*', deletePage],
  'update-page': [TypedRouter.PUT, '/api/madoc/pages/root/:paths*', updatePage],
  'get-all-pages': [TypedRouter.GET, '/api/madoc/pages', getAllPages],
  'get-link-autocomplete': [TypedRouter.GET, '/api/madoc/links/autocomplete', linkAutocomplete],

  // Slots
  'create-slot': [TypedRouter.POST, '/api/madoc/slots', createSlot],
  'get-slot': [TypedRouter.GET, '/api/madoc/slots/:slotId', getSlot],
  'delete-slot': [TypedRouter.DELETE, '/api/madoc/slots/:slotId', deleteSlot],
  'create-slot-block': [TypedRouter.POST, '/api/madoc/slots/:slotId/blocks', createBlock],
  'update-slot-structure': [TypedRouter.PUT, '/api/madoc/slots/:slotId/structure', updateSlotStructure],
  'update-slot': [TypedRouter.PUT, '/api/madoc/slots/:slotId', updateSlot],

  // Blocks
  'create-block': [TypedRouter.POST, '/api/madoc/blocks', createBlock],
  'get-block': [TypedRouter.GET, '/api/madoc/blocks/:blockId', getBlock],
  'delete-block': [TypedRouter.DELETE, '/api/madoc/blocks/:blockId', deleteBlock],
  'update-block': [TypedRouter.PUT, '/api/madoc/blocks/:blockId', updateBlock],

  // Omeka routes
  'get-login': [TypedRouter.GET, '/s/:slug/madoc/login', loginPage],
  'post-login': [TypedRouter.POST, '/s/:slug/madoc/login', loginPage],
  'get-logout': [TypedRouter.GET, '/s/:slug/madoc/logout', logout],
  'refresh-login': [TypedRouter.POST, '/s/:slug/madoc/auth/refresh', refreshToken],
  'asset-plugin-bundles': [
    TypedRouter.GET,
    '/s/:slug/madoc/assets/plugins/:pluginId/:revisionId/plugin.js',
    pluginBundles,
  ],
  'assets-bundles': [TypedRouter.GET, '/s/:slug/madoc/assets/:bundleId.bundle.js', frontendBundles],
  'assets-sub-bundles': [TypedRouter.GET, '/s/:slug/madoc/assets/:bundleName', frontendBundles],
  'get-user-details': [TypedRouter.GET, '/s/:slug/madoc/api/me', userDetails],

  // Media
  'list-media': [TypedRouter.GET, '/api/madoc/media', listMedia],
  'get-media': [TypedRouter.GET, '/api/madoc/media/:mediaId', getMedia],
  'delete-media': [TypedRouter.DELETE, '/api/madoc/media/:mediaId', deleteMedia],
  'create-media': [TypedRouter.POST, '/api/madoc/media', createMedia],
  'generate-media-thumbnails': [TypedRouter.POST, '/api/madoc/media/:mediaId/generate-thumbnails', generateThumbnails],

  // New Site routes.
  'site-canvas': [TypedRouter.GET, '/s/:slug/madoc/api/canvases/:id', siteCanvas],
  'site-collection': [TypedRouter.GET, '/s/:slug/madoc/api/collections/:id', siteCollection],
  'site-collections': [TypedRouter.GET, '/s/:slug/madoc/api/collections', siteCollections],
  'site-manifest': [TypedRouter.GET, '/s/:slug/madoc/api/manifests/:id', siteManifest],
  'site-manifest-structure': [TypedRouter.GET, '/s/:slug/madoc/api/manifests/:id/structure', getSiteManifestStructure],
  'site-manifests': [TypedRouter.GET, '/s/:slug/madoc/api/manifests', siteManifests],
  'site-manifest-tasks': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/projects/:projectSlug/manifest-tasks/:manifestId',
    siteManifestTasks,
  ],
  'site-page': [TypedRouter.GET, '/s/:slug/madoc/api/page/root/:paths*', sitePages],
  'site-static-page': [TypedRouter.GET, '/s/:slug/madoc/api/page/static/root/:paths*', getStaticPage],
  'site-resolve-slot': [TypedRouter.GET, '/s/:slug/madoc/api/slots', resolveSlots],
  'site-project': [TypedRouter.GET, '/s/:slug/madoc/api/projects/:projectSlug', siteProject],
  'site-projects': [TypedRouter.GET, '/s/:slug/madoc/api/projects', siteProjects],
  'site-search': [TypedRouter.POST, '/s/:slug/madoc/api/search', siteSearch],
  'site-topic': [TypedRouter.GET, '/s/:slug/madoc/api/topics/:type/:id', siteTopic],
  'site-topic-type': [TypedRouter.GET, '/s/:slug/madoc/api/topics/:type', siteTopicType],
  'site-topic-types': [TypedRouter.GET, '/s/:slug/madoc/api/topics', siteTopicTypes],
  'site-published-models': [TypedRouter.GET, '/s/:slug/madoc/api/canvases/:id/models', sitePublishedModels],
  'site-canvas-models': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/projects/:projectSlug/canvas-models/:canvasId',
    siteCanvasModels,
  ],
  'site-canvas-source': [TypedRouter.GET, '/s/:slug/madoc/api/canvas-source', siteCanvasSource],
  'site-canvas-tasks': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/projects/:projectSlug/canvas-tasks/:canvasId',
    siteCanvasTasks,
  ],
  'site-configuration': [TypedRouter.GET, '/s/:slug/madoc/api/configuration', siteConfiguration],
  'site-model-configuration': [TypedRouter.GET, '/s/:slug/madoc/api/configuration/model', siteModelConfiguration],
  'site-page-navigation': [TypedRouter.GET, '/s/:slug/madoc/api/pages/navigation/:paths*', sitePageNavigation],
  'site-facet-configuration': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/configuration/search-facets',
    getFacetConfiguration,
  ],
  'site-metadata-configuration': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/configuration/metadata',
    getMetadataConfiguration,
  ],
  'site-task-metadata': [TypedRouter.GET, '/s/:slug/madoc/api/task-metadata/:taskId', siteTaskMetadata],
  'site-list-locales': [TypedRouter.GET, '/s/:slug/madoc/api/locales', listLocalisations],
  'site-get-locale': [TypedRouter.GET, '/s/:slug/madoc/api/locales/:code', getLocalisation],

  // To be worked into API calling methods
  'manifest-search': [TypedRouter.GET, '/s/:slug/madoc/api/manifests/:id/search/1.0', searchManifest],
  // 'manifest-export': [TypedRouter.GET, '/s/:slug/madoc/api/manifests/:id/export/source', exportManifest],
  'manifest-build': [TypedRouter.GET, '/s/:slug/madoc/api/manifests/:id/export/:version', siteManifestBuild],
  'manifest-project-build': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/projects/:projectSlug/export/manifest/:id/:version',
    siteManifestBuild,
  ],

  // Other routes.
  ...activityStreamRoutes,

  // Development
  'development-plugin': [TypedRouter.POST, '/api/madoc/development/plugin-token', developmentPlugin],
  'accept-development-plugin': [TypedRouter.POST, '/api/madoc/development/dev-bundle', acceptNewDevelopmentBundle],

  // PAT
  'personal-access-token': [TypedRouter.POST, '/api/madoc/access-token', personalAccessToken],

  // Locale
  'get-locale': [TypedRouter.GET, '/s/:slug/madoc/api/locales/:lng/:ns', getLocale],
  'add-missing-locale': [TypedRouter.POST, '/s/:slug/madoc/api/locales/:lng/:ns', saveMissingLocale],

  // Test omeka pages.
  // 'get-page': [TypedRouter.GET, '/s/:slug/madoc/page/:pageSlug+', sitePage],

  // Frontend
  'admin-frontend': [TypedRouter.GET, '/s/:slug/madoc/admin(.*)', adminFrontend],
  'site-frontend': [TypedRouter.GET, '/s/:slug/madoc(.*)', siteFrontend],

  // Make sure this is last.
  'omeka-404': [TypedRouter.GET, '/s/:slug/madoc(.*)', madocNotFound],
});
