import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { parseUrn } from '../../utility/parse-urn';
import { userCan } from '../../utility/user-can';
import { castBool } from '../../utility/cast-bool';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { migrateModel } from '../migration/migrate-model';
import { CaptureModelGetOptions } from '../types';
import { CaptureModel } from '../../frontend/shared/capture-models/types/capture-model';

export const captureModelApi: RouteMiddleware<{ id: string }> = async context => {
  const { id, siteId } = optionalUserWithScope(context, ['models.view_published']);
  const canSeeFullModel = userCan('models.create', context.state);
  const canDebug = userCan('models.admin', context.state);
  const userApi = api.asUser({ siteId, userId: id }, {}, true);
  const modelId = context.params.id;

  // Migration specific.
  await migrateModel(modelId, { id, siteId }, context.captureModels);

  const query = context.query as {
    author: string;
    revisionId: string;
    revision_id: string;
    published: string;

    // Debugging query
    debug: string;
    'debug.userId': string;
    'debug.includeCanonical': string;
    'debug.onlyRevisionFields': string;
    'debug.revisionId': string;
    'debug.revisionStatus': string;
    'debug.revisionStatuses': string;
    'debug.fullModel': string;
    'debug.showAllRevisions': string;
    'debug.showDeletedFields': string;
  };

  const debug = canDebug && castBool(query.debug);
  const published = castBool(query.published, false);
  const parsedUserQuery = query.author ? parseUrn(query.author) : null;
  const onlyUser = canSeeFullModel ? (parsedUserQuery ? parsedUserQuery.id : undefined) : id;

  if (debug) {
    const debugOptions: CaptureModelGetOptions = {
      onlyRevisionFields: castBool(query['debug.onlyRevisionFields']),
      userId: query['debug.userId'] ? Number(query['debug.userId']) : undefined,
      revisionId: query['debug.revisionId'],
      revisionStatus: query['debug.revisionStatus'],
      fullModel: castBool(query['debug.fullModel']),
      showAllRevisions: castBool(query['debug.showAllRevisions']),
      includeCanonical: castBool(query['debug.includeCanonical']),
      showDeletedFields: castBool(query['debug.showDeletedFields']),
      revisionStatuses: query['debug.revisionStatuses'] ? query['debug.revisionStatuses'].split(',') : undefined,
    };
    context.response.body = {
      __debug_options__: debugOptions,
      ...(await context.captureModels.getCaptureModel(modelId, debugOptions, siteId)),
    };

    return;
  }

  const options: CaptureModelGetOptions = {
    includeCanonical: published,
    revisionStatus: published ? 'accepted' : undefined,
    revisionId: query.revision_id || query.revisionId,
    userId: onlyUser,
    showAllRevisions: canSeeFullModel && !onlyUser && !published && !query.revision_id,
  };

  // @todo temporary migration code.
  try {
    context.body = await context.captureModels.getCaptureModel(modelId, options, siteId);
  } catch (e) {
    const model = await userApi.request<CaptureModel>(`/api/crowdsourcing/models/${modelId}`);
    await context.captureModels.createCaptureModel(model, siteId);
    context.body = await context.captureModels.getCaptureModel(modelId, options, siteId);
  }
};
