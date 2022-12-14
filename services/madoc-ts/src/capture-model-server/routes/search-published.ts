import { RouteMiddleware } from '../../types/route-middleware';
import { optionalUserWithScope } from '../../utility/user-with-scope';

export const searchPublished: RouteMiddleware = async context => {
  const { siteId } = optionalUserWithScope(context, ['models.view_published']);

  const { q: query, manifest, canvas, collection, field_type, parent_property, selector_type, capture_model_id } =
    (context.query as any) || {};

  const queryBlock: {
    manifest?: string;
    canvas?: string;
    collection?: string;
    field_type?: string;
    parent_property?: string;
    selector_type?: string;
    capture_model_id?: string;
  } = {};

  if (manifest) {
    queryBlock.manifest = manifest;
  }
  if (canvas) {
    queryBlock.canvas = canvas;
  }
  if (collection) {
    queryBlock.collection = collection;
  }
  if (field_type) {
    queryBlock.field_type = field_type;
  }
  if (parent_property) {
    queryBlock.parent_property = parent_property;
  }
  if (selector_type) {
    queryBlock.selector_type = selector_type;
  }
  if (capture_model_id) {
    queryBlock.capture_model_id = capture_model_id;
  }

  context.response.body = {
    results: await context.captureModels.searchPublished(siteId, query, queryBlock),
  };
};
