import { ApiDefinition } from './_meta';
import { updateModelConfig } from './update-model-config';
import { updateManifestMetadata, updateCollectionMetadata, updateCanvasMetadata } from './update-metadata';

export const apiDefinitionIndex: { [name: string]: ApiDefinition } = {
  [updateModelConfig.id]: updateModelConfig,
  [updateCanvasMetadata.id]: updateCanvasMetadata,
  [updateManifestMetadata.id]: updateManifestMetadata,
  [updateCollectionMetadata.id]: updateCollectionMetadata,
};
