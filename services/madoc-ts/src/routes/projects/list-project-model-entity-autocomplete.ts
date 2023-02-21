import { isEntityList } from '../../frontend/shared/capture-models/helpers/is-entity';
import { RouteMiddleware } from '../../types/route-middleware';
import cache from 'memory-cache';
import { api } from '../../gateway/api.server';
import { userWithScope } from '../../utility/user-with-scope';
export const listProjectModelEntityAutocomplete: RouteMiddleware = async context => {
  const { siteId } = userWithScope(context, ['site.admin']);
  const cacheKey = `capture-model-entities:${context.params.id}`;
  let captureModelEntities = cache.get(cacheKey);
  if (!captureModelEntities) {
    const useApi = api.asUser({ siteId }, {}, true);
    const project = await useApi.getProject(context.params.id);
    const model = await useApi.crowdsourcing.getCaptureModel(project.capture_model_id);

    captureModelEntities = [];
    for (const [key, obj] of Object.entries(model.document.properties)) {
      if (isEntityList(obj)) {
        const first = obj[0];
        captureModelEntities.push({
          label: first.label,
          uri: key,
        });
      }
    }
    cache.put(cacheKey, captureModelEntities, 3600);
  }

  context.response.body = { completions: captureModelEntities || [] };
};
