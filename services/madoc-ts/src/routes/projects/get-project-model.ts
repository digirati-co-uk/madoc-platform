import { RouteMiddleware } from '../../types/route-middleware';
import { parseUrn } from '../../utility/parse-urn';
import { sql } from 'slonik';
import { SQL_EMPTY } from '../../utility/postgres-tags';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { api } from '../../gateway/api.server';

export const getProjectModel: RouteMiddleware<{ id: string; subject: string }> = async context => {
  const { siteId, id } = optionalUserWithScope(context, []);

  const userApi = api.asUser({ siteId, userId: id });

  const scope = context.state.jwt?.scope || [];
  const onlyPublished = scope.indexOf('site.admin') === -1;

  const isNumber = context.params.id === `${Number(context.params.id)}`;

  const project = await context.connection.one(
    sql<{
      capture_model_id: string;
    }>`
      select capture_model_id 
      from iiif_project 
      where ${isNumber ? sql`id = ${Number(context.params.id)}` : sql`slug = ${context.params.id}`} 
        and site_id = ${siteId}
       ${onlyPublished ? sql`and (iiif_project.status = 1 or iiif_project.status = 2)` : SQL_EMPTY}
    `
  );

  const parsed = parseUrn(context.params.subject);

  const models = await userApi.getAllCaptureModels({
    target_id: context.params.subject,
    target_type: 'Canvas',
    derived_from: project.capture_model_id,
  });

  context.response.body = {
    subject: context.params.subject,
    resource: parsed,
    baseModel: project.capture_model_id,
    model: models.length ? models[0] : null,
  };
};
