import { Revisions } from '@capture-models/editor';
import { useCallback } from 'react';
import { useCurrentEntity } from './use-current-entity';

export function useManagePropertyList(property: string) {
  const [entity, { path }] = useCurrentEntity();

  const fields = entity.properties[property];
  const label = fields[0].label;
  const allowMultiple = Boolean(fields[0] ? fields[0].allowMultiple : false);
  const { createNewEntityInstance, createNewFieldInstance } = Revisions.useStoreActions(a => ({
    createNewEntityInstance: a.createNewEntityInstance,
    createNewFieldInstance: a.createNewFieldInstance,
  }));

  const createNewEntity = useCallback(() => {
    createNewEntityInstance({ property, path: path as any });
  }, [createNewEntityInstance, path, property]);

  const createNewField = useCallback(() => {
    createNewFieldInstance({ property, path: path as any });
  }, [createNewFieldInstance, path, property]);

  return {
    label,
    allowMultiple,
    createNewEntity,
    createNewField,
  };
}
