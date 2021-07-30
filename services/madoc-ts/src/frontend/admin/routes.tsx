import { UniversalRoute } from '../types';
import { CanvasPlaintext } from './pages/content/canvases/canvas-plaintext';
import { CanvasSearchIndex } from './pages/content/canvases/canvas-search-index';
import { CollectionView } from './pages/content/collections/collection';
import { CollectionSearchIndex } from './pages/content/collections/collection-search-index';
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
import { SiteConfiguration } from './pages/content/site-configuration';
import { ProjectConfiguration } from './pages/crowdsourcing/projects/project-configuration';
import { ProjectSearchIndex } from './pages/crowdsourcing/projects/project-search-index';
import { ProjectStreams } from './pages/crowdsourcing/projects/project-streams';
import { OcrListPage } from './pages/enrichment/ocr/ocr-list';
import { SearchIndexingPage } from './pages/enrichment/search-indexing';
import { ExportSite } from './pages/export/export-site';
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
import { DevelopmentPlugin } from './pages/system/development-plugin';
import { ActivityStreams } from './pages/system/activity-streams';
import { ViewExternalPlugin } from './pages/system/external-plugin';
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

export const routes: UniversalRoute[] = [
  {
    path: '/',
    exact: true,
    component: Homepage,
  },
  {
    path: '/collections',
    exact: true,
    component: CollectionList,
  },
  {
    path: '/collections/:id',
    component: CollectionView,
    routes: [
      {
        path: '/collections/:id',
        exact: true,
        component: CollectionManifests,
      },
      {
        path: '/collections/:id/structure',
        exact: true,
        component: EditCollectionStructure,
      },
      {
        path: '/collections/:id/metadata',
        exact: true,
        component: EditCollectionMetadata,
      },
      {
        path: '/collections/:id/delete',
        exact: true,
        component: DeleteCollection,
      },
      {
        path: '/collections/:id/projects',
        exact: true,
        component: CollectionProjects,
      },
      {
        path: '/collections/:id/search',
        exact: true,
        component: CollectionSearchIndex,
      },
    ],
  },
  {
    path: '/manifests',
    exact: true,
    component: ManifestList,
  },
  {
    path: '/manifests/:manifestId/canvases/:id',
    component: CanvasView,
    routes: [
      {
        path: '/manifests/:manifestId/canvases/:id',
        exact: true,
        component: CanvasDetails,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/metadata',
        exact: true,
        component: EditCanvasMetadata,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/linking',
        exact: true,
        component: EditCanvasLinking,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/linking/:linkId',
        exact: true,
        component: ViewCanvasLinking,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/search',
        exact: true,
        component: CanvasSearchIndex,
      },
      {
        path: '/manifests/:manifestId/canvases/:id/plaintext',
        exact: true,
        component: CanvasPlaintext,
      },
      {
        path: '/manifests/:maifestId/canvases/:id/delete',
        exact: true,
        component: DeleteCanvas,
      },
    ],
  },
  {
    path: '/manifests/:id',
    component: ManifestView,
    routes: [
      {
        path: '/manifests/:id',
        exact: true,
        component: ManifestCanvases,
      },
      {
        path: '/manifests/:id/metadata',
        exact: true,
        component: EditManifestMetadata,
      },
      {
        path: '/manifests/:id/structure',
        exact: true,
        component: EditManifestStructure,
      },
      {
        path: '/manifests/:id/linking',
        exact: true,
        component: EditManifestLinking,
      },
      {
        path: '/manifests/:id/projects',
        exact: true,
        component: ManifestProjects,
      },
      {
        path: '/manifests/:id/collections',
        exact: true,
        component: ManifestCollections,
      },
      {
        path: '/manifests/:id/delete',
        exact: true,
        component: DeleteManifest,
      },
      {
        path: '/manifests/:id/search',
        exact: true,
        component: ManifestSearchIndex,
      },
      {
        path: '/manifests/:id/ocr',
        exact: true,
        component: OcrManifest,
      },
    ],
  },
  {
    path: '/canvases/:id',
    component: CanvasView,
    routes: [
      {
        path: '/canvases/:id',
        exact: true,
        component: CanvasDetails,
      },
      {
        path: '/canvases/:id/metadata',
        exact: true,
        component: EditCanvasMetadata,
      },
      {
        path: '/canvases/:id/linking',
        exact: true,
        component: EditCanvasLinking,
      },
      {
        path: '/canvases/:id/linking/:linkId',
        exact: true,
        component: ViewCanvasLinking,
      },
      {
        path: '/canvases/:id/search',
        exact: true,
        component: CanvasSearchIndex,
      },
      {
        path: '/canvases/:id/plaintext',
        exact: true,
        component: CanvasPlaintext,
      },
      {
        path: '/canvases/:id/delete',
        exact: true,
        component: DeleteCanvas,
      },
    ],
  },
  {
    path: '/projects/create',
    exact: true,
    component: NewProjectPage,
  },
  {
    path: '/projects',
    exact: true,
    component: ListProjects,
  },
  {
    path: '/projects/:id',
    component: Project,
    routes: [
      {
        path: '/projects/:id',
        exact: true,
        component: ProjectOverview,
      },
      {
        path: '/projects/:id/metadata',
        exact: true,
        component: ProjectMetadata,
      },
      {
        path: '/projects/:id/content',
        exact: true,
        component: ProjectContent,
      },
      {
        path: '/projects/:id/configuration',
        exact: true,
        component: ProjectConfiguration,
      },
      {
        path: '/projects/:id/model',
        component: ProjectModelEditor,
        routes: [
          {
            path: '/projects/:id/model',
            component: CaptureModelEditorHomepage,
            exact: true,
          },
          {
            path: '/projects/:id/model/document',
            component: FullDocumentEditor,
            exact: true,
          },
          {
            path: '/projects/:id/model/structure',
            component: FullStructureEditor,
            exact: true,
          },
          {
            path: '/projects/:id/model/preview',
            component: PreviewCaptureModel,
            exact: true,
          },
        ],
      },
      {
        path: '/projects/:id/search',
        component: ProjectSearchIndex,
        exact: true,
      },
      {
        path: '/projects/:id/tasks',
        component: ProjectTasks,
        exact: true,
      },
      {
        path: '/projects/:id/tasks/:taskId',
        component: ProjectTasks,
        exact: true,
      },
      {
        path: '/projects/:id/activity',
        component: ProjectStreams,
        exact: true,
      },
      {
        path: '/projects/:id/activity/:stream',
        component: ProjectStreams,
        exact: true,
      },
      {
        path: '/projects/:id/delete',
        component: DeleteProject,
        exact: true,
      },
    ],
  },

  // To be organised
  {
    path: '/import/collection',
    exact: true,
    component: CreateCollection,
  },
  {
    path: '/import/manifest',
    exact: true,
    component: CreateManifest,
  },
  {
    path: '/capture-models',
    component: CaptureModelList,
    exact: true,
  },
  {
    path: '/capture-models/:id',
    component: CaptureModels,
    routes: [
      {
        path: '/capture-models/:id',
        component: ViewCaptureModel,
        routes: [
          {
            path: '/capture-models/:id',
            component: CaptureModelEditorHomepage,
            exact: true,
          },
          {
            path: '/capture-models/:id/document',
            component: FullDocumentEditor,
            exact: true,
          },
          {
            path: '/capture-models/:id/structure',
            component: FullStructureEditor,
            exact: true,
          },
          {
            path: '/capture-models/:id/preview',
            component: PreviewCaptureModel,
            exact: true,
          },
        ],
      },
    ],
  },
  {
    path: '/tasks/:id',
    exact: true,
    component: TaskRouter,
  },
  {
    path: '/enrichment/ocr',
    component: OcrPage,
    routes: [
      {
        path: '/enrichment/ocr',
        exact: true,
        component: OcrListPage,
      },
      {
        path: '/enrichment/ocr/manifest/:id',
        exact: true,
        component: OcrManifest,
      },
    ],
  },
  {
    path: '/enrichment/search-indexing',
    component: SearchIndexingPage,
    exact: true,
  },

  // Export
  {
    path: '/export/site',
    exact: true,
    component: ExportSite,
  },
  // Config
  {
    path: '/configure/site',
    exact: true,
    component: SiteConfiguration,
  },
  {
    path: '/configure/site/metadata',
    exact: true,
    component: MetadataConfigurationPage,
  },
  {
    path: '/page-blocks',
    component: PageBlocks,
    routes: [
      {
        path: '/page-blocks',
        exact: true,
        component: ListPages,
      },
      {
        path: '/page-blocks/new-page',
        exact: true,
        component: CreateNewPage,
      },
    ],
  },
  {
    path: '/media',
    component: Media,
    routes: [
      {
        path: '/media',
        exact: true,
        component: ListMedia,
      },
      {
        path: '/media/:mediaId',
        exact: true,
        component: ViewMedia,
      },
    ],
  },
  {
    path: '/i18n',
    exact: true,
    component: ConfigureLanguages,
  },
  {
    path: '/i18n/edit/:code',
    exact: true,
    component: EditTranslation,
  },
  {
    path: '/system/status',
    exact: true,
    component: SystemStatus,
  },
  {
    path: '/system/development',
    exact: true,
    component: DevelopmentPlugin,
  },
  {
    path: '/system/plugins',
    exact: true,
    component: ListPlugins,
  },
  {
    path: '/system/plugins/external/:owner/:repo',
    exact: true,
    component: ViewExternalPlugin,
  },
  {
    path: '/system/themes',
    exact: true,
    component: ListThemes,
  },
  {
    path: '/system/activity-streams',
    exact: true,
    component: ActivityStreams,
  },
];
