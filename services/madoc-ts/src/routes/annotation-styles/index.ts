import { RouteWithParams, TypedRouter } from '../../utility/typed-router';
import { createAnnotationStyle } from './create-annotation-style';
import { getAnnotationStyle } from './get-annotation-style';
import { listAnnotationStyles } from './list-annotation-styles';
import { updateAnnotationStyle } from './update-annotation-style';

export const annotationStyles: Record<keyof any, RouteWithParams<any>> = {
  'create-annotation-style': [TypedRouter.POST, '/api/madoc/annotation-styles', createAnnotationStyle],
  'delete-annotation-style': [TypedRouter.DELETE, '/api/madoc/annotation-styles/:id', getAnnotationStyle],
  'get-annotation-style': [TypedRouter.GET, '/api/madoc/annotation-styles/:id', getAnnotationStyle],
  'list-annotation-styles': [TypedRouter.GET, '/api/madoc/annotation-styles', listAnnotationStyles],
  'update-annotation-style': [TypedRouter.PUT, '/api/madoc/annotation-styles/:id', updateAnnotationStyle],
};
