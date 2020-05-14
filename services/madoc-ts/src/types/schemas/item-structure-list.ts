import { InternationalString } from '@hyperion-framework/types';

export type ItemStructureListItem = {
  id: number;
  label: InternationalString;
  thumbnail?: string;
};

export type ItemStructureList = {
  items: ItemStructureListItem[];
};

export type UpdateStructureList = {
  item_ids: number[];
};
