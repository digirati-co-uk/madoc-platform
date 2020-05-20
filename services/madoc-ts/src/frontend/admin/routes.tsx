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
import { CreateCollection } from './pages/content/collections/create-collection';
import { CreateManifest } from './pages/content/manifests/create-manifest';
import { TaskRouter } from './pages/tasks/task-router';

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
        ]
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
    path: '/tasks/:id',
    exact: true,
    component: TaskRouter,
  },
];
