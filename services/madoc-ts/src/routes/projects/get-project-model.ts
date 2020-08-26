import { RouteMiddleware } from '../../types/route-middleware';
import { parseUrn } from '../../utility/parse-urn';
import { sql } from 'slonik';
import { optionalUserWithScope } from '../../utility/user-with-scope';
import { api } from '../../gateway/api.server';

export const getProjectModel: RouteMiddleware<{ id: string; subject: string }> = async context => {
  const { siteId, id } = optionalUserWithScope(context, []);

  const userApi = api.asUser({ siteId, userId: id });

  const isNumber = context.params.id === `${Number(context.params.id)}`;

  const project = await context.connection.one(
    sql<{
      capture_model_id: string;
    }>`select capture_model_id from iiif_project where ${
      isNumber ? sql`id = ${Number(context.params.id)}` : sql`slug = ${context.params.id}`
    } and site_id = ${siteId}`
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
