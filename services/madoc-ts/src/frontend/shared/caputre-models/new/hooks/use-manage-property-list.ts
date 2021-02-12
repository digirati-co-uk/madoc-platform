import { Revisions } from '@capture-models/editor';
import { useCallback } from 'react';
import { useSlotContext } from '../components/EditorSlots';
import { useCurrentEntity } from './use-current-entity';

export function useManagePropertyList(property: string) {
  const { configuration } = useSlotContext();
  const [entity, { path }] = useCurrentEntity();

  const fields = entity.properties[property];
  const label = fields[0].label;
  const allowMultiple = Boolean(fields[0] ? fields[0].allowMultiple : false);
  const { createNewEntityInstance, createNewFieldInstance, removeInstance } = Revisions.useStoreActions(a => ({
    createNewEntityInstance: a.createNewEntityInstance,
    createNewFieldInstance: a.createNewFieldInstance,
    removeInstance: a.removeInstance,
  }));

  const createNewEntity = useCallback(() => {
    if (configuration.allowEditing) {
      createNewEntityInstance({ property, path: path as any });
    }
  }, [configuration.allowEditing, createNewEntityInstance, path, property]);

  const createNewField = useCallback(() => {
    if (configuration.allowEditing) {
      createNewFieldInstance({ property, path: path as any });
    }
  }, [configuration.allowEditing, createNewFieldInstance, path, property]);

  const removeItem = useCallback(
    (id: string) => {
      if (configuration.allowEditing) {
        try {
          removeInstance({ path: [...path, [property, id]] as any });
        } catch (e) {
          // Possible race condition.
          console.error(e);
        }
      }
    },
    [configuration.allowEditing, path, property, removeInstance]
  );

  const canRemove = fields.length > 1 && configuration.allowEditing;

  return {
    label,
    allowMultiple,
    canRemove,
    canAdd: configuration.allowEditing,
    removeItem,
    createNewEntity,
    createNewField,
  };
}
