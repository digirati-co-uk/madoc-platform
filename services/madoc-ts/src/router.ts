import { getAuthRoutes } from './auth';
import { deleteApiKey } from './routes/admin/delete-api-key';
import { keyRegenerate } from './routes/admin/key-regenerate';
import { listApiKeys } from './routes/admin/list-api-keys';
import { getProjectAnnotationStyle } from './routes/annotation-styles/get-project-annotation-style';
import { annotationStyles } from './routes/annotation-styles/index';
import { searchAllUsers } from './routes/global/search-all-users';
import { systemCheck } from './routes/global/system-check';
import { getAutomatedUsers } from './routes/manage-site/get-automated-users';
import { createProjectExport } from './routes/projects/create-project-export';
import { getProjectRawData } from './routes/projects/get-project-raw-data';
import { listProjectModelEntityAutocomplete } from './routes/projects/list-project-model-entity-autocomplete';
import { updateProjectAnnotationStyle } from './routes/projects/update-project-annotation-style';
import { siteRoot } from './routes/root';
import {
  assignUserToDelegatedRequest,
  createDelegatedRequest,
  delegatedRequest,
} from './routes/admin/deletegated-request';
import { acceptNewDevelopmentBundle, developmentPlugin } from './routes/admin/development-plugin';
import { getMetadataKeys } from './routes/admin/get-metadata-keys';
import { getMetadataValues } from './routes/admin/get-metadata-values';
import { getModelConfiguration } from './routes/admin/get-model-configuration';
import { getSystemConfig } from './routes/global/get-system-config';
import { getUser } from './routes/global/get-user';
import { listAllUsers } from './routes/global/list-all-users';
import { resetPassword } from './routes/global/reset-password';
import { updateSystemConfig } from './routes/global/update-system-config';
import { updateUser } from './routes/global/update-user';
import { activateUser } from './routes/global/activate-user';
import { createInvitation } from './routes/manage-site/create-invitation';
import { createSite } from './routes/global/create-site';
import { createUser } from './routes/global/create-user';
import { deactivateUser } from './routes/global/deactivate-user';
import { deleteInvitation } from './routes/manage-site/delete-invitation';
import { deleteUser } from './routes/global/delete-user';
import { deleteUserSiteRole } from './routes/manage-site/delete-user-site-role';
import { getInvitation } from './routes/manage-site/get-invitation';
import { getSiteUsers } from './routes/manage-site/get-site-users';
import { listJobs, runJob } from './routes/admin/list-jobs';
import {
  extractLocalesFromContent,
  getLocalisation,
  listLocalisations,
  updateLanguagePreferences,
  updateLocalisation,
} from './routes/admin/localisation';
import { listAllSites } from './routes/global/list-all-sites';
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
import { pm2RestartAuth, pm2RestartMadoc, pm2RestartQueue, pm2RestartScheduler, pm2Status } from './routes/admin/pm2';
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
import { listInvitations } from './routes/manage-site/list-invitations';
import { updateInvitation } from './routes/manage-site/update-invitation';
import { updateSiteDetails } from './routes/manage-site/update-site-details';
import { updateUserSiteRole } from './routes/manage-site/update-user-site-role';
import { getAllProjectNotes } from './routes/projects/get-all-project-notes';
import { siteCompletions } from './routes/site/site-completions';
import { siteDetails } from './routes/site/site-details';
import { deleteManifestSummary } from './routes/iiif/manifests/delete-manifest-summary';
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
import { siteManifestModels } from './routes/site/site-manifest-models';
import { siteMetadata } from './routes/site/site-metadata';
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
import { listProjectsAutocomplete } from './routes/projects/list-projects-autocomplete';
import { siteTaskMetadata } from './routes/site/site-task-metadata';
import { siteUserAutocomplete } from './routes/site/site-user-autocomplete';
import { forgotPassword } from './routes/user/forgot-password';
import { getSiteUser } from './routes/user/get-site-user';
import { loginRefresh } from './routes/user/login-refresh';
import {
  clearAllNotifications,
  clearNotification,
  createNotification,
  getNotificationCount,
  getNotifications,
  readAllNotifications,
  readNotification,
} from './routes/user/notifications';
import { registerPage } from './routes/user/register';
import { resetPasswordPage } from './routes/user/reset-password';
import { updatePassword } from './routes/user/update-password';
import { updateProfilePage } from './routes/user/update-profile';
import { userAutocomplete } from './routes/user/user-autocomplete';
import { TypedRouter } from './utility/typed-router';
import { ping } from './routes/ping';
import { importBulkManifests, importCollection, importManifest, importManifestOcr } from './routes/iiif-import/import';
import { loginPage } from './routes/user/login';
import { getSiteScopes, saveSiteScopes } from './routes/admin/site-scopes';
import { logout } from './routes/user/logout';
import { frontendBundles } from './routes/assets/frontend-bundles';
import { pluginBundles } from './routes/assets/plugin-bundles';
import { adminFrontend } from './routes/frontend/admin-frontend';
import { siteFrontend } from './routes/frontend/site-frontend';
import { createCollection } from './routes/iiif/collections/create-collection';
import { deleteCollectionEndpoint } from './routes/iiif/collections/delete-collection';
import { getCollection } from './routes/iiif/collections/get-collection';
import { getCollectionStructure } from './routes/iiif/collections/get-collection-structure';
import { getCollectionMetadata } from './routes/iiif/collections/get-collection-metadata';
import { listCollections } from './routes/iiif/collections/list-collections';
import { updateCollectionStructure } from './routes/iiif/collections/update-collection-structure';
import { listManifests } from './routes/iiif/manifests/list-manifests';
import { createManifest } from './routes/iiif/manifests/create-manifest';
import { getManifest } from './routes/iiif/manifests/get-manifest';
import { deleteManifestEndpoint } from './routes/iiif/manifests/delete-manifest';
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
import { router as captureModelRoutes } from './capture-model-server/router';
import { getCollectionDeletionSummary } from './routes/iiif/collections/delete-collection-summary';
import { deleteCanvasSummary } from './routes/iiif/canvases/delete-canvas-summary';
import { deleteProjectSummary } from './routes/projects/delete-project-summary';
import { deleteCanvasEndpoint } from './routes/iiif/canvases/delete-canvas';
import { deleteProjectEndpoint } from './routes/projects/deleteProject';
import { exportProjectTemplate } from './routes/projects/export-project-template';
import { generateApiKey } from './routes/admin/generate-api-key';
import { authenticateApi } from './routes/global/api-authentication';

export const router = new TypedRouter({
  // Normal route
  'get-ping': [TypedRouter.GET, '/api/madoc', ping],
  'get-scopes': [TypedRouter.GET, '/api/madoc/site/:siteId/permissions', getSiteScopes],
  'update-scopes': [TypedRouter.POST, '/api/madoc/site/:siteId/permissions', saveSiteScopes],
  'pm2-list': [TypedRouter.GET, '/api/madoc/pm2/list', pm2Status],
  'pm2-restart-auth': [TypedRouter.POST, '/api/madoc/pm2/restart/auth', pm2RestartAuth],
  'pm2-restart-queue': [TypedRouter.POST, '/api/madoc/pm2/restart/queue', pm2RestartQueue],
  'pm2-restart-madoc': [TypedRouter.POST, '/api/madoc/pm2/restart/madoc', pm2RestartMadoc],
  'pm2-restart-scheduler': [TypedRouter.POST, '/api/madoc/pm2/restart/scheduler', pm2RestartScheduler],
  'cron-jobs': [TypedRouter.GET, '/api/madoc/cron/jobs', listJobs],
  'run-cron-jobs': [TypedRouter.POST, '/api/madoc/cron/jobs/:jobId/run', runJob],
  'regenerate-keys': [TypedRouter.POST, '/api/madoc/system/key-regen', keyRegenerate],
  'generate-api-key': [TypedRouter.POST, '/api/madoc/system/api-keys', generateApiKey],
  'get-api-keys': [TypedRouter.GET, '/api/madoc/system/api-keys', listApiKeys],
  'delete-api-key': [TypedRouter.DELETE, '/api/madoc/system/api-keys/:client_id', deleteApiKey],

  // Manage sites.
  'site-admin-list-all-sites': [TypedRouter.GET, '/api/madoc/sites', listAllSites],
  'site-admin-create-site': [TypedRouter.POST, '/api/madoc/sites', createSite],

  // Manage all users
  'global-search-user': [TypedRouter.GET, '/api/madoc/users/search', searchAllUsers],
  'global-list-all-users': [TypedRouter.GET, '/api/madoc/users', listAllUsers],
  'global-get-user': [TypedRouter.GET, '/api/madoc/users/:userId', getUser],
  'global-put-user': [TypedRouter.PUT, '/api/madoc/users/:userId', updateUser],
  'global-create-user': [TypedRouter.POST, '/api/madoc/users', createUser],
  'global-activate-user': [TypedRouter.POST, '/api/madoc/users/:userId/activate', activateUser],
  'global-deactivate-user': [TypedRouter.POST, '/api/madoc/users/:userId/deactivate', deactivateUser],
  'global-delete-user': [TypedRouter.DELETE, '/api/madoc/users/:userId', deleteUser],
  'global-reset-password-user': [TypedRouter.POST, '/api/madoc/users/:userId/reset-password', resetPassword],
  'global-get-system-config': [TypedRouter.GET, '/api/madoc/system/config', getSystemConfig],
  'global-update-system-config': [TypedRouter.POST, '/api/madoc/system/config', updateSystemConfig],
  'global-system-check': [TypedRouter.POST, '/api/madoc/system/check', systemCheck],

  // Manage users (on site)
  'site-admin-list-all-site-users': [TypedRouter.GET, '/api/madoc/manage-site/users', getSiteUsers],
  'site-list-all-bot-users': [TypedRouter.GET, '/api/madoc/manage-site/bots', getAutomatedUsers],
  // User API.
  'manage-site-all-users': [TypedRouter.GET, '/api/madoc/manage-site/users/search', userAutocomplete],
  'site-admin-get-user': [TypedRouter.GET, '/api/madoc/manage-site/users/:userId', getSiteUser],
  'manage-site-set-user-role': [TypedRouter.POST, '/api/madoc/manage-site/users/:userId/role', updateUserSiteRole],
  'manage-site-delete-user-role': [TypedRouter.DELETE, '/api/madoc/manage-site/users/:userId/role', deleteUserSiteRole],
  'manage-site-details': [TypedRouter.PUT, '/api/madoc/manage-site/details', updateSiteDetails],

  // Invitations (on site)
  'manage-site-list-invitations': [TypedRouter.GET, '/api/madoc/manage-site/invitations', listInvitations],
  'manage-site-get-invitation': [TypedRouter.GET, '/api/madoc/manage-site/invitations/:invitationId', getInvitation],
  'manage-site-put-invitation': [TypedRouter.PUT, '/api/madoc/manage-site/invitations/:invitationId', updateInvitation],
  'manage-site-delete-invitation': [
    TypedRouter.DELETE,
    '/api/madoc/manage-site/invitations/:invitationId',
    deleteInvitation,
  ],
  'manage-site-post-invitation': [TypedRouter.POST, '/api/madoc/manage-site/invitations', createInvitation],

  // Plugins
  'list-plugins': [TypedRouter.GET, '/api/madoc/system/plugins', listPlugins],
  'get-plugin': [TypedRouter.GET, '/api/madoc/system/plugins/:id', getPlugin],
  'install-plugin': [TypedRouter.POST, '/api/madoc/system/plugins', installPlugin, { schemaName: 'SitePlugin' }],
  'view-remote-plugin': [TypedRouter.GET, '/api/madoc/system/plugins/external/:author/:repo', viewRemotePlugin],
  'install-remote-plugin': [TypedRouter.POST, '/api/madoc/system/plugins/external/install', installRemotePlugin],
  'enable-plugin': [TypedRouter.POST, '/api/madoc/system/plugins/:id/enable', enablePlugin],
  'disable-plugin': [TypedRouter.POST, '/api/madoc/system/plugins/:id/disable', disablePlugin],
  'uninstall-plugin': [TypedRouter.POST, '/api/madoc/system/plugins/:id/uninstall', uninstallPlugin],
  'plugin-dependencies': [TypedRouter.GET, '/api/madoc/system/plugins/:id/dependencies', getPluginDependencies],

  // Delegated tasks
  'run-delegated-task': [TypedRouter.POST, '/api/madoc/delegated/:id', delegatedRequest],
  'assign-delegated-task': [TypedRouter.POST, '/api/madoc/delegated/:id/assign', assignUserToDelegatedRequest],
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
  'i18n-analysis-locales': [TypedRouter.GET, '/api/madoc/locales/analysis', extractLocalesFromContent],
  'i18n-get-locale': [TypedRouter.GET, '/api/madoc/locales/:code', getLocalisation],
  'i18n-get-locale-ns': [TypedRouter.GET, '/api/madoc/locales/:code/:namespace', getLocalisation],
  'i18n-update-locale': [TypedRouter.POST, '/api/madoc/locales/:code', updateLocalisation],
  'i18n-update-locale-ns': [TypedRouter.POST, '/api/madoc/locales/:code/:namespace', updateLocalisation],
  'i18n-update-locale-pref': [TypedRouter.PATCH, '/api/madoc/locales', updateLanguagePreferences],

  // Collection API.
  'list-collections': [TypedRouter.GET, '/api/madoc/iiif/collections', listCollections],
  'get-collection': [TypedRouter.GET, '/api/madoc/iiif/collections/:id', getCollection],
  'create-collection': [
    TypedRouter.POST,
    '/api/madoc/iiif/collections',
    createCollection,
    { schemaName: 'CreateCollection' },
  ],
  'delete-collection': [TypedRouter.DELETE, '/api/madoc/iiif/collections/:id', deleteCollectionEndpoint],
  'publish-collection': [TypedRouter.POST, '/api/madoc/iiif/collections/:id/publish', publishCollection],
  'get-collection-metadata': [TypedRouter.GET, '/api/madoc/iiif/collections/:id/metadata', getCollectionMetadata],
  'get-collection-structure': [TypedRouter.GET, '/api/madoc/iiif/collections/:id/structure', getCollectionStructure],
  'get-collection-projects': [TypedRouter.GET, '/api/madoc/iiif/collections/:id/projects', getCollectionProjects],
  'get-collection-deletion-summary': [
    TypedRouter.GET,
    '/api/madoc/iiif/collections/:id/deletion-summary',
    getCollectionDeletionSummary,
  ],
  'put-collection-metadata': [
    TypedRouter.PUT,
    '/api/madoc/iiif/collections/:id/metadata',
    updateMetadata,
    { schemaName: 'MetadataUpdate' },
  ],
  'put-collection-structure': [
    TypedRouter.PUT,
    '/api/madoc/iiif/collections/:id/structure',
    updateCollectionStructure,
    { schemaName: 'UpdateStructureList' },
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
  'create-manifest': [TypedRouter.POST, '/api/madoc/iiif/manifests', createManifest, { schemaName: 'CreateManifest' }],
  'delete-manifest': [TypedRouter.DELETE, '/api/madoc/iiif/manifests/:id', deleteManifestEndpoint],
  'publish-manifest': [TypedRouter.POST, '/api/madoc/iiif/manifests/:id/publish', publishManifest],
  'get-manifest-metadata': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id/metadata', getManifestMetadata],
  'get-manifest-structure': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id/structure', getManifestStructure],
  'get-manifest-projects': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id/projects', getManifestProjects],
  'get-manifest-projects-autocomplete': [
    TypedRouter.GET,
    '/api/madoc/iiif/manifests/:id/projects-autocomplete',
    [getManifestProjects, listProjectsAutocomplete],
  ],
  'get-manifest-deletion-summary': [
    TypedRouter.GET,
    '/api/madoc/iiif/manifests/:id/deletion-summary',
    deleteManifestSummary,
  ],
  'put-manifest-metadata': [
    TypedRouter.PUT,
    '/api/madoc/iiif/manifests/:id/metadata',
    updateMetadata,
    { schemaName: 'MetadataUpdate' },
  ],
  'put-manifest-structure': [
    TypedRouter.PUT,
    '/api/madoc/iiif/manifests/:id/structure',
    updateManifestStructure,
    { schemaName: 'UpdateStructureList' },
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
  'put-canvas-metadata': [
    TypedRouter.PUT,
    '/api/madoc/iiif/canvases/:id/metadata',
    updateMetadata,
    { schemaName: 'MetadataUpdate' },
  ],
  'get-canvas-manifests': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id/manifests', getCanvasManifests],
  'get-canvas-linking': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id/linking', getLinking],
  'search-index-canvas': [TypedRouter.POST, '/api/madoc/iiif/canvases/:id/index', indexCanvas],
  'convert-linking-property': [TypedRouter.POST, '/api/madoc/iiif/linking/:id/convert', convertLinking],
  'get-canvas-plaintext': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id/plaintext', getCanvasPlaintext],
  'get-canvas-source': [TypedRouter.GET, '/api/madoc/iiif/canvas-source', getCanvasReference],
  'get-canvas-deletion-summary': [
    TypedRouter.GET,
    '/api/madoc/iiif/canvases/:id/deletion-summary',
    deleteCanvasSummary,
  ],
  'delete-canvas': [TypedRouter.DELETE, '/api/madoc/iiif/canvases/:id', deleteCanvasEndpoint],

  // Import API
  'import-manifest': [TypedRouter.POST, '/api/madoc/iiif/import/manifest', importManifest],
  'import-manifest-bulk': [TypedRouter.POST, '/api/madoc/iiif/import/manifest/bulk', importBulkManifests],
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
  'export-project': [TypedRouter.POST, '/api/madoc/projects/:id/export', createProjectExport],
  'get-project-structure': [TypedRouter.GET, '/api/madoc/projects/:id/structure', getProjectStructure],
  'get-project-metadata': [TypedRouter.GET, '/api/madoc/projects/:id/metadata', getProjectMetadata],
  'update-project-metadata': [TypedRouter.PUT, '/api/madoc/projects/:id/metadata', updateProjectMetadata],
  'update-project-annotation-style': [
    TypedRouter.PUT,
    '/api/madoc/projects/:id/annotation-style',
    updateProjectAnnotationStyle,
  ],
  'get-project-annotation-style': [
    TypedRouter.GET,
    '/api/madoc/projects/:id/annotation-style',
    getProjectAnnotationStyle,
  ],
  'list-project-model-entity-autocomplete': [
    TypedRouter.GET,
    '/api/madoc/projects/:id/model-autocomplete',
    listProjectModelEntityAutocomplete,
  ],
  'update-project-status': [TypedRouter.PUT, '/api/madoc/projects/:id/status', updateProjectStatus],
  'create-project-resource-claim': [TypedRouter.POST, '/api/madoc/projects/:id/claim', createResourceClaim],
  'export-project-template': [TypedRouter.GET, '/api/madoc/projects/:id/export', exportProjectTemplate],
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
  'get-project-data-raw': [TypedRouter.GET, '/api/madoc/projects/:id/raw-model-fields', getProjectRawData],
  'get-project-personal-note': [TypedRouter.GET, '/api/madoc/projects/:id/personal-notes/:resourceId', getProjectNote],
  'get-project-all-personal-note': [TypedRouter.GET, '/api/madoc/projects/:id/personal-notes', getAllProjectNotes],
  'update-project-personal-note': [
    TypedRouter.PUT,
    '/api/madoc/projects/:id/personal-notes/:resourceId',
    updateProjectNote,
  ],
  'get-project-deletion-summary': [TypedRouter.GET, '/api/madoc/projects/:id/deletion-summary', deleteProjectSummary],
  'delete-project': [TypedRouter.DELETE, '/api/madoc/projects/:id', deleteProjectEndpoint],

  // Themes
  'list-themes': [TypedRouter.GET, '/api/madoc/system/themes', listThemes],
  // 'get-theme': [TypedRouter.GET, '/api/madoc/system/themes/:theme_id', getTheme],
  'install-theme': [TypedRouter.POST, '/api/madoc/system/themes/:theme_id/install', installTheme],
  'uninstall-theme': [TypedRouter.POST, '/api/madoc/system/themes/:theme_id/uninstall', uninstallTheme],
  'enable-theme': [TypedRouter.POST, '/api/madoc/system/themes/:theme_id/enable', enableTheme],
  'disable-theme': [TypedRouter.POST, '/api/madoc/system/themes/:theme_id/disable', disableTheme],
  'theme-asset': [TypedRouter.GET, '/s/:slug/themes/:theme_id/public/:bundleName', serveThemeAsset],

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

  // Anonymous routes
  'get-login': [TypedRouter.GET, '/s/:slug/login', loginPage],
  'post-login': [TypedRouter.POST, '/s/:slug/login', loginPage],
  'get-register': [TypedRouter.GET, '/s/:slug/register', registerPage],
  'post-register': [TypedRouter.POST, '/s/:slug/register', registerPage],
  'get-forgot-password': [TypedRouter.GET, '/s/:slug/forgot-password', forgotPassword],
  'post-forgot-password': [TypedRouter.POST, '/s/:slug/forgot-password', forgotPassword],
  'get-change-password': [TypedRouter.GET, '/s/:slug/profile/password', updatePassword],
  'post-change-password': [TypedRouter.POST, '/s/:slug/profile/password', updatePassword],
  'post-update-password': [TypedRouter.POST, '/s/:slug/profile', updateProfilePage],
  'get-logout': [TypedRouter.GET, '/s/:slug/logout', logout],
  'reset-password': [TypedRouter.GET, '/s/:slug/reset-password', resetPasswordPage],
  'activate-account': [TypedRouter.GET, '/s/:slug/activate-account', resetPasswordPage],
  'post-reset-password': [TypedRouter.POST, '/s/:slug/reset-password', resetPasswordPage],
  'refresh-login': [TypedRouter.POST, '/s/:slug/auth/refresh', refreshToken],
  'api-authentication': [TypedRouter.POST, '/s/:slug/auth/api-token', authenticateApi],
  'get-login-refresh': [TypedRouter.GET, '/s/:slug/login/refresh', loginRefresh],
  'asset-plugin-bundles': [
    TypedRouter.GET,
    '/s/:slug/madoc/assets/plugins/:pluginId/:revisionId/plugin.js',
    pluginBundles,
    { isPublic: true },
  ],
  'assets-bundles': [TypedRouter.GET, '/s/:slug/madoc/assets/:bundleName', frontendBundles, { isPublic: true }],
  'get-user-details': [TypedRouter.GET, '/s/:slug/madoc/api/me', userDetails],

  // Media
  'list-media': [TypedRouter.GET, '/api/madoc/media', listMedia],
  'get-media': [TypedRouter.GET, '/api/madoc/media/:mediaId', getMedia],
  'delete-media': [TypedRouter.DELETE, '/api/madoc/media/:mediaId', deleteMedia],
  'create-media': [TypedRouter.POST, '/api/madoc/media', createMedia],
  'generate-media-thumbnails': [TypedRouter.POST, '/api/madoc/media/:mediaId/generate-thumbnails', generateThumbnails],

  // New Site routes.
  'current-site-details': [TypedRouter.GET, '/s/:slug/madoc/api/site', siteDetails],
  'site-canvas': [TypedRouter.GET, '/s/:slug/madoc/api/canvases/:id', siteCanvas],
  'site-canvas-metadata': [TypedRouter.GET, '/s/:slug/madoc/api/canvases/:canvasId/metadata', siteMetadata],
  'site-collection': [TypedRouter.GET, '/s/:slug/madoc/api/collections/:id', siteCollection],
  'site-collections': [TypedRouter.GET, '/s/:slug/madoc/api/collections', siteCollections],
  'site-collection-metadata': [TypedRouter.GET, '/s/:slug/madoc/api/collections/:collectionId/metadata', siteMetadata],
  'site-manifest': [TypedRouter.GET, '/s/:slug/madoc/api/manifests/:id', siteManifest],
  'site-manifest-structure': [TypedRouter.GET, '/s/:slug/madoc/api/manifests/:id/structure', getSiteManifestStructure],
  'site-manifest-metadata': [TypedRouter.GET, '/s/:slug/madoc/api/manifests/:manifestId/metadata', siteMetadata],
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
  'site-manifest-models': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/projects/:projectSlug/manifest-models/:manifestId',
    siteManifestModels,
  ],
  'site-canvas-source': [TypedRouter.GET, '/s/:slug/madoc/api/canvas-source', siteCanvasSource],
  'site-canvas-tasks': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/projects/:projectSlug/canvas-tasks/:canvasId',
    siteCanvasTasks,
  ],
  'site-configuration': [TypedRouter.GET, '/s/:slug/madoc/api/configuration', siteConfiguration],
  'site-completion': [TypedRouter.GET, '/s/:slug/madoc/api/completions/:type', siteCompletions],
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
  'site-get-locale': [TypedRouter.GET, '/s/:slug/madoc/api/locales/:lng', getLocale],
  'site-get-locale-ns': [TypedRouter.GET, '/s/:slug/madoc/api/locales/:lng/:ns', getLocale],
  'site-user-autocomplete': [TypedRouter.GET, '/s/:slug/madoc/api/users/autocomplete', siteUserAutocomplete],

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
  ...annotationStyles,
  ...captureModelRoutes,
  ...getAuthRoutes(),

  // Development
  'development-plugin': [TypedRouter.POST, '/api/madoc/development/plugin-token', developmentPlugin],
  'accept-development-plugin': [TypedRouter.POST, '/api/madoc/development/dev-bundle', acceptNewDevelopmentBundle],

  // Locale
  'get-locale': [TypedRouter.GET, '/s/:slug/madoc/api/locales/:lng/:ns', getLocale],
  'add-missing-locale': [TypedRouter.POST, '/s/:slug/madoc/api/locales/:lng/:ns', saveMissingLocale],

  // Frontend
  'admin-frontend': [TypedRouter.GET, '/s/:slug/admin(.*)', adminFrontend],
  'site-frontend-root': [TypedRouter.GET, '/s/:slug', siteFrontend],
  'site-frontend': [TypedRouter.GET, '/s/:slug/(.*)', siteFrontend],

  // Make sure this is last.
  'site-root': [TypedRouter.GET, '/', siteRoot],
  'site-root-post': [TypedRouter.POST, '/', siteRoot],
  // 'site-404': [TypedRouter.GET, '/s/:slug(.*)', madocNotFound],
});
