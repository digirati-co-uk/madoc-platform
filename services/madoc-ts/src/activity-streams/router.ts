import { RouteWithParams, TypedRouter } from '../utility/typed-router';
import { getActivityStream } from './routes/get-activity-stream';
import { getActivityStreamPage } from './routes/get-activity-stream-page';
import { postActivity } from './routes/post-activity';

// create: 'Create',
//   update: 'Update',
//   delete: 'Delete',
//   move: 'Move',
//   add: 'Add',
//   remove: 'Remove',
export const router: Record<keyof any, RouteWithParams<any>> = {
  'activity-get-primary-stream': [TypedRouter.GET, '/api/madoc/activity/:primaryStream/changes', getActivityStream],
  'activity-get-primary-stream-page': [
    TypedRouter.GET,
    '/api/madoc/activity/:primaryStream/page/:page',
    getActivityStreamPage,
  ],

  'activity-get-secondary-stream': [
    TypedRouter.GET,
    '/api/madoc/activity/:primaryStream/stream/:secondaryStream/changes',
    getActivityStream,
  ],
  'activity-get-secondary-stream-page': [
    TypedRouter.GET,
    '/api/madoc/activity/:primaryStream/stream/:secondaryStream/page/:page',
    getActivityStreamPage,
  ],

  'activity-item-create-primary': [TypedRouter.POST, '/api/madoc/activity/:primaryStream/action/:action', postActivity],
  'activity-item-create-secondary': [
    TypedRouter.POST,
    '/api/madoc/activity/:primaryStream/stream/:secondaryStream/action/:action',
    postActivity,
  ],

  // Site routes for public activity.
  'site-get-primary-stream': [TypedRouter.GET, '/s/:slug/madoc/api/activity/:primaryStream/changes', getActivityStream],
  'site-get-primary-stream-page': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/activity/:primaryStream/page/:page',
    getActivityStreamPage,
  ],

  'site-get-secondary-stream': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/activity/:primaryStream/stream/:secondaryStream/changes',
    getActivityStream,
  ],
  'site-get-secondary-stream-page': [
    TypedRouter.GET,
    '/s/:slug/madoc/api/activity/:primaryStream/stream/:secondaryStream/page/:page',
    getActivityStreamPage,
  ],
};
