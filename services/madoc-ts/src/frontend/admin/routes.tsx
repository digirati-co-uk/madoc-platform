import { UniversalRoute } from '../types';
import { CollectionView } from './pages/content/collections/collection';
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
import { NewProjectPage } from './pages/crowdsourcing/projects/new-project';
import { ListProjects } from './pages/crowdsourcing/projects/list-projects';
import { Project } from './pages/crowdsourcing/projects/project';
import { ProjectModelEditor } from './pages/crowdsourcing/projects/project-model-editor';
import { CreateCollection } from './pages/content/collections/create-collection';
import { CreateManifest } from './pages/content/manifests/create-manifest';
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
    ],
  },
  {
    path: '/manifests',
    exact: true,
    component: ManifestList,
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
        ],
      },
      {
        path: '/manifests/:id/projects',
        exact: true,
        component: ManifestProjects,
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
        path: '/projects/:id/tasks',
        component: ProjectTasks,
        exact: true,
      },
      {
        path: '/projects/:id/tasks/:taskId',
        component: ProjectTasks,
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
];
