import slugifyFn from 'slugify';
import { TemplatedValue, templatedValueFormat } from '../../utility/templated-value-format';
import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { generateId } from './generate-id';

function addTemplateValuesToDocument(
  model: CaptureModel['document'],
  fields: TemplatedValue[],
  { slugify = true, defaultType = 'international-field' }: { slugify?: boolean; defaultType?: string } = {}
) {
  const collectedEntities: Record<any, any> = {};

  for (const fieldDef of fields) {
    if (fieldDef.value.split(' ')[0].indexOf('.') !== -1) {
      const [entity, ...parts] = fieldDef.value.split('.');
      collectedEntities[entity] = collectedEntities[entity] ? collectedEntities[entity] : [];
      collectedEntities[entity].push({
        ...fieldDef,
        value: parts.join('.'),
      });
      continue;
    }

    const key = slugify ? slugifyFn(fieldDef.value.toLowerCase()) : fieldDef.value;
    const field: BaseField = {
      id: generateId(),
      type: defaultType,
      label: fieldDef.value,
      value: defaultType === 'international-field' ? { none: [''] } : '',
    };
    if (fieldDef.modifiers.length) {
      let langs: string[] = [];
      let currentLang = 'none';
      let defaultValue = '';
      let defaultLang = '';
      for (const modifier of fieldDef.modifiers) {
        switch (modifier.id) {
          case 'description': {
            if (modifier.value) {
              field.description = modifier.value;
            }
            break;
          }
          case 'pluralLabel': {
            if (modifier.value) {
              field.pluralLabel = modifier.value;
            }
            break;
          }
          case 'defaultLang': {
            if (modifier.value) {
              defaultLang = modifier.value;
            }
            break;
          }
          case 'langs': {
            if (modifier.value && field.type === 'international-field') {
              langs = modifier.value.split(',');
            }
            break;
          }
          case 'lang': {
            if (modifier.value && field.type === 'international-field') {
              if (field.value[currentLang]) {
                const value = field.value[currentLang];
                delete field.value[currentLang];
                field.value[modifier.value] = value;
                currentLang = modifier.value;
              }
            }
            break;
          }
          case 'default': {
            if (modifier.value) {
              defaultValue = modifier.value;
            }
            break;
          }
          case 'many': {
            field.allowMultiple = true;
            break;
          }
          case 'type': {
            if (modifier.value) {
              field.type = modifier.value;
            }
            break;
          }
        }
      }

      if (field.type === 'international-field') {
        field.value[defaultLang || currentLang] = [defaultValue];
        if (langs.length) {
          const value = defaultLang ? [''] : field.value[currentLang];
          for (const lang of langs) {
            if (!defaultLang || lang !== defaultLang) {
              field.value[lang] = value;
            }
          }
          if (langs.indexOf(currentLang) === -1) {
            delete field.value[currentLang];
          }
        }
      } else {
        field.value = defaultValue;
      }
    }
    model.properties[key] = [field];
  }

  const entities = Object.keys(collectedEntities);
  for (const label of entities) {
    const key = slugify ? slugifyFn(label) : label;
    const newEntity: CaptureModel['document'] = {
      id: generateId(),
      type: 'entity',
      label: key,
      properties: {},
    };

    const entityFields = collectedEntities[label];

    addTemplateValuesToDocument(newEntity, entityFields, { slugify, defaultType });

    model.properties[key] = [newEntity];
  }
}

export function captureModelShorthandText(
  text: string,
  {
    slugify = true,
    defaultType = 'international-field',
    entityLabel = 'Root',
  }: { slugify?: boolean; defaultType?: string; entityLabel?: string } = {}
): CaptureModel['document'] {
  const model: CaptureModel['document'] = {
    id: generateId(),
    type: 'entity',
    label: entityLabel,
    properties: {},
  };
  const bulkItems = (text || '')
    .split('\n')
    .map(t => t.trim())
    .filter(Boolean);
  const fields = bulkItems.map(t =>
    templatedValueFormat<
      'many' | 'default' | 'type' | 'lang' | 'langs' | 'defaultLang' | 'description' | 'pluralLabel'
    >(t)
  );

  addTemplateValuesToDocument(model, fields, { slugify, defaultType });

  return model;
}
