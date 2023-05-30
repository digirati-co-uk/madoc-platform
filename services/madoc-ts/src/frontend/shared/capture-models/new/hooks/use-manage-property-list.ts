import { useCallback } from 'react';
import { Revisions } from '../../editor/stores/revisions/index';
import { useSlotContext } from '../components/EditorSlots';
import { useCurrentEntity } from './use-current-entity';

export function useManagePropertyList(property: string) {
  const { configuration } = useSlotContext();
  const [entity, { path }] = useCurrentEntity();

  const fields = entity.properties[property];
  const label = fields[0].label;
  const allowMultiple = Boolean(fields[0] ? fields[0].allowMultiple : false);
  const maxMultiple = fields[0] ? fields[0].maxMultiple : null;
  const { createNewEntityInstance, createNewFieldInstance, removeInstance } = Revisions.useStoreActions(a => ({
    createNewEntityInstance: a.createNewEntityInstance,
    createNewFieldInstance: a.createNewFieldInstance,
    removeInstance: a.removeInstance,
  }));
  const canAddAnother = Boolean(maxMultiple && maxMultiple > fields.length);

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
        if (fields.length <= 1) {
          if (fields[0].type === 'entity') {
            createNewEntityInstance({ property, path: path as any });
          } else {
            createNewFieldInstance({ property, path: path as any });
          }
        }
        if (id) {
          try {
            removeInstance({ path: [...path, [property, id]] as any });
          } catch (e) {
            // Possible race condition.
            console.error(e);
          }
        }
      }
    },
    [configuration.allowEditing, createNewFieldInstance, fields.length, path, property, removeInstance]
  );

  return {
    label,
    allowMultiple,
    canAddAnother,
    canRemove: configuration.allowEditing,
    canAdd: configuration.allowEditing,
    removeItem,
    createNewEntity,
    createNewField,
  };
}
