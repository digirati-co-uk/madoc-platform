import { ItemStructureListItem } from '../../../types/schemas/item-structure-list';
import { useEffect, useMemo, useState } from 'react';
import { InternationalString } from '@hyperion-framework/types';
import { useMutation } from 'react-query';

export function useReorderItems({
  items,
  saveOrder,
}: {
  items?: ItemStructureListItem[];
  saveOrder: (newOrder: number[]) => void | Promise<void>;
}) {
  const [itemIds, setItemIds] = useState<number[]>([]); // Disable SSR.
  const [additionalItems, setAdditionalItems] = useState<ItemStructureListItem[]>([]);
  const [toBeRemoved, setToBeRemoved] = useState<number[]>([]); // Disable SSR.
  const [unsaved, setUnsaved] = useState(false);
  const [saving, setIsSaving] = useState(false);

  const itemMap = useMemo<{
    [id: string]: { id: number; type?: string; label: InternationalString; thumbnail?: string };
  }>(() => {
    if (items) {
      const ret: any = {};
      for (const item of items) {
        ret[`${item.id}`] = item;
      }
      for (const additionalItem of additionalItems) {
        ret[`${additionalItem.id}`] = additionalItem;
      }
      return ret;
    }
    return {};
  }, [additionalItems, items]);

  const [updateOrder] = useMutation(async (newOrder: number[]) => {
    setIsSaving(true);

    await saveOrder(newOrder);

    setUnsaved(false);
    setIsSaving(false);
    setToBeRemoved([]);
    setAdditionalItems([]);
  });

  const updateIdList = (ids: any) => {
    setUnsaved(true);
    setItemIds(ids);
  };

  const reorderItems = (source: number, dest: number) => {
    updateIdList((list: number[]) => {
      const result = Array.from(list);
      const [removed] = result.splice(source, 1);
      result.splice(dest, 0, removed);
      return result;
    });
  };

  const removeItem = (itemId: number) => {
    setToBeRemoved(r => [...r, itemId]);
    setItemIds(s => s.filter(id => id !== itemId));
    setUnsaved(true);
  };

  const addItem = (itemId: number) => {
    setToBeRemoved(r => r.filter(id => id !== itemId));
    setItemIds(s => [...s, itemId]);
    setUnsaved(true);
  };

  const addNewItem = (item: ItemStructureListItem) => {
    setAdditionalItems(i => [...i, item]);
    addItem(item.id);
    setItemIds(ids => (ids.indexOf(item.id) === -1 ? [...ids, item.id] : ids));
  };

  const toBeAdded = useMemo(() => {
    return additionalItems.map(item => item.id);
  }, [additionalItems]);

  useEffect(() => {
    if (unsaved) {
      // Don't update the item ids if we are in the middle of saving.
      return;
    }

    if (items) {
      setItemIds(items.map(r => r.id));
    }
  }, [unsaved, items]);

  return {
    unsaved,
    saving,
    updateOrder,
    itemIds,
    itemMap,
    toBeRemoved,
    toBeAdded,
    additionalItems,
    reorderItems,
    removeItem,
    addItem,
    addNewItem,
  };
}
