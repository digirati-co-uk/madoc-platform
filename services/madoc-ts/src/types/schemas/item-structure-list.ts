import { InternationalString } from '@hyperion-framework/types';

export type ItemStructureListItem = {
  id: number;
  type?: string;
  label: InternationalString;
  thumbnail?: string;
};

export type ItemStructureList = {
  items: ItemStructureListItem[];
  originals?: ItemStructureListItem[];
};

export type UpdateStructureList = {
  item_ids: number[];
};
