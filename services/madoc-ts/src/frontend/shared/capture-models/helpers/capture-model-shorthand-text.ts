import slugify from 'slugify';
import { templatedValueFormat } from '../../utility/templated-value-format';
import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { generateId } from './generate-id';

export function captureModelShorthandText(text: string, defaultType = 'international-field'): CaptureModel['document'] {
  const model: CaptureModel['document'] = {
    id: generateId(),
    type: 'entity',
    label: 'Root',
    properties: {},
  };
  const bulkItems = (text || '').split('\n');
  const fields = bulkItems.map(t =>
    templatedValueFormat<
      'many' | 'default' | 'type' | 'lang' | 'langs' | 'defaultLang' | 'description' | 'pluralLabel'
    >(t)
  );
  for (const fieldDef of fields) {
    const key = slugify(fieldDef.value.toLowerCase());
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
  return model;
}
