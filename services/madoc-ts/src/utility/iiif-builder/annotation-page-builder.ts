import { Annotation, AnnotationPageNormalized } from '@hyperion-framework/types';
import { IIIFBuilder } from './iiif-builder';
import { BaseEntityBuilder } from './base-entity-builder';

export class AnnotationPageInstanceBuilder extends BaseEntityBuilder<AnnotationPageNormalized> {
  defaultAnnotationTarget?: string;
  constructor(builder: IIIFBuilder, entity: AnnotationPageNormalized, defaultAnnotationTarget?: string) {
    super(builder, entity);
    this.defaultAnnotationTarget = defaultAnnotationTarget;
  }

  createAnnotation(annotation: Annotation) {
    // Extract annotation body + target as reference

    if (this.defaultAnnotationTarget) {
      annotation.target = this.defaultAnnotationTarget;
    }

    annotation.body = this.addEmbeddedInstance(annotation.body, 'ContentResource');

    const annotationRef = this.addEmbeddedInstance(annotation, 'Annotation');

    this.modified.add('items');
    this.entity.items = [...this.entity.items, annotationRef];
  }
}
