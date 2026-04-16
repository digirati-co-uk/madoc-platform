import deepmerge from 'deepmerge';
import { ProjectConfiguration } from '../types/schemas/project-configuration';

const overwriteArray = (_destinationArray: unknown[], sourceArray: unknown[]) => sourceArray;

export function mergeProjectConfiguration<T extends Partial<ProjectConfiguration>>(
  baseConfiguration: T,
  overrideConfiguration?: Partial<ProjectConfiguration>
): ProjectConfiguration {
  return deepmerge(baseConfiguration as ProjectConfiguration, (overrideConfiguration || {}) as ProjectConfiguration, {
    arrayMerge: overwriteArray,
  });
}
