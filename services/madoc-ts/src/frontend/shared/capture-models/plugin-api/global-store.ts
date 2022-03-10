import { BaseContent, ContentSpecification } from '../types/content-types';
import { FieldTypeMap } from '../types/custom';
import { BaseField, FieldSpecification } from '../types/field-types';
import { UnknownRefinement } from '../types/refinements';
import { BaseSelector, SelectorSpecification } from '../types/selector-types';
import { pluginStore } from './globals';

export const resetPluginStore = () => {
  pluginStore.fields = {};
  pluginStore.contentTypes = {};
  pluginStore.selectors = {};
};

export function registerField<Props extends BaseField>(specification: FieldSpecification<Props>) {
  pluginStore.fields[specification.type] = specification as any;
}

export function registerContent<Props extends BaseContent>(contentType: ContentSpecification<Props>) {
  pluginStore.contentTypes[contentType.type] = contentType as any;
}

export function registerSelector<Props extends BaseSelector>(specification: SelectorSpecification<Props>) {
  pluginStore.selectors[specification.type] = specification as any;
}

export function registerRefinement<Ref extends UnknownRefinement = UnknownRefinement>(refinement: Ref) {
  // @ts-ignore
  refinement.refine.displayName = `refinement(${refinement.name})`;
  pluginStore.refinements.push(refinement);
}

export function getFieldPlugin<Props extends BaseField, TypeMap extends FieldTypeMap = FieldTypeMap>(
  type: string
): FieldSpecification<Props> {
  const field = pluginStore.fields[type];
  if (!field) {
    throw new Error(`Field type ${type} not found`);
  }

  return field as any; // FieldSpecification<Props>
}
