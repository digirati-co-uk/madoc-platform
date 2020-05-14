export type Media = {
  id: number;
  item_id: number;
  ingester: string;
  renderer: string;
  data?: string;
  source?: string;
  media_type?: string;
  storage_id?: string;
  extension?: string;
  sha256?: string;
  has_original: number;
  has_thumbnails: number;
  position: number;
  lang?: string;
  size: number;
};
