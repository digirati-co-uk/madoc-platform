import { ApiDefinition } from './_meta';
import { updateModelConfig } from './update-model-config';

export const apiDefinitionIndex: { [name: string]: ApiDefinition } = {
  [updateModelConfig.id]: updateModelConfig,
};
