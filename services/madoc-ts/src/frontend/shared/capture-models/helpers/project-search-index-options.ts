import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';
import { isEntity } from './is-entity';

export interface ProjectSearchIndexFieldOption {
  path: string[];
  label: string;
}

export interface ProjectSearchIndexEntityOption {
  path: string[];
  label: string;
  pluralLabel: string;
  fields: ProjectSearchIndexFieldOption[];
}

export function getProjectSearchFacetFieldName(path: string[]) {
  const normalized = path
    .join('_')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return normalized ? `facet_${normalized}` : '';
}

export function getProjectSearchIndexEntityOptions(document: CaptureModel['document']) {
  const options = new Map<string, ProjectSearchIndexEntityOption>();

  const visit = (entity: CaptureModel['document'], path: string[]) => {
    const key = JSON.stringify(path);
    if (!options.has(key)) {
      const fields = Object.entries(entity.properties || {}).flatMap(([property, values]) => {
        const propertyValues = values as Array<BaseField | CaptureModel['document']>;
        const field = propertyValues.find((value): value is BaseField => !isEntity(value));
        return field ? [{ path: [property], label: field.label || property }] : [];
      });
      const label = entity.label || (path.length ? path[path.length - 1] : 'Whole capture model');
      options.set(key, {
        path,
        label,
        pluralLabel: entity.pluralLabel || label,
        fields,
      });
    }

    for (const [property, values] of Object.entries(entity.properties || {})) {
      const propertyValues = values as Array<BaseField | CaptureModel['document']>;
      const child = propertyValues.find(isEntity);
      if (child) {
        visit(child, [...path, property]);
      }
    }
  };

  visit(document, []);
  return [...options.values()];
}
