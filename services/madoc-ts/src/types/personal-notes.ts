import { InternationalString } from '@iiif/presentation-3';
import { Pagination } from './schemas/_pagination';

export type PersonalNotesRow = {
  id: string;
  type: string;
  note: string;
  project_id: number;
  user_id: number;
  resource_id: number;
  site_id: number;
};

export type NoteListRow = {
  personal_notes__id: string;
  personal_notes__note: string;
  personal_notes__type: string;
  iiif__id: number;
  iiif__type: string;
  iiif__thumbnail: string | null;
  iiif__label_language: string;
  iiif__label_value: string;
} & (
  | {
      iiif_parent__id: number;
      iiif_parent__type: string;
      iiif_parent__thumbnail: string | null;
      iiif_parent__label_language: string;
      iiif_parent__label_value: string;
    }
  | Record<string, never>
);

export type NoteListItem = {
  id: string;
  type: string;
  note: string;
  resource: {
    id: number;
    type: string;
    thumbnail: string | null;
    label: InternationalString;
  };
  parentResource?: {
    id: number;
    type: string;
    thumbnail: string | null;
    label: InternationalString;
  };
};

export type NoteListMap = {
  [id: string]: NoteListItem;
};

export type NoteListResponse = {
  notes: NoteListItem[];
  pagination: Pagination;
};
