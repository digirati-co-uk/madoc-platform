import { createAnnotationApi } from './create-annotation';

export function annotationRoutes(router: any) {
  router.post('/iiif/annotations', createAnnotationApi);
}
