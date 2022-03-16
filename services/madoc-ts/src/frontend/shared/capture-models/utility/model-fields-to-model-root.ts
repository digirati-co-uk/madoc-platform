import { ModelFields } from '../types/capture-model';

interface ModelRootOption {
  root: string[];
}

export function modelFieldsToModelRoot(
  modelFields: ModelFields,
  options: { singleLevel?: boolean } = {},
  prefix: string[] = []
): Array<ModelRootOption> {
  const foundRoots: ModelRootOption[] = [];
  let nonFlat = false;

  for (const field of modelFields) {
    if (Array.isArray(field)) {
      const [key, subfields] = field;
      foundRoots.push({ root: [...prefix, key] });
      if (subfields && subfields.length) {
        foundRoots.push(...modelFieldsToModelRoot(subfields, options, [...prefix, key]));
      }
    } else {
      nonFlat = true;
    }
  }

  if (options.singleLevel) {
    if (nonFlat) {
      return [];
    }

    const uqKeys: string[] = [];
    for (const foundRoot of foundRoots) {
      if (uqKeys.indexOf(foundRoot.root[0]) === -1) {
        uqKeys.push(foundRoot.root[0]);
      }
    }
    if (uqKeys.length > 1) {
      return [];
    }
  }

  return foundRoots;
}
