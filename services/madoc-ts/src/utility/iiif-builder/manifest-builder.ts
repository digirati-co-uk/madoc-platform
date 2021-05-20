import { emptyCanvas } from '@hyperion-framework/parser';
import { CanvasNormalized, ManifestNormalized } from '@hyperion-framework/types';
import { IIIFBuilder } from './iiif-builder';
import { BaseEntityBuilder } from './base-entity-builder';
import { CanvasInstanceBuilder } from './canvas-builder';

export class ManifestInstanceBuilder extends BaseEntityBuilder<ManifestNormalized> {
  constructor(builder: IIIFBuilder, entity: ManifestNormalized) {
    super(builder, entity);
  }

  createCanvas(id: string, callback: (canvas: CanvasInstanceBuilder) => void) {
    const canvasBuilder = new CanvasInstanceBuilder(this.builder, { ...emptyCanvas, id });
    callback(canvasBuilder);
    this.newInstances.push(canvasBuilder);
    this.modified.add('items');
    this.entity.items = [
      ...this.entity.items,
      {
        id,
        type: 'Canvas',
      },
    ];
  }

  editCanvas(id: string, callback: (canvas: CanvasInstanceBuilder) => void) {
    const canvasToEdit = this.builder.vault.fromRef<CanvasNormalized>({ id, type: 'Canvas' });
    const canvasBuilder = new CanvasInstanceBuilder(this.builder, { ...canvasToEdit });
    callback(canvasBuilder);
    this.newInstances.push(canvasBuilder);
  }
}
