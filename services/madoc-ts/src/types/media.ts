import { Pagination } from './schemas/_pagination';

export type CreateMediaRow = {
  fileName: string;
  displayName?: string;
  group?: {
    name: string;
    order?: number;
  };
  hashtags?: string[];
  thumbnails?: {
    [key: string]: string;
  };
  size: number;
  ingester: string;
  renderer: string;
  extension: string;
  source: string;
  external?: boolean;
  metadata?: MediaMetadata;
};

export type MediaSnippet = {
  id: string;
  fileName: string;
  displayName?: string;
  hashtags?: string[];
  publicLink: string;
  thumbnail: string;
  modified: number;
  size: number;
};

type MediaMetadata = any & {
  height?: number;
  width?: number;
};

export type MediaItem = {
  id: string;
  publicLink: string;
  publicFolder: string;
  thumbnail?: string;
  created: number;
  modified: number;
  metadata?: MediaMetadata;
} & CreateMediaRow;

export type MediaRow = {
  id: string;
  site_id: number;
  file_name: string;
  display_name: string;
  extension: string;
  group_name?: string;
  group_order?: number;
  hashtags?: string[];
  thumbnails?: {
    [key: string]: string;
  };
  size: number;
  ingester: string;
  renderer: string;
  source: string;
  external?: boolean;
  frozen: boolean;
  created: number;
  modified: number;
  author_id: string;
  author_name: string;
  metadata?: MediaMetadata;
};

export type MediaListResponse = {
  mediaItems: MediaSnippet[];
  pagination: Pagination;
};
