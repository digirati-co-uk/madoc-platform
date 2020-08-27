import { UniversalRoute } from '../types';

type BaseRouteComponents = typeof import('./components');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RouteComponents extends BaseRouteComponents {}

export function createRoutes(components: RouteComponents): UniversalRoute[] {
  // const components = hookComponents(inputComponents);

  const routes = [
    {
      path: '/collections',
      component: components.AllCollections,
      exact: true,
    },
    {
      path: '/collections/:id',
      component: components.CollectionLoader,
      routes: [
        {
          path: '/collections/:id',
          exact: true,
          component: components.ViewCollection,
        },
        {
          path: '/collections/:collectionId/manifests/:id',
          component: components.ManifestLoader,
          routes: [
            {
              path: '/collections/:collectionId/manifests/:id',
              exact: true,
              component: components.ViewManifest,
            },
            {
              path: '/collections/:collectionId/manifests/:manifestId/c/:id',
              exact: true,
              component: components.ViewCanvas,
            },
            {
              path: '/collections/:collectionId/manifests/:manifestId/c/:id/model',
              exact: true,
              component: components.ViewCanvasModel,
            },
          ],
        },
      ],
    },
    {
      path: '/manifests',
      component: components.AllManifests,
      exact: true,
    },
    {
      path: '/manifests/:id',
      component: components.ManifestLoader,
      routes: [
        {
          path: '/manifests/:id',
          exact: true,
          component: components.ViewManifest,
        },
        {
          path: '/manifests/:id/mirador',
          exact: true,
          component: components.ViewManifestMirador,
        },
        {
          path: '/manifests/:manifestId/c/:id',
          exact: true,
          component: components.ViewCanvas,
        },
        {
          path: '/manifests/:manifestId/c/:id/model',
          exact: true,
          component: components.ViewCanvasModel,
        },
      ],
    },
    {
      path: '/projects',
      component: components.AllProjects,
      exact: true,
    },
    {
      path: '/projects/:slug',
      component: components.ProjectLoader,
      routes: [
        {
          path: '/projects/:slug',
          exact: true,
          component: components.ViewProject,
        },
        {
          path: '/projects/:slug/collections',
          exact: true,
          component: components.AllCollections,
        },
        {
          path: '/projects/:slug/collections/:id',
          component: components.CollectionLoader,
          routes: [
            {
              path: '/projects/:slug/collections/:id',
              exact: true,
              component: components.ViewCollection,
            },
            {
              path: '/projects/:slug/collections/:collectionId/manifests/:id',
              component: components.ManifestLoader,
              routes: [
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:id',
                  exact: true,
                  component: components.ViewManifest,
                },
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/c/:id',
                  exact: true,
                  component: components.ViewCanvas,
                },
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/c/:id/model',
                  exact: true,
                  component: components.ViewCanvasModel,
                },
              ],
            },
          ],
        },
        {
          path: '/projects/:slug/manifests',
          component: components.AllManifests,
          exact: true,
        },
        {
          path: '/projects/:slug/manifests/:id',
          component: components.ManifestLoader,
          routes: [
            {
              path: '/projects/:slug/manifests/:id',
              exact: true,
              component: components.ViewManifest,
            },
            {
              path: '/projects/:slug/manifests/:manifestId/c/:id',
              exact: true,
              component: components.ViewCanvas,
            },
            {
              path: '/projects/:slug/manifests/:manifestId/c/:id/model',
              exact: true,
              component: components.ViewCanvasModel,
            },
          ],
        },
        {
          path: '/projects/:slug/tasks',
          exact: true,
          component: components.AllTasks,
        },
        {
          path: '/projects/:slug/tasks/:id',
          component: components.TaskLoader,
          routes: [
            {
              path: '/projects/:slug/tasks/:id',
              exact: true,
              component: components.ViewTask,
            },
            {
              path: '/projects/:slug/tasks/:parentId/subtasks/:id',
              exact: true,
              component: components.ViewTask,
            },
          ],
        },
      ],
    },
    {
      path: '/tasks',
      exact: true,
      component: components.AllTasks,
    },
    {
      path: '/tasks/:id',
      component: components.TaskLoader,
      routes: [
        {
          path: '/tasks/:id',
          exact: true,
          component: components.ViewTask,
        },
        {
          path: '/tasks/:parentId/subtasks/:id',
          exact: true,
          component: components.ViewTask,
        },
      ],
    },
    {
      path: '/topics',
      exact: true,
      component: components.AllTopicTypes,
    },
    {
      path: '/topics/:type',
      exact: true,
      component: components.ViewTopicType,
    },
    {
      path: '/topics/:type/:topic',
      exact: true,
      component: components.ViewTopic,
    },
    {
      path: '/search',
      exact: true,
      component: components.Search,
    },
    {
      path: '/',
      exact: true,
      component: components.UserHomepage,
    },
  ];

  // hookRoutes(routes);

  return routes;
}
