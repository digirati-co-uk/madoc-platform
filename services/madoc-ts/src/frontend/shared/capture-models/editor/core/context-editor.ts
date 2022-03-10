// @todo Compact using context (immer)
// @todo un-Compact using context (immer)

import { CaptureModel } from '../../types/capture-model';

export function addDefaultContext(model: CaptureModel, context: string): CaptureModel {
  if (
    (typeof model.document['@context'] === 'string' && context !== model.document['@context']) ||
    (typeof model.document['@context'] !== 'string' &&
      model.document['@context'] &&
      model.document['@context']['@vocab'] !== context)
  ) {
    throw new Error('Cannot add default context, context already exists');
  }

  const { ['@context']: atContext, ...document } = model.document;

  return {
    ...model,
    document: {
      '@context': atContext
        ? {
            '@vocab': context,
            ...(!atContext || typeof atContext === 'string' ? {} : atContext),
          }
        : context,
      ...document,
    },
  };
}

export function addContext(model: CaptureModel, context: string, alias: string): CaptureModel {
  const { ['@context']: atContext, ...document } = model.document;
  const fullContext: { [vocab: string]: string } =
    typeof atContext === 'string' ? { '@vocab': atContext } : atContext || {};

  if (fullContext[alias] && fullContext[alias] !== context) {
    throw new Error(`Cannot add context ${alias}, context already exists (${fullContext[alias]})`);
  }

  return {
    ...model,
    document: {
      '@context': {
        ...fullContext,
        [alias]: context,
      },
      ...document,
    },
  };
}

export function removeContext(model: CaptureModel, alias: string): CaptureModel {
  if (
    !model.document['@context'] ||
    typeof model.document['@context'] === 'string' ||
    !model.document['@context'][alias]
  ) {
    // Unchanged.
    return model;
  }

  const { ['@context']: atContext, ...document } = model.document;
  const { [alias]: _, ...ctx } = atContext;

  return {
    ...model,
    document: {
      '@context': ctx,
      ...document,
    },
  };
}

export function removeDefaultContext(model: CaptureModel): CaptureModel {
  if (
    !model.document['@context'] ||
    (typeof model.document['@context'] !== 'string' && !model.document['@context']['@vocab'])
  ) {
    return model;
  }

  const { ['@context']: atContext, ...document } = model.document;

  if (typeof atContext === 'string') {
    // Return without the context at all.
    return {
      ...model,
      document,
    };
  }

  return removeContext(model, '@vocab');
}
