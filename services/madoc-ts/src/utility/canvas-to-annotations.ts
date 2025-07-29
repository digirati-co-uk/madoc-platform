import { Annotation, Canvas } from '@iiif/presentation-3';

export function canvasToAnnotations(canvas: Canvas): Annotation[] {
  const annotationItems: Annotation[] = [];

  if (canvas.items) {
    for (const annotationPage of canvas.items) {
      if (annotationPage.type === 'AnnotationPage' && annotationPage.items) {
        for (const annotation of annotationPage.items) {
          if (annotation.type === 'Annotation') {
            annotationItems.push(annotation);
          }
        }
      }
    }
  }

  return annotationItems;
}
