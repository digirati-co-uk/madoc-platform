import { CaptureModel } from '@capture-models/types';
import { ApiClient } from '../../../gateway/api';
import { parseUrn } from '../../../utility/parse-urn';
import { CaptureModelExtension } from '../extension';

export class ConfigInjectionExtension implements CaptureModelExtension {
  api: ApiClient;
  constructor(api: ApiClient) {
    this.api = api;
  }

  async onCloneCaptureModel(captureModel: CaptureModel): Promise<CaptureModel> {
    const derivedFrom = captureModel.derivedFrom;
    // Nothing we can do if we don't know where the model came from.
    if (!derivedFrom || !captureModel.target || captureModel.target.length === 0 || !captureModel.id) {
      return captureModel;
    }

    const projectsWithModel = await this.api.getProjects(0, { capture_model_id: derivedFrom });
    const project = (projectsWithModel?.projects || [])[0];

    // No matching project.
    if (!project) {
      return captureModel;
    }

    const manifest = captureModel.target.find(target => (target.type || '').toLowerCase() === 'manifest');
    const manifestId = manifest ? parseUrn(manifest.id) : null;

    const collection = captureModel.target.find(target => (target.type || '').toLowerCase() === 'collection');
    const collectionId = collection ? parseUrn(collection.id) : null;

    // No manifest in the target, nothing to do.
    if (!manifest || !manifestId) {
      return captureModel;
    }

    const modelConfig = await this.api.getModelConfiguration({
      manifest_id: manifestId.id,
      collection_id: collectionId?.id,
      project_id: project.id,
    });

    const modelChanges = modelConfig?.documentChanges;

    // No changes, nothing to do.
    if (!modelChanges?.length) {
      return captureModel;
    }

    const state = { appliedChanges: 0 };
    const unsupportedKeywords = ['id', 'properties', 'revision', 'revises', 'selector', 'immutable', 'sortOrder'];

    // Apply changes in config object.
    // Note: Currently this will only support one level deep.
    for (const change of modelChanges) {
      // Filter out unsupported changes.
      if (unsupportedKeywords.indexOf(change.field) !== -1) {
        continue;
      }
      // Get property - this could be improved to do a DOT search or similar.
      const property = captureModel.document.properties[change.property];
      // We only support changes first elements, as they were made in the model.
      const singleFieldOrEntity = property ? property[0] : null;
      if (!singleFieldOrEntity) {
        continue;
      }

      // Equality check.
      if ((singleFieldOrEntity as any)[change.field] && (singleFieldOrEntity as any)[change.field] === change.value) {
        continue;
      }

      // Make the change.
      (singleFieldOrEntity as any)[change.field] = change.value;
      state.appliedChanges += 1;
    }

    console.log(`=> Applying ${state.appliedChanges} changes to capture model`);

    if (state.appliedChanges > 0) {
      return await this.api.updateCaptureModel(captureModel.id, captureModel);
    }

    return captureModel;
  }
}
