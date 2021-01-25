import { UniversalRoute } from '../types';

type BaseRouteComponents = typeof import('./components');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RouteComponents extends BaseRouteComponents {}

export function createRoutes(components: RouteComponents): UniversalRoute[] {
  // const components = hookComponents(inputComponents);

  const routes = [
    {
      path: '/collections',
      exact: true,
      component: components.CollectionListLoader,
      routes: [
        {
          path: '/collections',
          component: components.AllCollections,
          exact: true,
        },
      ],
    },
    {
      path: '/collections/:collectionId',
      component: components.CollectionLoader,
      routes: [
        {
          path: '/collections/:collectionId',
          exact: true,
          component: components.ViewCollection,
        },
        {
          path: '/collections/:collectionId/manifests/:manifestId',
          component: components.ManifestLoader,
          routes: [
            {
              path: '/collections/:collectionId/manifests/:manifestId',
              exact: true,
              component: components.ViewManifest,
            },
            {
              path: '/collections/:collectionId/manifests/:manifestId/mirador',
              exact: true,
              component: components.ViewManifestMirador,
            },
            {
              path: '/collections/:collectionId/manifests/:manifestId/c/:canvasId',
              component: components.CanvasLoader,
              routes: [
                {
                  path: '/collections/:collectionId/manifests/:manifestId/c/:canvasId',
                  exact: true,
                  component: components.ViewCanvas,
                },
                {
                  path: '/collections/:collectionId/manifests/:manifestId/c/:canvasId/model',
                  exact: true,
                  component: components.ViewCanvasModel,
                },
              ],
            },
          ],
        },
      ],
    },
    {
      path: '/manifests',
      component: components.ManifestListLoader,
      exact: true,
      routes: [
        {
          path: '/manifests',
          component: components.AllManifests,
          exact: true,
        },
      ],
    },
    {
      path: '/manifests/:manifestId',
      component: components.ManifestLoader,
      routes: [
        {
          path: '/manifests/:manifestId',
          exact: true,
          component: components.ViewManifest,
        },
        {
          path: '/manifests/:manifestId/mirador',
          exact: true,
          component: components.ViewManifestMirador,
        },
        {
          path: '/manifests/:manifestId/c/:canvasId',
          component: components.CanvasLoader,
          routes: [
            {
              path: '/manifests/:manifestId/c/:canvasId',
              exact: true,
              component: components.ViewCanvas,
            },
            {
              path: '/manifests/:manifestId/c/:canvasId/model',
              exact: true,
              component: components.ViewCanvasModel,
            },
          ],
        },
      ],
    },
    {
      path: '/projects',
      component: components.ProjectListLoader,
      exact: true,
      routes: [
        {
          path: '/projects',
          component: components.AllProjects,
          exact: true,
        },
      ],
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
          component: components.CollectionListLoader,
          routes: [
            {
              path: '/projects/:slug/collections',
              exact: true,
              component: components.AllCollections,
            },
          ],
        },
        {
          path: '/projects/:slug/collections/:collectionId',
          component: components.CollectionLoader,
          routes: [
            {
              path: '/projects/:slug/collections/:collectionId',
              exact: true,
              component: components.ViewCollection,
            },
            {
              path: '/projects/:slug/collections/:collectionId/manifests/:manifestId',
              component: components.ManifestLoader,
              routes: [
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId',
                  exact: true,
                  component: components.ViewManifest,
                },
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/mirador',
                  exact: true,
                  component: components.ViewManifestMirador,
                },
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/c/:canvasId',
                  component: components.CanvasLoader,
                  routes: [
                    {
                      path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/c/:canvasId',
                      exact: true,
                      component: components.ViewCanvas,
                    },
                    {
                      path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/c/:canvasId/model',
                      exact: true,
                      component: components.ViewCanvasModel,
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          path: '/projects/:slug/manifests',
          component: components.ManifestListLoader,
          exact: true,
          routes: [
            {
              path: '/projects/:slug/manifests',
              component: components.AllManifests,
              exact: true,
            },
          ],
        },
        {
          path: '/projects/:slug/manifests/:manifestId',
          component: components.ManifestLoader,
          routes: [
            {
              path: '/projects/:slug/manifests/:manifestId',
              exact: true,
              component: components.ViewManifest,
            },
            {
              path: '/projects/:slug/manifests/:manifestId/mirador',
              exact: true,
              component: components.ViewManifestMirador,
            },
            {
              path: '/projects/:slug/manifests/:manifestId/c/:canvasId',
              component: components.CanvasLoader,
              routes: [
                {
                  path: '/projects/:slug/manifests/:manifestId/c/:canvasId',
                  exact: true,
                  component: components.ViewCanvas,
                },
                {
                  path: '/projects/:slug/manifests/:manifestId/c/:canvasId/model',
                  exact: true,
                  component: components.ViewCanvasModel,
                },
              ],
            },
          ],
        },
        {
          path: '/projects/:slug/tasks',
          exact: true,
          component: components.AllTasks,
        },
        {
          path: '/projects/:slug/tasks/:taskId',
          component: components.TaskLoader,
          routes: [
            {
              path: '/projects/:slug/tasks/:taskId',
              exact: true,
              component: components.ViewTask,
            },
            {
              path: '/projects/:slug/tasks/:parentTaskId/subtasks/:taskId',
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
      path: '/tasks/:taskId',
      component: components.TaskLoader,
      routes: [
        {
          path: '/tasks/:taskId',
          exact: true,
          component: components.ViewTask,
        },
        {
          path: '/tasks/:parentTaskId/subtasks/:taskId',
          exact: true,
          component: components.ViewTask,
        },
      ],
    },
    {
      path: '/users/:id',
      exact: true,
      component: components.ViewUser,
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

  return [
    {
      path: '/',
      exact: false,
      routes: routes,
      component: components.RootLoader,
    },
  ];
}
