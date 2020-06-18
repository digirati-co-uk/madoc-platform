import { TypedRouter } from './utility/typed-router';
import { ping } from './routes/ping';
import { madocNotFound } from './routes/madoc-not-found';
import { importCollection, importManifest } from './routes/iiif-import/import';
import { loginPage } from './routes/user/login';
import { getSiteScopes, saveSiteScopes } from './routes/admin/site-scopes';
import { logout } from './routes/user/logout';
import { frontendBundles } from './routes/assets/frontend-bundles';
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
import { updateManifestStructure } from './routes/iiif/manifests/update-manifest-structure';
import { getManifestStructure } from './routes/iiif/manifests/get-manifest-structure';
import { getLocale } from './routes/locales';
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
import { sitePage } from './routes/site/site-page';
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
import { createResourceClaim } from './routes/projects/create-resource-claim';
import { statistics } from './routes/iiif/statistics';
import { getCanvasManifests } from './routes/iiif/canvases/get-canvas-manifests';
import { getManifestCollections } from './routes/iiif/manifests/get-manifest-collections';
import { getFlatCollectionStatistics } from './routes/iiif/collections/get-flat-collection-statistics';

export const router = new TypedRouter({
  // Normal route
  'get-ping': [TypedRouter.GET, '/api/madoc', ping],
  'get-scopes': [TypedRouter.GET, '/api/madoc/site/:siteId/permissions', getSiteScopes],
  'update-scopes': [TypedRouter.POST, '/api/madoc/site/:siteId/permissions', saveSiteScopes],

  // Collection API.
  'list-collections': [TypedRouter.GET, '/api/madoc/iiif/collections', listCollections],
  'get-collection': [TypedRouter.GET, '/api/madoc/iiif/collections/:id', getCollection],
  'create-collection': [TypedRouter.POST, '/api/madoc/iiif/collections', createCollection, 'CreateCollection'],
  'delete-collection': [TypedRouter.DELETE, '/api/madoc/iiif/collections/:id', deleteCollection],
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

  // Manifest API.
  'list-manifests': [TypedRouter.GET, '/api/madoc/iiif/manifests', listManifests],
  'get-manifest': [TypedRouter.GET, '/api/madoc/iiif/manifests/:id', getManifest],
  'create-manifest': [TypedRouter.POST, '/api/madoc/iiif/manifests', createManifest, 'CreateManifest'],
  'delete-manifest': [TypedRouter.DELETE, '/api/madoc/iiif/manifests/:id', deleteManifest],
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

  // Canvas API
  'list-canvases': [TypedRouter.GET, '/api/madoc/iiif/canvases', listCanvases],
  'get-canvas': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id', getCanvas],
  'create-canvas': [TypedRouter.POST, '/api/madoc/iiif/canvases', createCanvas],
  'get-canvas-metadata': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id/metadata', getCanvasMetadata],
  'put-canvas-metadata': [TypedRouter.PUT, '/api/madoc/iiif/canvases/:id/metadata', updateMetadata, 'MetadataUpdate'],
  'get-canvas-manifests': [TypedRouter.GET, '/api/madoc/iiif/canvases/:id/manifests', getCanvasManifests],

  // Import API
  'import-manifest': [TypedRouter.POST, '/api/madoc/iiif/import/manifest', importManifest],
  'import-collection': [TypedRouter.POST, '/api/madoc/iiif/import/collection', importCollection],

  // Stats.
  'get-statistics': [TypedRouter.GET, '/api/madoc/iiif/statistics', statistics],

  // Projects
  'create-project': [TypedRouter.POST, '/api/madoc/projects', createNewProject],
  'list-projects': [TypedRouter.GET, '/api/madoc/projects', listProjects],
  'get-project': [TypedRouter.GET, '/api/madoc/projects/:id', getProject],
  'get-project-structure': [TypedRouter.GET, '/api/madoc/projects/:id/structure', getProjectStructure],
  'get-project-metadata': [TypedRouter.GET, '/api/madoc/projects/:id/metadata', getProjectMetadata],
  'update-project-metadata': [TypedRouter.PUT, '/api/madoc/projects/:id/metadata', updateProjectMetadata],
  'create-project-resource-claim': [TypedRouter.POST, '/api/madoc/projects/:id/claim', createResourceClaim],

  // Omeka routes
  'get-login': [TypedRouter.GET, '/s/:slug/madoc/login', loginPage],
  'post-login': [TypedRouter.POST, '/s/:slug/madoc/login', loginPage],
  'get-logout': [TypedRouter.GET, '/s/:slug/madoc/logout', logout],
  'refresh-login': [TypedRouter.POST, '/s/:slug/madoc/auth/refresh', refreshToken],
  'assets-bundles': [TypedRouter.GET, '/s/:slug/madoc/assets/:bundleId/bundle.js', frontendBundles],
  'assets-sub-bundles': [TypedRouter.GET, '/s/:slug/madoc/assets/:bundleId/:bundleName', frontendBundles],

  // New Site routes.
  'site-canvas': [TypedRouter.GET, '/s/:slug/madoc/api/canvases/:id', siteCanvas],
  'site-collection': [TypedRouter.GET, '/s/:slug/madoc/api/collections/:id', siteCollection],
  'site-collections': [TypedRouter.GET, '/s/:slug/madoc/api/collections', siteCollections],
  'site-manifest': [TypedRouter.GET, '/s/:slug/madoc/api/manifests/:id', siteManifest],
  'site-manifests': [TypedRouter.GET, '/s/:slug/madoc/api/manifests', siteManifests],
  'site-page': [TypedRouter.GET, '/s/:slug/madoc/api/page/:pageSlug+', sitePage],
  'site-project': [TypedRouter.GET, '/s/:slug/madoc/api/projects/:projectSlug', siteProject],
  'site-projects': [TypedRouter.GET, '/s/:slug/madoc/api/projects', siteProjects],
  'site-search': [TypedRouter.GET, '/s/:slug/madoc/api/search', siteSearch],
  'site-topic': [TypedRouter.GET, '/s/:slug/madoc/api/topics/:type/:id', siteTopic],
  'site-topic-type': [TypedRouter.GET, '/s/:slug/madoc/api/topics/:type', siteTopicType],
  'site-topic-types': [TypedRouter.GET, '/s/:slug/madoc/api/topics', siteTopicTypes],

  // Locale
  'get-locale': [TypedRouter.GET, '/s/:slug/madoc/api/locales/:lng/:ns', getLocale],

  // Test omeka pages.
  // 'get-page': [TypedRouter.GET, '/s/:slug/madoc/page/:pageSlug+', sitePage],

  // Frontend
  'admin-frontend': [TypedRouter.GET, '/s/:slug/madoc/admin*', adminFrontend],
  'site-frontend': [TypedRouter.GET, '/s/:slug/madoc*', siteFrontend],

  // Make sure this is last.
  'omeka-404': [TypedRouter.GET, '/s/:slug/madoc*', madocNotFound],
});
