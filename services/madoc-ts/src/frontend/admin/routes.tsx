import React from 'react';
import { RouteObject } from 'react-router-dom';
import { annotationStylesRoutes } from './pages/annotation-styles/index';
import { CanvasJson } from './pages/content/canvases/canvas-json';
import { CanvasPlaintext } from './pages/content/canvases/canvas-plaintext';
import { CanvasSearchIndex } from './pages/content/canvases/canvas-search-index';
import { CollectionView } from './pages/content/collections/collection';
import { CollectionSearchIndex } from './pages/content/collections/collection-search-index';
import { ImportCollection } from './pages/content/collections/import-collection';
import { ConfigureLanguages } from './pages/content/internationalisation/configure-languages';
import { EditTranslation } from './pages/content/internationalisation/edit-translation';
import { ViewCanvasLinking } from './pages/content/linking/view-linking';
import { ManifestCollections } from './pages/content/manifests/manifest-collections';
import { ListMedia } from './pages/content/media/list-media';
import { Media } from './pages/content/media/media';
import { ViewMedia } from './pages/content/media/view-media';
import { MetadataConfigurationPage } from './pages/content/metadata-configuration';
import { CreateNewPage } from './pages/content/page-blocks/create-new-page';
import { ListPages } from './pages/content/page-blocks/list-pages';
import { PageBlocks } from './pages/content/page-blocks/page-blocks';
import { SiteProjectConfiguration } from './pages/content/project-configuration';
import { SiteConfiguration } from './pages/content/site-configuration';
import { SiteSystemConfiguration } from './pages/content/system-configuration';
import { ChooseAnnotationStyle } from './pages/crowdsourcing/model-editor/choose-annotation-style';
import { NewProjectFromTemplate } from './pages/crowdsourcing/projects/new-project-from-template';
import { ProjectConfiguration } from './pages/crowdsourcing/projects/project-configuration';
import { ProjectSearchIndex } from './pages/crowdsourcing/projects/project-search-index';
import { ProjectStreams } from './pages/crowdsourcing/projects/project-streams';
import { OcrListPage } from './pages/enrichment/ocr/ocr-list';
import { SearchIndexingPage } from './pages/enrichment/search-indexing';
import { ExportSite } from './pages/export/export-site';
import { CreateSite } from './pages/global/create-site';
import { CreateUser } from './pages/global/create-user';
import { GlobalSystemConfig } from './pages/global/global-system-config';
import { ListUsers } from './pages/global/list-users';
import { UserDelete } from './pages/global/user/user-delete';
import { UserOverview } from './pages/global/user/user-overview';
import { UserResetPassword } from './pages/global/user/user-reset-password';
import { UserSites } from './pages/global/user/user-sites';
import { UserUpdateDetails } from './pages/global/user/user-update-details';
import { ViewUser } from './pages/global/view-user';
import { Homepage } from './pages/homepage';
import { CollectionList } from './pages/content/collections/collection-list';
import { EditCollectionStructure } from './pages/content/collections/edit-collection-structure';
import { EditCollectionMetadata } from './pages/content/collections/edit-collection-metadata';
import { DeleteCollection } from './pages/content/collections/delete-collection';
import { CollectionManifests } from './pages/content/collections/collection-manifests';
import { ManifestList } from './pages/content/manifests/manifest-list';
import { ManifestCanvases } from './pages/content/manifests/manifest-canvases';
import { EditManifestMetadata } from './pages/content/manifests/edit-manifest-metadata';
import { EditManifestStructure } from './pages/content/manifests/edit-manifest-structure';
import { CanvasView } from './pages/content/canvases/canvas';
import { CanvasDetails } from './pages/content/canvases/canvas-details';
import { EditCanvasMetadata } from './pages/content/canvases/edit-canvas-metadata';
import { ManifestView } from './pages/content/manifests/manifest';
import { DeleteManifest } from './pages/content/manifests/delete-manifest';
import { NewProjectPage } from './pages/crowdsourcing/projects/new-project';
import { ListProjects } from './pages/crowdsourcing/projects/list-projects';
import { Project } from './pages/crowdsourcing/projects/project';
import { ProjectModelEditor } from './pages/crowdsourcing/projects/project-model-editor';
import { CreateCollection } from './pages/content/collections/create-collection';
import { CreateManifest } from './pages/content/manifests/create-manifest';
import { CreateInvitation } from './pages/sites/create-invitation';
import { ListInvitations } from './pages/sites/list-invitations';
import { ListSites } from './pages/global/list-sites';
import { SiteName } from './pages/sites/site-name';
import { SitePermissions } from './pages/sites/site-permissions';
import { ViewInvitation } from './pages/sites/view-invitation';
import { DevelopmentPlugin } from './pages/system/development-plugin';
import { ActivityStreams } from './pages/sites/activity-streams';
import { ViewExternalPlugin } from './pages/system/external-plugin';
import { KeyRegen } from './pages/system/key-regen';
import { ListApiKeys } from './pages/system/list-api-keys';
import { SystemStatus } from './pages/system/system-status';
import { ListThemes } from './pages/system/themes/list-themes';
import { TaskRouter } from './pages/tasks/task-router';
import { ProjectContent } from './pages/crowdsourcing/projects/project-content';
import { ProjectMetadata } from './pages/crowdsourcing/projects/project-metadata';
import { FullDocumentEditor } from './pages/crowdsourcing/model-editor/full-document-editor';
import { FullStructureEditor } from './pages/crowdsourcing/model-editor/full-structure-editor';
import { CaptureModelEditorHomepage } from './pages/crowdsourcing/model-editor/home';
import { CollectionProjects } from './pages/content/collections/collection-projects';
import { ManifestProjects } from './pages/content/manifests/manifest-projects';
import { CaptureModelList } from './pages/crowdsourcing/capture-models/capture-model-list';
import { CaptureModels } from './pages/crowdsourcing/capture-models/capture-models';
import { ViewCaptureModel } from './pages/crowdsourcing/capture-models/view-capture-model';
import { ProjectTasks } from './pages/crowdsourcing/projects/project-tasks';
import { ProjectOverview } from './pages/crowdsourcing/projects/project-overview';
import { PreviewCaptureModel } from './pages/crowdsourcing/model-editor/preview-capture-model';
import { EditManifestLinking } from './pages/content/manifests/edit-manifest-linking';
import { EditCanvasLinking } from './pages/content/canvases/edit-canvas-linking';
import { OcrPage } from './pages/enrichment/ocr';
import { ManifestSearchIndex } from './pages/content/manifests/manifest-search-index';
import { ListPlugins } from './pages/system/list-plugins';
import { OcrManifest } from './pages/enrichment/ocr/ocr-manifest';
import { DeleteCanvas } from './pages/content/canvases/delete-canvas';
import { DeleteProject } from './pages/crowdsourcing/projects/delete-project';
import { ProjectExportTab } from './pages/crowdsourcing/projects/project-export';
import { GenerateApiKey } from './pages/system/generate-api-key';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Homepage />,
  },
  // Aggregations.
  ...annotationStylesRoutes,

  // Manual routes.
  {
    path: '/collections',
    element: <CollectionList />,
  },
  {
    path: '/collections/:id',
    element: <CollectionView />,
    children: [
      {
        index: true,
        element: <CollectionManifests />,
      },
      {
        path: '/collections/:id/structure',
        element: <EditCollectionStructure />,
      },
      {
        path: '/collections/:id/metadata',
        element: <EditCollectionMetadata />,
      },
      {
        path: '/collections/:id/delete',
        element: <DeleteCollection />,
      },
      {
        path: '/collections/:id/projects',
        element: <CollectionProjects />,
      },
      {
        path: '/collections/:id/search',
        element: <CollectionSearchIndex />,
      },
    ],
  },
  {
    path: '/manifests',
    element: <ManifestList />,
  },
  {
    path: '/manifests/:manifestId/canvases/:id',
    element: <CanvasView />,
    children: [
      {
        index: true,
        element: <CanvasDetails />,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/metadata',
        element: <EditCanvasMetadata />,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/linking',
        element: <EditCanvasLinking />,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/linking/:linkId',
        element: <ViewCanvasLinking />,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/search',
        element: <CanvasSearchIndex />,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/plaintext',
        element: <CanvasPlaintext />,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/json',
        element: <CanvasJson />,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/delete',
        element: <DeleteCanvas />,
      },
    ],
  },
  {
    path: '/manifests/:id',
    element: <ManifestView />,
    children: [
      {
        index: true,
        element: <ManifestCanvases />,
      },
      {
        path: '/manifests/:id/metadata',
        element: <EditManifestMetadata />,
      },
      {
        path: '/manifests/:id/structure',
        element: <EditManifestStructure />,
      },
      {
        path: '/manifests/:id/linking',
        element: <EditManifestLinking />,
      },
      {
        path: '/manifests/:id/projects',
        element: <ManifestProjects />,
      },
      {
        path: '/manifests/:id/collections',
        element: <ManifestCollections />,
      },
      {
        path: '/manifests/:id/delete',
        element: <DeleteManifest />,
      },
      {
        path: '/manifests/:id/search',
        element: <ManifestSearchIndex />,
      },
      {
        path: '/manifests/:id/ocr',
        element: <OcrManifest />,
      },
    ],
  },
  {
    path: '/canvases/:id',
    element: <CanvasView />,
    children: [
      {
        index: true,
        element: <CanvasDetails />,
      },
      {
        path: '/canvases/:id/metadata',
        element: <EditCanvasMetadata />,
      },
      {
        path: '/canvases/:id/linking',
        element: <EditCanvasLinking />,
      },
      {
        path: '/canvases/:id/linking/:linkId',
        element: <ViewCanvasLinking />,
      },
      {
        path: '/canvases/:id/search',
        element: <CanvasSearchIndex />,
      },
      {
        path: '/canvases/:id/plaintext',
        element: <CanvasPlaintext />,
      },
      {
        path: '/canvases/:id/json',
        element: <CanvasJson />,
      },
      {
        path: '/canvases/:id/delete',
        element: <DeleteCanvas />,
      },
    ],
  },
  {
    path: '/projects/create',
    element: <NewProjectPage />,
  },
  {
    path: '/projects/create/:template+',
    element: <NewProjectFromTemplate />,
  },
  {
    path: '/projects',
    element: <ListProjects />,
  },
  {
    path: '/projects/:id',
    element: <Project />,
    children: [
      {
        index: true,
        element: <ProjectOverview />,
      },
      {
        path: '/projects/:id/metadata',
        element: <ProjectMetadata />,
      },
      {
        path: '/projects/:id/content',
        element: <ProjectContent />,
      },
      {
        path: '/projects/:id/configuration',
        element: <ProjectConfiguration />,
      },
      {
        path: '/projects/:id/model',
        element: <ProjectModelEditor />,
        children: [
          {
            index: true,
            element: <CaptureModelEditorHomepage />,
          },
          {
            path: '/projects/:id/model/document',
            element: <FullDocumentEditor />,
          },
          {
            path: '/projects/:id/model/structure',
            element: <FullStructureEditor />,
          },
          {
            path: '/projects/:id/model/style',
            element: <ChooseAnnotationStyle />,
          },
          {
            path: '/projects/:id/model/preview',
            element: <PreviewCaptureModel />,
          },
        ],
      },
      {
        path: '/projects/:id/search',
        element: <ProjectSearchIndex />,
      },
      {
        path: '/projects/:id/tasks',
        element: <ProjectTasks />,
      },
      {
        path: '/projects/:id/tasks/:taskId',
        element: <ProjectTasks />,
      },
      {
        path: '/projects/:id/activity',
        element: <ProjectStreams />,
      },
      {
        path: '/projects/:id/activity/:stream',
        element: <ProjectStreams />,
      },
      {
        path: '/projects/:id/export',
        element: <ProjectExportTab />,
      },
      {
        path: '/projects/:id/delete',
        element: <DeleteProject />,
      },
    ],
  },

  // To be organised
  {
    path: '/import/collection/create',
    element: <CreateCollection />,
  },
  {
    path: '/import/collection',
    element: <ImportCollection />,
  },
  {
    path: '/import/manifest',
    element: <CreateManifest />,
  },
  {
    path: '/capture-models',
    element: <CaptureModelList />,
  },
  {
    path: '/capture-models/:id',
    element: <CaptureModels />,
    children: [
      {
        path: '/capture-models/:id',
        element: <ViewCaptureModel />,
        children: [
          {
            index: true,
            element: <CaptureModelEditorHomepage />,
          },
          {
            path: '/capture-models/:id/document',
            element: <FullDocumentEditor />,
          },
          {
            path: '/capture-models/:id/structure',
            element: <FullStructureEditor />,
          },
          {
            path: '/capture-models/:id/preview',
            element: <PreviewCaptureModel />,
          },
        ],
      },
    ],
  },
  {
    path: '/tasks/:id',
    element: <TaskRouter />,
  },
  {
    path: '/enrichment/ocr',
    element: <OcrPage />,
    children: [
      {
        index: true,
        element: <OcrListPage />,
      },
      {
        path: '/enrichment/ocr/manifest/:id',
        element: <OcrManifest />,
      },
    ],
  },
  {
    path: '/enrichment/search-indexing',
    element: <SearchIndexingPage />,
  },

  // Export
  {
    path: '/export/site',
    element: <ExportSite />,
  },
  // Config
  {
    path: '/configure/site',
    element: <SiteConfiguration />,
  },
  {
    path: '/configure/site/metadata',
    element: <MetadataConfigurationPage />,
  },
  {
    path: '/configure/site/project',
    element: <SiteProjectConfiguration />,
  },
  {
    path: '/configure/site/system',
    element: <SiteSystemConfiguration />,
  },
  {
    path: '/page-blocks',
    element: <PageBlocks />,
    children: [
      {
        index: true,
        element: <ListPages />,
      },
      {
        path: '/page-blocks/new-page',
        element: <CreateNewPage />,
      },
    ],
  },
  {
    path: '/media',
    element: <Media />,
    children: [
      {
        index: true,
        element: <ListMedia />,
      },
      {
        path: '/media/:mediaId',
        element: <ViewMedia />,
      },
    ],
  },
  {
    path: '/i18n',
    element: <ConfigureLanguages />,
  },
  {
    path: '/i18n/edit/:code',
    element: <EditTranslation />,
  },
  {
    path: '/i18n/edit/:code/:namespace',
    element: <EditTranslation />,
  },
  {
    path: '/global/status',
    element: <SystemStatus />,
  },
  {
    path: '/global/config',
    element: <GlobalSystemConfig />,
  },
  {
    path: '/system/development',
    element: <DevelopmentPlugin />,
  },
  {
    path: '/system/reset',
    element: <KeyRegen />,
  },
  {
    path: '/system/plugins',
    element: <ListPlugins />,
  },
  {
    path: '/system/plugins/external/:owner/:repo',
    element: <ViewExternalPlugin />,
  },
  {
    path: '/system/themes',
    element: <ListThemes />,
  },
  {
    path: '/system/activity-streams',
    element: <ActivityStreams />,
  },
  {
    path: '/site/permissions',
    element: <SitePermissions />,
  },
  {
    path: '/site/details',
    element: <SiteName />,
  },
  {
    path: '/site/invitations',
    element: <ListInvitations />,
  },
  {
    path: '/site/invitations/create',
    element: <CreateInvitation />,
  },
  {
    path: '/site/invitations/:invitationId',
    element: <ViewInvitation />,
  },

  // Only global admins
  {
    path: '/global/sites',
    element: <ListSites />,
  },
  {
    path: '/global/sites/create',
    element: <CreateSite />,
  },
  {
    path: '/global/users',
    element: <ListUsers />,
  },
  {
    path: '/global/users/create',
    element: <CreateUser />,
  },
  {
    path: '/global/api-keys',
    element: <ListApiKeys />,
  },
  {
    path: '/global/api-keys/create',
    element: <GenerateApiKey />,
  },
  {
    path: '/global/users/:userId',
    element: <ViewUser />,
    children: [
      {
        index: true,
        element: <UserOverview />,
      },
      {
        path: '/global/users/:userId/edit',
        element: <UserUpdateDetails />,
      },
      {
        path: '/global/users/:userId/sites',
        element: <UserSites />,
      },
      {
        path: '/global/users/:userId/delete',
        element: <UserDelete />,
      },
      {
        path: '/global/users/:userId/password',
        element: <UserResetPassword />,
      },
    ],
  },
];
