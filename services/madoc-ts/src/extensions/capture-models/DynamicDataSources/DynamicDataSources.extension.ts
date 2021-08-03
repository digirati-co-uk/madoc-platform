import { traverseDocument } from '@capture-models/helpers';
import { BaseField, CaptureModel } from '@capture-models/types';
import { ApiClient } from '../../../gateway/api';
import { defaultDispose } from '../../extension-manager';
import { CaptureModelExtension } from '../extension';
import { DynamicData } from './types';

export class DynamicDataSourcesExtension implements CaptureModelExtension {
  api: ApiClient;
  dataLoaders: DynamicData[];
  constructor(api: ApiClient, dataLoaders: DynamicData[]) {
    this.api = api;
    this.dataLoaders = dataLoaders;
  }

  dispose() {
    defaultDispose(this);
  }

  async onCloneCaptureModel(captureModel: CaptureModel): Promise<CaptureModel> {
    if (this.dataLoaders.length === 0) {
      return captureModel;
    }

    const dataLoaderTypes = this.dataLoaders.map(loader => loader.definition.id);

    const state = {
      fields: [] as Array<{ field: BaseField; key: string; source: string }>,
    };

    // 1. Does the capture model support data sources.
    traverseDocument(captureModel.document, {
      visitField(field, key) {
        const dataSources = field.dataSources
          ? field.dataSources.filter(source => dataLoaderTypes.indexOf(source) !== -1)
          : undefined;

        // 2. Do any of the fields have data sources?
        if (dataSources) {
          for (const source of dataSources) {
            state.fields.push({
              field,
              key,
              source,
            });
          }
        }
      },
    });

    if (state.fields.length === 0 || !captureModel.id) {
      return captureModel;
    }

    // 3. Resolve data needed about the resource
    const { canvas } = this.api.parseModelTarget(captureModel.target);

    if (!canvas) {
      // No valid target.
      return captureModel;
    }

    // 4. Call each of the extensions to get the data from the source
    for (const field of state.fields) {
      const loader = this.dataLoaders.find(candidateLoader => candidateLoader.definition.id === field.source);
      // Just double check.
      if (loader) {
        try {
          // 5. Modify and return the model.
          await loader.loader(field.field, field.key, canvas, this.api);
        } catch (err) {
          console.log('Loader error', err);
        }
      }
    }

    return await this.api.updateCaptureModel(captureModel.id, captureModel);
  }
}
