import React from 'react';
import { CreateRouteType } from '../types';

type BaseRouteComponents = typeof import('./components');
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface RouteComponents extends BaseRouteComponents {}

export function createRoutes(Components: RouteComponents): CreateRouteType {
  const routes = [
    {
      path: '/madoc/*',
      exact: true,
      element: <Components.RedirectPage />,
    },
    {
      path: '/collections',
      exact: true,
      element: <Components.PageLoader />,
      children: [
        {
          path: '/collections',
          element: <Components.CollectionListLoader />,
          children: [
            {
              index: true,
              element: <Components.AllCollections />,
            },
          ],
        },
      ],
    },
    {
      path: '/collections/:collectionId',
      element: <Components.CollectionLoader />,
      children: [
        {
          path: '/collections/:collectionId',
          exact: true,
          element: <Components.ViewCollection />,
        },
        {
          path: '/collections/:collectionId/search',
          exact: true,
          element: <Components.Search />,
        },
        {
          path: '/collections/:collectionId/metadata/edit',
          exact: true,
          element: <Components.SuggestMetadata />,
        },
        {
          path: '/collections/:collectionId/manifests/:manifestId',
          element: <Components.ManifestLoader />,
          children: [
            {
              path: '/collections/:collectionId/manifests/:manifestId',
              exact: true,
              element: <Components.ViewManifest />,
            },
            {
              path: '/collections/:collectionId/manifests/:manifestId/search',
              exact: true,
              element: <Components.Search />,
            },
            {
              path: '/collections/:collectionId/manifests/:manifestId/metadata/edit',
              exact: true,
              element: <Components.SuggestMetadata />,
            },
            {
              path: '/collections/:collectionId/manifests/:manifestId/mirador',
              exact: true,
              element: <Components.ViewManifestMirador />,
            },
            {
              path: '/collections/:collectionId/manifests/:manifestId/uv',
              exact: true,
              element: <Components.ViewManifestUV />,
            },
            {
              path: '/collections/:collectionId/manifests/:manifestId/c/:canvasId',
              element: <Components.CanvasLoader />,
              children: [
                {
                  path: '/collections/:collectionId/manifests/:manifestId/c/:canvasId',
                  exact: true,
                  element: <Components.ViewCanvas />,
                },
                {
                  path: '/collections/:collectionId/manifests/:manifestId/c/:canvasId/model',
                  exact: true,
                  element: <Components.ViewCanvasModel />,
                },
                {
                  path: '/collections/:collectionId/manifests/:manifestId/c/:canvasId/metadata/edit',
                  exact: true,
                  element: <Components.SuggestMetadata />,
                },
                {
                  path: '*',
                  element: <Components.PageLoader />,
                  children: [
                    {
                      path: '*',
                      element: <Components.ViewPage />,
                    },
                  ],
                },
              ],
            },
            {
              path: '*',
              element: <Components.PageLoader />,
              children: [
                {
                  path: '*',
                  element: <Components.ViewPage />,
                },
              ],
            },
          ],
        },
        {
          path: '*',
          element: <Components.PageLoader />,
          children: [
            {
              path: '*',
              element: <Components.ViewPage />,
            },
          ],
        },
      ],
    },
    {
      path: '/manifests',
      element: <Components.PageLoader />,
      children: [
        {
          path: '/manifests',
          element: <Components.ManifestListLoader />,
          children: [
            {
              index: true,
              element: <Components.AllManifests />,
            },
          ],
        },
      ],
    },
    {
      path: '/manifests/:manifestId',
      element: <Components.ManifestLoader />,
      children: [
        {
          path: '/manifests/:manifestId',
          exact: true,
          element: <Components.ViewManifest />,
        },
        {
          path: '/manifests/:manifestId/search',
          exact: true,
          element: <Components.Search />,
        },
        {
          path: '/manifests/:manifestId/metadata/edit',
          exact: true,
          element: <Components.SuggestMetadata />,
        },
        {
          path: '/manifests/:manifestId/mirador',
          exact: true,
          element: <Components.ViewManifestMirador />,
        },
        {
          path: '/manifests/:manifestId/uv',
          exact: true,
          element: <Components.ViewManifestUV />,
        },
        {
          path: '/manifests/:manifestId/c/:canvasId',
          element: <Components.CanvasLoader />,
          children: [
            {
              path: '/manifests/:manifestId/c/:canvasId',
              exact: true,
              element: <Components.ViewCanvas />,
            },
            {
              path: '/manifests/:manifestId/c/:canvasId/model',
              exact: true,
              element: <Components.ViewCanvasModel />,
            },
            {
              path: '/manifests/:manifestId/c/:canvasId/metadata/edit',
              exact: true,
              element: <Components.SuggestMetadata />,
            },
            {
              path: '*',
              element: <Components.PageLoader />,
              children: [
                {
                  path: '*',
                  element: <Components.ViewPage />,
                },
              ],
            },
          ],
        },
        {
          path: '*',
          element: <Components.PageLoader />,
          children: [
            {
              path: '*',
              element: <Components.ViewPage />,
            },
          ],
        },
      ],
    },
    {
      path: '/projects',
      element: <Components.PageLoader />,
      children: [
        {
          path: '/projects',
          element: <Components.ProjectListLoader />,
          children: [
            {
              index: true,
              element: <Components.AllProjects />,
            },
          ],
        },
      ],
    },
    {
      path: '/projects/:slug',
      element: <Components.ProjectLoader />,
      children: [
        {
          path: '/projects/:slug',
          exact: true,
          element: <Components.ViewProject />,
        },
        {
          path: '/projects/:slug/task-overview',
          exact: true,
          element: <Components.ViewProjectTasks />,
        },
        {
          path: '/projects/:slug/personal-notes',
          exact: true,
          element: <Components.ViewProjectNotes />,
        },
        {
          path: '/projects/:slug/search',
          exact: true,
          element: <Components.Search />,
        },
        {
          path: '/projects/:slug/collections',
          exact: true,
          element: <Components.CollectionListLoader />,
          children: [
            {
              path: '/projects/:slug/collections',
              exact: true,
              element: <Components.AllCollections />,
            },
          ],
        },
        {
          path: '/projects/:slug/collections/:collectionId',
          element: <Components.CollectionLoader />,
          children: [
            {
              path: '/projects/:slug/collections/:collectionId',
              exact: true,
              element: <Components.ViewCollection />,
            },
            {
              path: '/projects/:slug/collections/:collectionId/search',
              exact: true,
              element: <Components.Search />,
            },
            {
              path: '/projects/:slug/collections/:collectionId/metadata/edit',
              exact: true,
              element: <Components.SuggestMetadata />,
            },
            {
              path: '/projects/:slug/collections/:collectionId/manifests/:manifestId',
              element: <Components.ManifestLoader />,
              children: [
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId',
                  exact: true,
                  element: <Components.ViewManifest />,
                },
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/search',
                  exact: true,
                  element: <Components.Search />,
                },
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/metadata/edit',
                  exact: true,
                  element: <Components.SuggestMetadata />,
                },
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/mirador',
                  exact: true,
                  element: <Components.ViewManifestMirador />,
                },
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/model',
                  exact: true,
                  element: <Components.ViewManifestModel />,
                },
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/uv',
                  exact: true,
                  element: <Components.ViewManifestUV />,
                },
                {
                  path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/c/:canvasId',
                  element: <Components.CanvasLoader />,
                  children: [
                    {
                      path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/c/:canvasId',
                      exact: true,
                      element: <Components.ViewCanvas />,
                    },
                    {
                      path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/c/:canvasId/model',
                      exact: true,
                      element: <Components.ViewCanvasModel />,
                    },
                    {
                      path: '/projects/:slug/collections/:collectionId/manifests/:manifestId/c/:canvasId/metadata/edit',
                      exact: true,
                      element: <Components.SuggestMetadata />,
                    },
                    {
                      path: '*',
                      element: <Components.PageLoader />,
                      children: [
                        {
                          path: '*',
                          element: <Components.ViewPage />,
                        },
                      ],
                    },
                  ],
                },
                {
                  path: '*',
                  element: <Components.PageLoader />,
                  children: [
                    {
                      path: '*',
                      element: <Components.ViewPage />,
                    },
                  ],
                },
              ],
            },
            {
              path: '*',
              element: <Components.PageLoader />,
              children: [
                {
                  path: '*',
                  element: <Components.ViewPage />,
                },
              ],
            },
          ],
        },
        {
          path: '/projects/:slug/manifests',
          element: <Components.ManifestListLoader />,
          exact: true,
          children: [
            {
              path: '/projects/:slug/manifests',
              element: <Components.AllManifests />,
              exact: true,
            },
          ],
        },
        {
          path: '/projects/:slug/manifests/:manifestId',
          element: <Components.ManifestLoader />,
          children: [
            {
              path: '/projects/:slug/manifests/:manifestId',
              exact: true,
              element: <Components.ViewManifest />,
            },
            {
              path: '/projects/:slug/manifests/:manifestId/search',
              exact: true,
              element: <Components.Search />,
            },
            {
              path: '/projects/:slug/manifests/:manifestId/metadata/edit',
              exact: true,
              element: <Components.SuggestMetadata />,
            },
            {
              path: '/projects/:slug/manifests/:manifestId/mirador',
              exact: true,
              element: <Components.ViewManifestMirador />,
            },
            {
              path: '/projects/:slug/manifests/:manifestId/model',
              exact: true,
              element: <Components.ViewManifestModel />,
            },
            {
              path: '/projects/:slug/manifests/:manifestId/c/:canvasId',
              element: <Components.CanvasLoader />,
              children: [
                {
                  path: '/projects/:slug/manifests/:manifestId/c/:canvasId',
                  exact: true,
                  element: <Components.ViewCanvas />,
                },
                {
                  path: '/projects/:slug/manifests/:manifestId/c/:canvasId/model',
                  exact: true,
                  element: <Components.ViewCanvasModel />,
                },
                {
                  path: '/projects/:slug/manifests/:manifestId/c/:canvasId/metadata/edit',
                  exact: true,
                  element: <Components.SuggestMetadata />,
                },
                {
                  path: '*',
                  element: <Components.PageLoader />,
                  children: [
                    {
                      path: '*',
                      element: <Components.ViewPage />,
                    },
                  ],
                },
              ],
            },
            {
              path: '*',
              element: <Components.PageLoader />,
              children: [
                {
                  path: '*',
                  element: <Components.ViewPage />,
                },
              ],
            },
          ],
        },
        {
          path: '/projects/:slug/reviews',
          element: <Components.ReviewListingPage />,
          exact: true,
        },
        {
          path: '/projects/:slug/reviews/:taskId',
          element: <Components.ReviewListingPage />,
          children: [
            {
              path: '/projects/:slug/reviews/:taskId',
              element: <Components.TaskLoader />,
              children: [
                {
                  index: true,
                  element: <Components.SingleReview />,
                },
              ],
            },
          ],
        },
        {
          path: '/projects/:slug/tasks',
          element: <Components.AllTasks />,
          exact: true,
        },
        {
          path: '/projects/:slug/tasks/:taskId',
          element: <Components.AllTasks />,
          children: [
            {
              path: '/projects/:slug/tasks/:taskId',
              element: <Components.TaskLoader />,
              children: [
                {
                  index: true,
                  exact: true,
                  element: <Components.ViewTask />,
                },
                {
                  path: 'subtasks/:childTaskId',
                  exact: true,
                  element: <Components.ViewTask />,
                },
              ],
            },
          ],
        },
        {
          path: '*',
          element: <Components.PageLoader />,
          children: [
            {
              path: '*',
              element: <Components.ViewPage />,
            },
          ],
        },
      ],
    },
    {
      path: '/tasks',
      element: <Components.AllTasks />,
      exact: true,
    },
    {
      path: '/tasks/:taskId',
      element: <Components.AllTasks />,
      children: [
        {
          path: '/tasks/:taskId',
          element: <Components.TaskLoader />,
          children: [
            {
              index: true,
              element: <Components.ViewTask />,
            },
            {
              path: 'subtasks/:childTaskId',
              element: <Components.ViewTask />,
            },
          ],
        },
      ],
    },
    {
      path: '/users/:id',
      exact: true,
      element: <Components.ViewUser />,
    },
    {
      path: '/search',
      exact: true,
      element: <Components.Search />,
    },
    {
      path: '/dashboard',
      element: <Components.UserHomepage />,
      children: [
        {
          path: '/dashboard',
          exact: true,
          element: <Components.UserDashboard />,
        },
        {
          path: '/dashboard/contributions',
          exact: true,
          element: <Components.UserContributions />,
        },
        {
          path: '/dashboard/my-sites',
          exact: true,
          element: <Components.MySites />,
        },
        {
          path: '/dashboard/reviews',
          exact: true,
          element: <Components.UserReviews />,
        },
        {
          path: '/dashboard',
          // Fallback here.
          element: <Components.UserDashboard />,
        },
      ],
    },
    {
      path: '/',
      element: <Components.PageLoader />,
      children: [
        {
          path: '/',
          element: <Components.Homepage />,
        },
      ],
    },
    {
      path: '/login',
      exact: true,
      element: <Components.LoginPage />,
    },
    {
      path: '/forgot-password',
      exact: true,
      element: <Components.ForgotPasswordPage />,
    },
    {
      path: '/activate-account',
      exact: true,
      element: <Components.ResetPassword />,
    },
    {
      path: '/reset-password',
      exact: true,
      element: <Components.ResetPassword />,
    },
    {
      path: '/register',
      exact: true,
      element: <Components.Register />,
    },
    {
      path: '/profile',
      exact: true,
      element: <Components.ProfilePage />,
    },
    {
      path: '/profile/password',
      exact: true,
      element: <Components.UpdatePasswordPage />,
    },
  ];

  return {
    baseRoute: {
      path: '/',
      element: <Components.RootLoader />,
    },
    fallback: {
      path: '*',
      element: <Components.PageLoader />,
      children: [
        {
          path: '*',
          element: <Components.ViewPage />,
        },
      ],
    },
    routes: routes,
  };
}
