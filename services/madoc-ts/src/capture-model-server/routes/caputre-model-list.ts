import { RouteMiddleware } from '../../types/route-middleware';
import { castBool } from '../../utility/cast-bool';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const captureModelListApi: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['models.view_published']);
  const isAdmin = context.state.jwt && context.state.jwt.scope.indexOf('site.admin') !== -1;

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
