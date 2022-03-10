import { CaptureModel } from '../types/capture-model';
import { BaseSelector } from '../types/selector-types';
import { isEntityList } from './is-entity';

export function serialiseCaptureModel<T = any>(
  model: CaptureModel['document'],
  options: { addMetadata?: boolean; addSelectors?: boolean; rdfValue?: boolean; normalisedValueLists?: boolean } = {},
  metadataAggregate?: { aggregate: any; key: string }
): undefined | T {
  const { addMetadata, addSelectors, rdfValue, normalisedValueLists } = options;
  const properties = Object.keys(model.properties);

  const newDoc = {} as any;
  const metadataAgg = metadataAggregate ? metadataAggregate.aggregate : {};
  const isSelectorValid = (selector?: BaseSelector) => selector && selector.state && selector.type === 'box-selector';

  if (properties.length === 0) {
    return undefined; // Always return undefined if there are no properties.
  }

  for (const prop of properties) {
    const modelTemplate = model.properties[prop];

    if (modelTemplate.length === 0) {
      // This shouldn't happen with a valid model.
      continue;
    }

    if (isEntityList(modelTemplate)) {
      // We have an entity list.
      if (modelTemplate.length === 1 && !modelTemplate[0].allowMultiple) {
        const serialised = serialiseCaptureModel(
          modelTemplate[0],
          options,
          addMetadata
            ? {
                aggregate: metadataAgg,
                key: metadataAggregate ? `${metadataAggregate.key}.${prop}` : prop,
              }
            : undefined
        );
        if (typeof serialised !== 'undefined') {
          if (addSelectors && isSelectorValid(modelTemplate[0].selector)) {
            newDoc[prop] = {
              selector: modelTemplate[0].selector?.state,
              properties: serialised,
            };
          } else {
            newDoc[prop] = serialised;
          }
        }
        continue;
      }

      const shouldNormalise = normalisedValueLists
        ? !!modelTemplate.find(template => {
            return isSelectorValid(template.selector);
          })
        : false;

      newDoc[prop] = modelTemplate
        .map(template => {
          const serialised = serialiseCaptureModel(
            template,
            options,
            addMetadata
              ? {
                  aggregate: metadataAgg,
                  key: metadataAggregate ? `${metadataAggregate.key}.${prop}` : prop,
                }
              : undefined
          );

          if (addSelectors && isSelectorValid(modelTemplate[0].selector)) {
            return {
              selector: modelTemplate[0].selector?.state,
              properties: serialised,
            };
          } else {
            if (shouldNormalise) {
              return { properties: serialised };
            }

            return serialised;
          }
        })
        // Filter any undefined documents.
        .filter(doc => typeof doc !== 'undefined');
    } else {
      if (addMetadata) {
        metadataAgg[metadataAggregate && metadataAggregate.key ? `${metadataAggregate.key}.${prop}` : prop] =
          modelTemplate[0].type;
      }
      // When its a single field.
      if (modelTemplate.length === 1) {
        const value = modelTemplate[0].value;
        // Null indicates that no user has edited it as a default from the model.
        if (value !== null && typeof value !== 'undefined') {
          // When a selector is present
          if (
            addSelectors &&
            // Only supporting box selectors presently.
            isSelectorValid(modelTemplate[0].selector)
          ) {
            newDoc[prop] = {
              selector: modelTemplate[0].selector?.state,
              [rdfValue ? '@value' : 'value']: value,
            };
          } else {
            newDoc[prop] = value;
          }
        }
        continue;
      }

      const shouldNormalise = normalisedValueLists
        ? !!modelTemplate.find(template => {
            return isSelectorValid(template.selector);
          })
        : false;

      newDoc[prop] = modelTemplate
        .map(template => {
          if (
            addSelectors &&
            // Only supporting box selectors presently.
            template.selector &&
            template.selector.state &&
            template.selector.type === 'box-selector'
          ) {
            return {
              selector: template.selector.state,
              [rdfValue ? '@value' : 'value']: template.value,
            };
          } else {
            if (shouldNormalise) {
              return { [rdfValue ? '@value' : 'value']: template.value };
            }
            return template.value;
          }
        })
        .filter(value => value !== null && typeof value !== 'undefined');
    }
  }

  if (addMetadata && !metadataAggregate) {
    newDoc.__meta__ = metadataAgg;
  }

  return newDoc;
}
