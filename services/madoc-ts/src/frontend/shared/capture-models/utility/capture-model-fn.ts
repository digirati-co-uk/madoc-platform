import { Store } from 'easy-peasy';
import { useMemo } from 'react';
import { Revisions, RevisionsModel } from '../editor/stores/revisions/index';
import { generateId } from '../helpers/generate-id';
import { getRevisionFieldFromPath } from '../helpers/get-revision-field-from-path';
import { useSelector } from '../plugin-api/hooks/use-selector';
import { CaptureModel } from '../types/capture-model';
import { BaseField } from '../types/field-types';

interface CaptureModelFnInstance<T> {
  get(): T;
  set(value: T): void;
  update(fn: (value: T) => T): void;
}

interface CaptureModelFnList<T> extends CaptureModelFnInstance<T[]> {
  push(value: T): void;
  remove(value: T): void;
  removeAt(index: number): void;
  at(index: number): CaptureModelFnInstance<T>;
  // Future?
  // insertAt(index: number, value: T): void;
  // move(from: number, to: number): void;
}

type UpdateFieldValueContext = RevisionsModel['updateFieldValue']['payload'];

class BaseFieldWrapper<T> implements CaptureModelFnInstance<T> {
  store: Store<RevisionsModel>;
  path: [string, string][];
  constructor(store: Store<RevisionsModel>, path: [string, string][]) {
    this.store = store;
    this.path = path;
  }

  get(): T {
    const field = getRevisionFieldFromPath<BaseField>(this.store.getState(), this.path);
    return field ? field.value : undefined;
  }

  set(value: T) {
    this.store.getActions().updateFieldValue({
      path: this.path,
      value,
    });
  }

  update(fn: (value: T) => any) {
    this.store.getActions().updateFieldValue({
      path: this.path,
      value: fn(this.get()),
    });
  }
}

class JsonFieldWrapper<T> implements CaptureModelFnInstance<T | undefined> {
  store: Store<RevisionsModel>;
  path: [string, string][];
  constructor(store: Store<RevisionsModel>, path: [string, string][]) {
    this.store = store;
    this.path = path;
  }

  get() {
    const field = getRevisionFieldFromPath<BaseField>(this.store.getState(), this.path);
    try {
      return field ? JSON.parse(field.value) : undefined;
    } catch (err) {
      return undefined;
    }
  }

  set(value: T | undefined) {
    this.store.getActions().updateFieldValue({
      path: this.path,
      value: value ? JSON.stringify(value) : value,
    });
  }

  update(fn: (value: T | undefined) => any) {
    this.store.getActions().updateFieldValue({
      path: this.path,
      value: fn(this.get()),
    });
  }
}

// Wraps a structure like:
// { 'property-name': [BaseFieldWrapper, BaseFieldWrapper, BaseFieldWrapper] }
class FieldListWrapper<T> implements CaptureModelFnList<T> {
  path: [string, string][];
  property: string;
  store: Store<RevisionsModel>;
  fields: BaseFieldWrapper<T>[] = [];
  constructor(store: Store<RevisionsModel>, path: [string, string][], property: string) {
    this.store = store;
    this.property = property;
    this.path = path;
    const entity = getRevisionFieldFromPath<CaptureModel['document']>(store.getState(), path);
    if (!entity) {
      throw new Error('Could not find entity');
    }

    const propertyList = entity.properties[property];
    for (const field of propertyList) {
      if (field.type === 'entity') {
        // TODO
      } else {
        this.fields.push(new BaseFieldWrapper(store, [...path, [property, field.id]]));
      }
    }
  }

  get(): T[] {
    return this.fields.map(f => f.get());
  }

  at(index: number): CaptureModelFnInstance<T> {
    return this.fields[index];
  }

  push(value: T) {
    const actions = this.store.getActions();
    const id = generateId();
    actions.createNewFieldInstance({
      path: this.path,
      property: this.property,
      withId: id,
    });

    actions.updateFieldValue({
      path: [...this.path, [this.property, id]],
      value,
    });
  }

  remove(value: T) {
    const index = this.fields.findIndex(f => f.get() === value);
    if (index !== -1) {
      this.removeAt(index);
    }
  }

  removeAt(index: number) {
    const actions = this.store.getActions();
    const field = this.fields[index];
    actions.removeInstance({
      path: field.path,
    });
  }

  set(): never {
    throw new Error('Not implemented');
  }

  update(fn: (value: T[]) => any): never {
    throw new Error('Not implemented');
  }
}

export class BaseEntityWrapper implements CaptureModelFnInstance<CaptureModel['document']> {
  store: Store<RevisionsModel>;
  path: [string, string][];
  properties: Map<string, FieldListWrapper<any>> = new Map();

  constructor(store: Store<RevisionsModel>, path: [string, string][]) {
    this.store = store;
    this.path = path;

    const entity = getRevisionFieldFromPath<CaptureModel['document']>(store.getState(), path);
    if (!entity) {
      throw new Error('Could not find entity');
    }

    for (const property of Object.keys(entity.properties)) {
      this.properties.set(property, new FieldListWrapper(store, path, property));
    }
  }

  getProperty<T>(property: string): CaptureModelFnList<T> {
    return this.properties.get(property) as any;
  }

  get(): CaptureModel['document'] {
    const entity = getRevisionFieldFromPath<CaptureModel['document']>(this.store.getState(), this.path);
    if (!entity) {
      throw new Error('Could not find entity');
    }
    return entity;
  }

  set(): never {
    throw new Error('Cant overwrite entity');
  }

  update(fn: (value: CaptureModel['document']) => any): void {
    throw new Error('Cant overwrite entity');
  }
}

function useModelInstance() {
  const currentRevisionId = Revisions.useStoreState(s => s.currentRevisionId);
  const store = Revisions.useStore();

  return useMemo(() => {
    if (!store.getState().currentRevision) {
      return null;
    }

    return new BaseEntityWrapper(store, []);
  }, [currentRevisionId]);
}
