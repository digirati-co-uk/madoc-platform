import { gatewayHost } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { NotFound } from '../../utility/errors/not-found';
import { RequestError } from '../../utility/errors/request-error';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import {
  ActivityOptions,
  ChangeDiscoveryActivityRequest,
  ChangeDiscoveryActivityType,
} from '../change-discovery-types';

const actionMap: { [key: string]: ChangeDiscoveryActivityType } = {
  create: 'Create',
  update: 'Update',
  delete: 'Delete',
  move: 'Move',
  add: 'Add',
  remove: 'Remove',
};

export const postActivity: RouteMiddleware<
  {
    primaryStream: string;
    secondaryStream?: string;
    action: string;
  },
  ChangeDiscoveryActivityRequest & {
    options?: ActivityOptions;
  }
> = async (context) => {
  // @todo in the future we should create a site permission specifically for this.
  const { siteId } = optionalUserWithScope(context, ['tasks.create']);
  const { action: unmappedAction, primaryStream, secondaryStream } = context.params;
  const action = actionMap[unmappedAction];
  const {
    target,
    startTime,
    actor,
    object,
    summary,
    options: {
      dispatchToSecondaryStreams,
      preventAddToPrimaryStream,
      preventUpdateToPrimaryStream,
      primaryObjectId,
    } = {},
  } = context.requestBody;

  // Basic validation.
  if (!action) {
    throw new NotFound();
  }
  if (!object || !object.id || !object.type) {
    throw new RequestError('Objects must have a id and type fields.');
  }
  const canonicalId = object.canonical || object.id;

  if (secondaryStream && !preventAddToPrimaryStream) {
    const existsInPrimaryStream = await context.changeDiscovery.resourceExists({ primaryStream }, canonicalId, siteId);
    if (!existsInPrimaryStream && action !== 'Remove' && action !== 'Delete') {
      await context.changeDiscovery.addActivity(
        'Add',
        {
          primaryStream,
        },
        {
          target,
          startTime,
          actor,
          object: primaryObjectId
            ? {
                ...object,
                id: primaryObjectId,
              }
            : object,
          summary: `Automatically created activity from secondary stream: ${secondaryStream}`,
        },
        siteId
      );
    }
  }

  const doesObjectExist = await context.changeDiscovery.resourceExists(
    { primaryStream, secondaryStream },
    canonicalId,
    siteId
  );
  if (action !== 'Move' && action !== 'Remove' && action !== 'Delete' && !doesObjectExist) {
    await context.changeDiscovery.addActivity(
      'Add',
      {
        primaryStream,
        secondaryStream,
      },
      {
        target,
        startTime,
        actor,
        object: object,
        summary: `Automatically created before action: ${action}`,
      },
      siteId
    );

    // Artificial 50ms delay to prevent any chance of timestamps being identical.
    await new Promise((resolve) => setTimeout(resolve, 50));
  }

  if (!doesObjectExist && (action === 'Remove' || action === 'Delete')) {
    // Do nothing.
    context.response.status = 204;
    return;
  }

  if (action === 'Move' && !doesObjectExist) {
    // Should we handle this differently?
  }

  if (secondaryStream) {
    // Add event into secondary stream
    const activity = await context.changeDiscovery.addActivity(
      action,
      {
        primaryStream,
        secondaryStream,
      },
      {
        target,
        startTime,
        actor,
        object: object,
        summary,
      },
      siteId
    );

    context.response.status = 201;
    context.response.body = activity;

    if (action === 'Update' && !preventUpdateToPrimaryStream) {
      // Add to primary stream
      await context.changeDiscovery.addActivity(
        action,
        {
          primaryStream,
        },
        {
          target,
          startTime,
          actor,
          object: primaryObjectId
            ? {
                ...object,
                id: primaryObjectId,
              }
            : object,
          summary: `(source: ${secondaryStream}): ${summary || `No summary provided for ${action} action`}`,
        },
        siteId
      );
    }
  } else {
    // Add event into primary stream
    const activity = await context.changeDiscovery.addActivity(
      action,
      {
        primaryStream,
      },
      {
        target,
        startTime,
        actor,
        object: object,
        summary,
      },
      siteId
    );

    const baseUrl = `${gatewayHost}/api/madoc/activity/${primaryStream}${
      secondaryStream ? '/stream/' + secondaryStream : ''
    }`;

    activity.id = `${baseUrl}/activity/${activity.id}`;

    context.response.status = 201;
    context.response.body = activity;

    if (dispatchToSecondaryStreams) {
      // @todo future feature.
      // Add to all secondary streams.
      // - Check if we need to upsert Add
      // - Perform update.
    }
  }
};
