import { api } from '../../gateway/api.server';
import { RouteMiddleware } from '../../types/route-middleware';
import { CaptureModelSnippet } from '../../types/schemas/capture-model-snippet';
import { castBool } from '../../utility/cast-bool';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { migrateModel } from '../migration/migrate-model';
import { stringify } from 'query-string';

export const captureModelListApi: RouteMiddleware = async context => {
  const { siteId, id } = optionalUserWithScope(context, ['models.view_published']);
  const isAdmin = context.state.jwt && context.state.jwt.scope.indexOf('site.admin') !== -1;

  // Migration specific
  if (!context.captureModels.isMigrated()) {
    // First get the list from the old site.
    const migrateApi = api.asUser({ siteId, userId: id });
    const { page: _, ...parsedQuery } = context.query;
    const allOldModels = await migrateApi.request<CaptureModelSnippet[]>(
      `/api/crowdsourcing/model?${stringify({ ...parsedQuery, _all: true })}`,
      { method: 'GET' }
    );
    for (const old of allOldModels) {
      // Migration specific.
      await migrateModel(old.id, { id, siteId }, context.captureModels);
    }
  }

  const query = context.query as {
    target_type: string;
    target_id: string;
    derived_from: string;
    all_derivatives: string;
    page: string;
  };

  const targetType = query.target_type;
  const targetId = query.target_id;

  const derivedFrom = query.derived_from;
  const includeDerivatives = castBool(query.all_derivatives);
  const page = query.page ? Number(query.page) : 1;

  const showAll = context.query._all && isAdmin;

  context.response.body = await context.captureModels.listCaptureModels(
    {
      all: showAll,
      page,
      perPage: 20,
      allDerivatives: includeDerivatives,
      derivedFrom,
      target: targetId,
    },
    siteId
  );
};
